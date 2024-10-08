import {
  conversationController,
  createAiAnswerController,
  createAiQuestionController,
  createAiSettingsController,
  getAiAnswersController,
  getAiSettingsController,
  getAiQuestionsController,
  updateAiSettingsController,
} from "../controllers/ai";
import { Router } from "express";
import { isUserAuthenticated } from "../middlewares/isKarmaUserAuthenticated";

const router = Router();

router.post(
  "/create_ai_settings",
  isUserAuthenticated,
  createAiSettingsController,
);
router.get("/get_ai_settings", isUserAuthenticated, getAiSettingsController);
router.post(
  "/update_ai_settings",
  isUserAuthenticated,
  updateAiSettingsController,
);
router.post(
  "/create_ai_question",
  isUserAuthenticated,
  createAiQuestionController,
);
router.get("/get_ai_questions", isUserAuthenticated, getAiQuestionsController);
router.post("/create_ai_answer", isUserAuthenticated, createAiAnswerController);
router.get("/get_ai_answers", isUserAuthenticated, getAiAnswersController);
router.post("/conversation", isUserAuthenticated, conversationController);

export default router;
