import express from "express";
import { destroy, store, update } from "../controllers/vote.controller.js";
import { authenticate } from "../middlewares/authenticate.midleware.js";
import { requireAuth } from "../middlewares/requireAuth.middleware.js";

const router = express.Router();

router.post("/:post", [authenticate, requireAuth], store);
router.put("/:post", [authenticate, requireAuth], update);
router.delete("/:post", [authenticate, requireAuth], destroy);

export default router;
