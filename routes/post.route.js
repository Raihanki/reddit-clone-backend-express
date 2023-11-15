import express from "express";
import {
  destroy,
  index,
  show,
  store,
  update,
  getAllPost,
  getMyPost,
  getReplyComment,
} from "../controllers/post.controller.js";
import {
  store as storeComment,
  update as updateComment,
  destroy as deleteComment,
} from "../controllers/comment.controller.js";
import { authenticate } from "../middlewares/authenticate.midleware.js";
import { requireAuth } from "../middlewares/requireAuth.middleware.js";

const router = express.Router();

router.get("/", authenticate, getAllPost);
router.get("/myPost", [authenticate], getMyPost);
router.get("/replyComment/:comment", [authenticate], getReplyComment);
router.get("/:subreddit", authenticate, index);
router.get("/:subreddit/:post", authenticate, show);
router.post("/:subreddit", [authenticate, requireAuth], store);
router.post(
  "/:subreddit/:post/comments",
  [authenticate, requireAuth],
  storeComment
);
router.put("/:subreddit/:post", [authenticate, requireAuth], update);
router.put(
  "/:subreddit/:post/comments/:comment",
  [authenticate, requireAuth],
  updateComment
);
router.delete("/:subreddit/:post", [authenticate, requireAuth], destroy);
router.delete(
  "/:subreddit/:post/comments/:comment",
  authenticate,
  deleteComment
);

export default router;
