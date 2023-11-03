import express from "express";
import {
  destroy,
  index,
  show,
  store,
  update,
} from "../controllers/post.controller.js";
import { authenticate } from "../middlewares/authenticate.midleware.js";

const router = express.Router();

router.get("/:subreddit", index);
router.get("/:subreddit/:post", show);
router.post("/:subreddit", authenticate, store);
router.put("/:subreddit/:post", authenticate, update);
router.delete("/:subreddit/:post", authenticate, destroy);

export default router;
