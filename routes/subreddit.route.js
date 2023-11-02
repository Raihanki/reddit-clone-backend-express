import express from "express";
import {
  destroy,
  index,
  store,
  update,
} from "../controllers/subreddit.controller.js";
import { authenticate } from "../middlewares/authenticate.midleware.js";

const router = express.Router();

router.get("/", index);
router.post("/", authenticate, store);
router.put("/:slug", authenticate, update);
router.delete("/:slug", authenticate, destroy);

export default router;
