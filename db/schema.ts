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
  phone: varchar("phone").unique(),
  age: integer("age"),
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
