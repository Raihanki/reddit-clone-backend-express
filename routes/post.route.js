import express from "express";
import {
  destroy,
  index,
  show,
  store,
  update,
  getAllPost,
  getMyPost,
} from "../controllers/post.controller.js";
import {
  store as storeComment,
  update as updateComment,
  destroy as deleteComment,
} from "../controllers/comment.controller.js";
import { authenticate } from "../middlewares/authenticate.midleware.js";

const router = express.Router();

router.get("/", getAllPost);
router.get("/myPost", authenticate, getMyPost);
router.get("/:subreddit", index);
router.get("/:subreddit/:post", show);
router.post("/:subreddit", authenticate, store);
router.post("/:subreddit/:post/comments", authenticate, storeComment);
router.put("/:subreddit/:post", authenticate, update);
router.put("/:subreddit/:post/comments/:comment", authenticate, updateComment);
router.delete("/:subreddit/:post", authenticate, destroy);
router.delete(
  "/:subreddit/:post/comments/:comment",
  authenticate,
  deleteComment
);

export default router;
