import { login, verify_otp, register } from "../controllers/auth";
import { Router } from "express";
import { isUserAuthenticated } from "../middlewares/isKarmaUserAuthenticated";

const router = Router();

router.post("/login", login);
router.post("/verify_otp", verify_otp);
router.post("/register", isUserAuthenticated, register);

export default router;
