import { desc, sql } from "drizzle-orm";
import {
  char,
  pgTable,
  varchar,
  index,
  timestamp,
  text,
  json,
  boolean,
  integer,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  kid: varchar("kid").primaryKey(),
  username: varchar("username").unique(),
  full_name: varchar("full_name"),
  email: varchar("email").unique(),
  phone: varchar("phone"),
  age: integer("age"),
  date_of_birth: varchar("date_of_birth"),
  gender: varchar("gender"),
  location: varchar("location"),
  country: varchar("country"),
  languages: json("languages"),
  primary_language: varchar("primary_language"),
  profile_picture: text("profile_picture"),
  gallery: json("gallery"),
  bio: text("bio"),
  social_media: json("social_media"),
});

export const ai_settings = pgTable("ai_settings", {
  id: integer("id").primaryKey(),
  user_id: varchar("user_id").unique(),
  ai_name: varchar("ai_name"),
  ai_slang: varchar("ai_slang"),
});

export const ai_questions = pgTable("ai_questions", {
  id: integer("id").primaryKey(),
  question: text("question"),
  category: varchar("category"),
});

export const ai_answers = pgTable("ai_answers", {
  id: integer("id").primaryKey(),
  question_id: integer("question_id"),
  answer: text("answer"),
  user_id: varchar("user_id"),
});
