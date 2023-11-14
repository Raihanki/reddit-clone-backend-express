import express from "express";
import {
  create,
  index,
  destroy,
  update,
} from "../controllers/topic.controller.js";
import { authenticate } from "../middlewares/authenticate.midleware.js";
import { requireAuth } from "../middlewares/requireAuth.middleware.js";

const router = express.Router();

router.get("/", authenticate, index);
router.post("/", [authenticate, requireAuth], create);
router.put("/:id", [authenticate, requireAuth], update);
router.delete("/:id", [authenticate, requireAuth], destroy);

export default router;
