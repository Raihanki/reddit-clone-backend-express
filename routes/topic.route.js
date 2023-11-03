import express from "express";
import {
  create,
  index,
  destroy,
  update,
} from "../controllers/topic.controller.js";
import { authenticate } from "../middlewares/authenticate.midleware.js";

const router = express.Router();

router.get("/", index);
router.post("/", authenticate, create);
router.put("/:id", authenticate, update);
router.delete("/:id", authenticate, destroy);

export default router;
