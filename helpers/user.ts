import { User } from "../types";
import { users } from "../db/schema";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq } from "drizzle-orm";
import { config } from "../config";
import { customAlphabet } from "nanoid";

const queryClient = postgres(config.db);
const db = drizzle(queryClient);

const nanoid = customAlphabet("qwertyuiopasdfghjklzxcvbnm", 10);

export const createUser = async (user: User) => {
  user.kid = nanoid().toLowerCase();
  try {
    await db.insert(users).values(user).execute();
  } catch (error) {
    console.error(error);
  }
};

export const getUser = async (email: string) => {
  try {
    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .execute();
    return user[0];
  } catch (error) {
    console.error(error);
  }
};

export const updateUser = async (user: User) => {
  try {
    await db
      .update(users)
      .set(user)
      .where(eq(users.email, user.email))
      .execute();
  } catch (error) {
    console.error(error);
  }
};
