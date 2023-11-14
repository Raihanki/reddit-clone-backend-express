import express from "express";
import { authenticate } from "../middlewares/authenticate.midleware.js";
import { mySubreddit } from "../controllers/user.controller.js";
import { requireAuth } from "../middlewares/requireAuth.middleware.js";

const router = express.Router();

router.post("/", [authenticate, requireAuth], (req, res) =>
  res.json({ user: req.user })
);
router.get("/subreddits", [authenticate, requireAuth], mySubreddit);

export default router;
