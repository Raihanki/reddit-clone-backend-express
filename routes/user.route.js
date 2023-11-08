import express from "express";
import { authenticate } from "../middlewares/authenticate.midleware.js";
import { mySubreddit } from "../controllers/user.controller.js";

const router = express.Router();

router.post("/", authenticate, (req, res) => res.json({ user: req.user }));
router.get("/subreddits", authenticate, mySubreddit);

export default router;
