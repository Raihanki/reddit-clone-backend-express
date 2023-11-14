import express from "express";
import {
  login,
  logout,
  refreshToken,
  register,
} from "../controllers/auth.controller.js";
import { authenticate } from "../middlewares/authenticate.midleware.js";
import { requireAuth } from "../middlewares/requireAuth.middleware.js";

const router = express.Router();

router.post("/register", register);

router.post("/login", login);

router.post("/refresh-token", refreshToken);

router.post("/logout", [authenticate, requireAuth], logout);

export default router;
