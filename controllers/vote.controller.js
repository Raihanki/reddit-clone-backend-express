import createHttpError from "http-errors";
import prisma from "../config/database.js";
import voteValidation from "../validations/vote.validation.js";

export const store = async (req, res, next) => {
  const postId = req.params.post;
  try {
    const data = await voteValidation.validateAsync(req.body);
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
      throw createHttpError.NotFound("Post not found");
    }

    const voted = await prisma.vote.findFirst({
      where: { postId, userId: req.user.id },
    });
    if (voted) {
      throw createHttpError.Conflict("You have already voted");
    }

    data.userId = req.user.id;
    data.postId = post.id;
    const vote = await prisma.vote.create({ data });
    res.status(201).json({
      status: 201,
      message: "Vote created successfully",
      data: vote,
    });
  } catch (err) {
    if (err.isJoi === true) err.status = 422;
    next(err);
  }
};

export const update = async (req, res, next) => {
  const postId = req.params.post;
  try {
    const data = await voteValidation.validateAsync(req.body);
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
      throw createHttpError.NotFound("Post not found");
    }

    const voted = await prisma.vote.findFirst({
      where: { postId, userId: req.user.id },
    });
    if (!voted) {
      throw createHttpError.NotFound("You have not voted yet");
    }

    data.userId = req.user.id;
    data.postId = post.id;

    const vote = await prisma.vote.update({
      data,
      where: { id: voted.id },
    });

    res.status(200).json({
      status: 200,
      message: "Vote updated successfully",
      data: vote,
    });
  } catch (err) {
    if (err.isJoi === true) err.status = 422;
    next(err);
  }
};

export const destroy = async (req, res, next) => {
  const postId = req.params.post;
  try {
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
      throw createHttpError.NotFound("Post not found");
    }

    const voted = await prisma.vote.findFirst({
      where: { postId, userId: req.user.id },
    });
    if (!voted) {
      throw createHttpError.NotFound("You have not voted yet");
    }

    await prisma.vote.delete({ where: { id: voted.id } });
    res.status(200).json({
      status: 200,
      message: "Vote deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};
