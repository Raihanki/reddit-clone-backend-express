import express from "express";
import {
  destroy,
  index,
  show,
  store,
  update,
} from "../controllers/subreddit.controller.js";
import { authenticate } from "../middlewares/authenticate.midleware.js";
import { requireAuth } from "../middlewares/requireAuth.middleware.js";

const router = express.Router();

router.get("/", authenticate, index);
router.get("/:slug", authenticate, show);
router.post("/", [authenticate, requireAuth], store);
router.put("/:slug", [authenticate, requireAuth], update);
router.delete("/:slug", [authenticate, requireAuth], destroy);

export default router;
