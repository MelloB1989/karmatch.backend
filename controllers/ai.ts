import {
  createAiSettings,
  getAiAnswers,
  getAiSettings,
  getAiQuestions,
  createAiAnswer,
  createAiQuestion,
  updateAiSettings,
  getQuestionsByLevel,
  getAnsweredQuestionIds,
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

  const getAIQuestion = async (user_id: string) => {
    try {
      // Iterate through levels, starting from level 0 up to level 4 (or whatever max level you have)
      for (let level = 0; level <= 4; level++) {
        // Get all questions for the current level
        const questionsAtLevel = await getQuestionsByLevel(level);

        // Get all answered question IDs for this user
        const answeredQuestions = await getAnsweredQuestionIds(user_id);

        if (!answeredQuestions) {
          return null;
        }

        // Extract the question_id from the answered questions
        const answeredQuestionIds = answeredQuestions.map(
          (answeredQuestion) => answeredQuestion.question_id,
        );

        // Filter out the questions that have already been answered
        if (!questionsAtLevel || !answeredQuestionIds) {
          return null;
        }

        const unansweredQuestions = questionsAtLevel.filter(
          (question) => !answeredQuestionIds.includes(question.id),
        );

        // If there are any unanswered questions at this level, return the first one
        if (unansweredQuestions.length > 0) {
          const q = unansweredQuestions[0]; // Return the shortest unanswered question at this level
          await createAiAnswer({
            user_id,
            question_id: q.id,
            answer: "",
            id: "",
          });
          return q;
        }
      }

      // If all questions at all levels have been answered, return null or handle as needed
      return null;
    } catch (error) {
      console.error("Error fetching AI question:", error);
      throw error;
    }
  };

  const analyzeUserTraits = async (response: string) => {
    try {
      const analysis = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `You are an AI that analyzes a user's response to extract their traits and interests. Extract the key interests, personality traits, and preferences of the user based on the following answer:`,
          },
          { role: "user", content: response },
        ],
        max_tokens: 150,
      });

      // Assuming the result contains user traits
      return analysis.choices[0]?.message.content;
    } catch (error) {
      console.error("Error analyzing user traits:", error);
    }
  };

  const { message, ai } = req.body;

  if (!req.verified) {
    return res.status(401).json({ message: "Unauthorized", success: false });
  }

  try {
    // Get a new AI question to ask the user
    const newAIQuestion = await getAIQuestion(req.verified.user_id);

    // Prepare chat history for the LLM (if needed)
    const prev_chat_context = await index.query({
      data: message,
      topK: 10,
      includeData: true,
      includeMetadata: true,
    });
    const filteredMatches = prev_chat_context.filter((match) => {
      return match.metadata?.user_id === req.verified?.user_id;
    });
    const context = filteredMatches.map((match) => match.data).join("\n");

    // Generate a response using OpenAI and include the new question
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are an AI matchmaker for a dating app. The user prefers to speak in English. You will generate a counter question to engage the user based on their response to a specific question. Previous chat context: ${context} Previos AI question: ${ai}`,
        },
        { role: "user", content: message },
        {
          role: "assistant",
          content: `The next question for the user should be: ${newAIQuestion?.question}`,
        },
      ],
      max_tokens: 2000,
      temperature: 0.2,
    });

    // Store the conversation in vector database (for history and traits)
    await index.upsert({
      id: nanoid(),
      data: `user: ${message}\nAI: ${response.choices[0].message.content}`,
      metadata: {
        user_id: req.verified.user_id,
        question_id: newAIQuestion?.id,
      },
    });

    // Analyze user traits in the background
    const userTraits = await analyzeUserTraits(message);
    if (userTraits) {
      await index.upsert({
        id: nanoid(),
        data: `user_traits: ${userTraits}`,
        metadata: { user_id: req.verified.user_id },
      });
    }

    // Send back AI response with counter question to the user
    const ai_message = response.choices[0]?.message.content;
    res.status(200).json({ message: ai_message, success: true });
  } catch (error) {
    console.error("Error in conversationController:", error);
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
  const ai_questions = req.body; // Could be a single object or an array
  try {
    if (!req.verified) {
      return res.status(401).json({ message: "Unauthorized", success: false });
    }

    // Check if it's an array of AiQuestions or a single AiQuestion object
    if (Array.isArray(ai_questions)) {
      // If it's an array, loop through and create each question
      for (const ai_question of ai_questions) {
        await createAiQuestion(ai_question);
      }
    } else {
      // If it's a single AiQuestion object, create it directly
      await createAiQuestion(ai_questions);
    }

    res.status(200).json({ message: "Ai question(s) created", success: true });
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
  const question_id = req.query.question_id;
  try {
    if (!req.verified) {
      return res.status(401).json({ message: "Unauthorized", success: false });
    }
    const ai_answers = await getAiAnswers(question_id?.toString() || "");
    res.status(200).json({ ai_answers, success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
