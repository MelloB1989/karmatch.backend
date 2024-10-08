import * as readline from "readline";
import OpenAI from "openai";
import { Index } from "@upstash/vector";
import { config } from "../config";

const index = new Index({
  url: config.upstash_api,
  token: config.upstash_vector,
});

const openai = new OpenAI({
  apiKey: config.openai_api,
});

// List of random questions to ask the user
const randomQuestions = [
  "What's your favorite hobby?",
  "If you could travel anywhere, where would you go?",
  "What was the last book you read?",
  "What do you enjoy doing in your free time?",
  "What’s your biggest dream in life?",
];

// Function to pick a random question
const getRandomQuestion = (): string => {
  const randomIndex = Math.floor(Math.random() * randomQuestions.length);
  return randomQuestions[randomIndex];
};

// Function to handle AI conversation
const converseWithUser = async (
  userInput: string,
  conversationHistory: string[],
) => {
  // Add user input to conversation history
  conversationHistory.push(`User: ${userInput}`);

  // Prepare conversation prompt
  const conversationPrompt = conversationHistory.join("\n") + "\nAI:";

  // Call GPT-4 API for generating response
  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: `You are a female AI match maker for a dating app. The user prefers to speak in Hinglish (a blend of Hindi and English). Use local Hindi slangs and phrases to make the conversation more engaging. Keep the tone unofficial, be more free with the user, make user feel as you are a best friend.`,
      },
      { role: "user", content: conversationPrompt },
    ],
    max_tokens: 150,
    temperature: 0.7,
  });

  // Extract AI response and update conversation history
  const aiResponse = response.choices[0]["message"].content;
  conversationHistory.push(`AI: ${aiResponse}`);

  // Randomly ask a question to the user
  if (Math.random() < 0.5) {
    // 50% chance to ask a question after each response
    const randomQuestion = getRandomQuestion();
    conversationHistory.push(`AI: ${randomQuestion}`);
  }

  // Return AI response and updated conversation history
  return { aiResponse, conversationHistory };
};

// Setup CLI interface for input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

let conversationHistory: string[] = [];

// Function to handle the conversation loop
const startConversation = () => {
  rl.question("You: ", async (userInput) => {
    try {
      const { aiResponse, conversationHistory: updatedHistory } =
        await converseWithUser(userInput, conversationHistory);

      // Display AI's response
      console.log(`AI: ${aiResponse}`);

      // Display the last question AI asked (if any)
      const lastLine = updatedHistory[updatedHistory.length - 1];
      if (lastLine.startsWith("AI: ") && lastLine !== `AI: ${aiResponse}`) {
        console.log(lastLine);
      }

      // Update the conversation history
      conversationHistory = updatedHistory;

      // Continue the conversation
      startConversation();
    } catch (error) {
      console.error("Error during AI conversation:", error);
      rl.close();
    }
  });
};

// Start the conversation
startConversation();
