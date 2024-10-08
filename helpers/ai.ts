import { AiSettings, AiAnswers, AiQuestions } from "../types";
import { ai_settings, ai_answers, ai_questions } from "../db/schema";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq } from "drizzle-orm";
import { config } from "../config";
import { customAlphabet } from "nanoid";

const queryClient = postgres(config.db);
const db = drizzle(queryClient);

const nanoid = customAlphabet("qwertyuiopasdfghjklzxcvbnm", 10);

export const createAiSettings = async (ai_setting: AiSettings) => {
  ai_setting.user_id = nanoid().toLowerCase();
  try {
    await db.insert(ai_settings).values(ai_setting).execute();
  } catch (error) {
    console.error(error);
  }
};

export const getAiSettings = async (user_id: string) => {
  try {
    const ai_setting = await db
      .select()
      .from(ai_settings)
      .where(eq(ai_settings.user_id, user_id))
      .execute();
    return ai_setting[0];
  } catch (error) {
    console.error(error);
  }
};

export const updateAiSettings = async (ai_setting: AiSettings) => {
  try {
    await db
      .update(ai_settings)
      .set(ai_setting)
      .where(eq(ai_settings.user_id, ai_setting.user_id))
      .execute();
  } catch (error) {
    console.error(error);
  }
};

export const createAiQuestion = async (ai_question: AiQuestions) => {
  try {
    await db.insert(ai_questions).values(ai_question).execute();
  } catch (error) {
    console.error(error);
  }
};

export const getAiQuestions = async () => {
  try {
    return await db.select().from(ai_questions).execute();
  } catch (error) {
    console.error(error);
  }
};

export const createAiAnswer = async (ai_answer: AiAnswers) => {
  try {
    await db.insert(ai_answers).values(ai_answer).execute();
  } catch (error) {
    console.error(error);
  }
};

export const getAiAnswers = async (question_id: number) => {
  try {
    return await db
      .select()
      .from(ai_answers)
      .where(eq(ai_answers.question_id, question_id))
      .execute();
  } catch (error) {
    console.error(error);
  }
};
