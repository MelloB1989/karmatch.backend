CREATE TABLE IF NOT EXISTS "ai_answers" (
	"id" integer PRIMARY KEY NOT NULL,
	"question_id" integer,
	"answer" text,
	"user_id" varchar
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ai_questions" (
	"id" integer PRIMARY KEY NOT NULL,
	"question" text,
	"category" varchar
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ai_settings" (
	"id" integer PRIMARY KEY NOT NULL,
	"user_id" varchar,
	"ai_name" varchar,
	"ai_slang" varchar,
	CONSTRAINT "ai_settings_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "users_phone_unique";