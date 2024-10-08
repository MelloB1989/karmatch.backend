import {
  createAiSettings,
  getAiAnswers,
  getAiSettings,
  getAiQuestions,
  createAiAnswer,
  createAiQuestion,
  updateAiSettings,
} from "../helpers/ai";
import { config } from "../config";
import { AiAnswers, AiQuestions, AiSettings } from "../types";
import { Request, Response } from "express";
import OpenAI from "openai";
import { Index } from "@upstash/vector";
import { customAlphabet } from "nanoid";

const nanoid = customAlphabet("qwertyuiopasdfghjklzxcvbnm", 10);

export const conversationController = async (req: Request, res: Response) => {
  const index = new Index({
    url: config.upstash_api,
    token: config.upstash_vector,
  });

  const openai = new OpenAI({
    apiKey: config.openai_api,
  });

  const get_closest_match = async (message: string) => {
    const rankedMatches = await index.query({
      data: message,
      topK: 10,
      includeMetadata: true,
    });
    const filteredMatches = rankedMatches.filter((match) => {
      return match.metadata?.user_id !== req.verified?.user_id;
    });
    const closestMatchesUserIDs = filteredMatches.map((match) => {
      return match.metadata?.user_id;
    });
    const filteredMatchesUserIDs = closestMatchesUserIDs.filter((match) => {
      return match !== undefined;
    });
    console.log(filteredMatchesUserIDs);
    return filteredMatchesUserIDs;
  };

  const { message } = req.body;
  if (!req.verified) {
    return res.status(401).json({ message: "Unauthorized", success: false });
  }
  try {
    const prev_chat_context = await index.query({
      data: message,
      topK: 10,
      includeData: true,
      includeMetadata: true,
    });
    const filteredMatches = prev_chat_context.filter((match) => {
      return match.metadata?.user_id === req.verified?.user_id;
    });

    const rankedMatches = filteredMatches.sort((a, b) => b.score - a.score);
    const context = rankedMatches.map((match) => {
      return match.data + "\n";
    });
    const contextString = context.join("");
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a female AI match maker for a dating app. The user prefers to speak in Hinglish (a blend of Hindi and English). Use local Hindi slangs and phrases to make the conversation more engaging. Keep the tone unofficial, be more free with the user, make user feel as you are a best friend but keep cringe out, try to get know about user's taste as much as possible, don't repeat any question! User name: ${req.verified.name} age: ${req.verified.age} gender: ${req.verified.gender} Previous chat context: ${contextString}`,
        },
        { role: "user", content: message },
      ],
      max_tokens: 2000,
      temperature: 0.2,
    });
    console.log(contextString);
    const ai_message = response.choices[0]["message"].content;
    await index.upsert({
      id: nanoid(),
      data: `user: ${message}
      AI: ${response.choices[0]["message"].content}`,
      metadata: { user_id: req.verified.user_id },
    });
    get_closest_match(
      `user: ${message} AI: ${response.choices[0]["message"].content}`,
    );
    res.status(200).json({ response, success: true, ai_message });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createAiSettingsController = async (
  req: Request,
  res: Response,
) => {
  const ai_setting: AiSettings = req.body;
  try {
    if (!req.verified) {
      return res.status(401).json({ message: "Unauthorized", success: false });
    }
    await createAiSettings(ai_setting);
    res.status(200).json({ message: "Ai settings created", success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getAiSettingsController = async (req: Request, res: Response) => {
  try {
    if (!req.verified) {
      return res.status(401).json({ message: "Unauthorized", success: false });
    }
    const ai_setting = await getAiSettings(req.verified.user_id);
    res.status(200).json({ ai_setting, success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateAiSettingsController = async (
  req: Request,
  res: Response,
) => {
  const ai_setting: AiSettings = req.body;
  try {
    if (!req.verified) {
      return res.status(401).json({ message: "Unauthorized", success: false });
    }
    await updateAiSettings(ai_setting);
    res.status(200).json({ message: "Ai settings updated", success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createAiQuestionController = async (
  req: Request,
  res: Response,
) => {
  const ai_question: AiQuestions = req.body;
  try {
    if (!req.verified) {
      return res.status(401).json({ message: "Unauthorized", success: false });
    }
    await createAiQuestion(ai_question);
    res.status(200).json({ message: "Ai question created", success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getAiQuestionsController = async (req: Request, res: Response) => {
  try {
    if (!req.verified) {
      return res.status(401).json({ message: "Unauthorized", success: false });
    }
    const ai_questions = await getAiQuestions();
    res.status(200).json({ ai_questions, success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createAiAnswerController = async (req: Request, res: Response) => {
  const ai_answer: AiAnswers = req.body;
  try {
    if (!req.verified) {
      return res.status(401).json({ message: "Unauthorized", success: false });
    }
    await createAiAnswer(ai_answer);
    res.status(200).json({ message: "Ai answer created", success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getAiAnswersController = async (req: Request, res: Response) => {
  const question_id = Number(req.query.question_id);
  try {
    if (!req.verified) {
      return res.status(401).json({ message: "Unauthorized", success: false });
    }
    const ai_answers = await getAiAnswers(question_id);
    res.status(200).json({ ai_answers, success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
