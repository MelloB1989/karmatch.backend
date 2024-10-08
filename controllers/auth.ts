import { createUser, getUser } from "../helpers/user";
import { User } from "../types";
import { config } from "../config";
import { send_mail } from "../lib/mails/mg_mailer";
import { Request, Response } from "express";
import { Redis } from "@upstash/redis";
import jwt from "jsonwebtoken";

export const login = async (req: Request, res: Response) => {
  const { email } = req.body;
  // Check email regex
  if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    return res.status(400).json({ message: "Invalid email", success: false });
  }
  try {
    const user = await getUser(email);
    const redis = new Redis({
      url: config.redis_url,
      token: config.redis_token,
    });
    const otp = Math.floor(100000 + Math.random() * 900000);
    await redis.set(`karmatch_otp:${email}`, {
      otp: otp.toString(),
      account_exists: !!user,
      user_id: user?.kid,
      age: user?.age,
      name: user?.full_name,
      gender: user?.gender,
    });
    await send_mail(
      email,
      "Karmatch OTP for login",
      `Your OTP is ${otp}`,
      `<h1>Your OTP is ${otp}</h1>`,
    );
    res
      .status(200)
      .json({ message: "OTP sent", success: true, account_exists: !!user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const verify_otp = async (req: Request, res: Response) => {
  const { email, otp } = req.body;
  try {
    const redis = new Redis({
      url: config.redis_url,
      token: config.redis_token,
    });
    const stored_otp: {
      otp: string;
      account_exists: boolean;
      user_id: string;
      age: number;
      gender: string;
      name: string;
    } | null = await redis.get(`karmatch_otp:${email}`);
    if (stored_otp && stored_otp.otp === otp) {
      const token = jwt.sign(
        {
          email,
          user_id: stored_otp.user_id,
          age: stored_otp.age,
          name: stored_otp.name,
          gender: stored_otp.gender,
        },
        config.jwt_secret,
        {
          expiresIn: "30d",
        },
      );
      //redis.del(`karmatch_otp:${email}`);
      res.status(200).json({
        message: "OTP verified",
        success: true,
        account_exists: stored_otp.account_exists,
        token,
      });
    } else {
      res
        .status(400)
        .json({ message: "OTP verification failed", success: false });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const register = async (req: Request, res: Response) => {
  const user: User = req.body;
  if (!req.verified) {
    return res.status(401).json({ message: "Unauthorized", success: false });
  }
  try {
    await createUser(user);
    res.status(200).json({ message: "User created", success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
