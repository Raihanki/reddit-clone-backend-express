import prisma from "../config/database.js";
import commentValidation from "../validations/comment.validation.js";

export const index = async (req, res, next) => {};

export const show = async (req, res, next) => {};

export const store = async (req, res, next) => {
  try {
    const data = await commentValidation.validateAsync(req.body);
    const subreddit = await prisma.subreddit.findUnique({
      where: { slug: req.params.subreddit },
    });
    if (!subreddit) {
      throw createHttpError.NotFound("Subreddit not found");
    }

    const post = await prisma.post.findUnique({
      where: { slug: req.params.post },
    });
    if (!post) {
      throw createHttpError.NotFound("Post not found");
    }

    data.userId = req.user.id;
    data.postId = post.id;
    data.parentId = data.parentId || null;

    const comment = await prisma.comment.create({ data });
    res.status(201).json({
      status: 201,
      message: "Comment created successfully",
      data: comment,
    });
  } catch (err) {
    if (err.isJoi === true) err.status = 422;
    next(err);
  }
};

export const update = async (req, res, next) => {
  try {
    const data = await commentValidation.validateAsync(req.body);

    const comment = await prisma.comment.findUnique({
      where: { id: req.params.comment },
    });
    if (!comment) {
      throw createHttpError.NotFound("Comment not found");
    }

    const subreddit = await prisma.subreddit.findUnique({
      where: { slug: req.params.subreddit },
    });
    if (!subreddit) {
      throw createHttpError.NotFound("Subreddit not found");
    }

    const post = await prisma.post.findUnique({
      where: { slug: req.params.post },
    });
    if (!post) {
      throw createHttpError.NotFound("Post not found");
    }

    if (comment.userId !== req.user.id) {
      throw createHttpError.Forbidden("You are not allowed to do this action");
    }

    data.userId = req.user.id;
    data.postId = post.id;
    data.parentId = data.parentId || null;

    const editedComment = await prisma.comment.update({
      where: { id: req.params.comment },
      data,
    });

    res.status(200).json({
      status: 200,
      message: "Comment updated successfully",
      data: editedComment,
    });
  } catch (err) {
    if (err.isJoi === true) err.status = 422;
    next(err);
  }
};

export const destroy = async (req, res, next) => {
  try {
    const comment = await prisma.comment.findUnique({
      where: { id: req.params.comment },
    });
    if (!comment) {
      throw createHttpError.NotFound("Comment not found");
    }

    const subreddit = await prisma.subreddit.findUnique({
      where: { slug: req.params.subreddit },
    });
    if (!subreddit) {
      throw createHttpError.NotFound("Subreddit not found");
    }

    const post = await prisma.post.findUnique({
      where: { slug: req.params.post },
    });
    if (!post) {
      throw createHttpError.NotFound("Post not found");
    }

    if (comment.userId !== req.user.id) {
      throw createHttpError.Forbidden("You are not allowed to do this action");
    }

    await prisma.comment.delete({
      where: { id: req.params.comment },
    });

    res.status(200).json({
      status: 200,
      message: "Comment deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};
