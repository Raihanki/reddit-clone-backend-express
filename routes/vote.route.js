import express from "express";
import { destroy, store, update } from "../controllers/vote.controller.js";
import { authenticate } from "../middlewares/authenticate.midleware.js";

const router = express.Router();

router.post("/:post", authenticate, store);
router.put("/:post", authenticate, update);
router.delete("/:post", authenticate, destroy);

export default router;
