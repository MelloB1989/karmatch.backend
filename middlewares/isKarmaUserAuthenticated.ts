import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config";

declare global {
  namespace Express {
    interface Request {
      verified?: jwt.JwtPayload;
    }
  }
}

export const isUserAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers["authorization"];
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    try {
      const verified = jwt.verify(token, config.jwt_secret) as jwt.JwtPayload;
      if (verified) {
        req.verified = verified;
        next();
      }
    } catch (e) {
      res.status(401).json({ message: "Unauthorized" });
    }
  } else {
    res.status(401).json({ message: "Unauthorized: No Authorization Header" });
  }
  //next();
};
