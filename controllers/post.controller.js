import createHttpError from "http-errors";
import prisma from "../config/database.js";
import postValidation from "../validations/post.validation.js";

export const index = async (req, res, next) => {
  try {
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;
    const offset = (page - 1) * limit;
    const order = req.query.order || "desc";
    const sort = req.query.sort || "createdAt";

    const posts = await prisma.post.findMany({
      skip: offset,
      take: limit,
      orderBy: {
        [sort]: order,
      },
      include: {
        subreddit: {
          select: { id: true, name: true, slug: true },
          where: {
            AND: [{ isPublic: true }, { slug: req.params.subreddit }],
          },
        },
        user: {
          select: { id: true, username: true },
        },
      },
    });
    const postCount = await prisma.post.count();

    res.status(200).json({
      status: 200,
      data: posts,
      meta: {
        totalRows: postCount,
        page,
        limit,
        offset,
        totalPages: Math.ceil(postCount / limit),
      },
    });
  } catch (err) {
    next(err);
  }
};

export const show = async (req, res, next) => {
  try {
    const subredditSlug = req.params.subreddit;
    const postSlug = req.params.post;

    const post = await prisma.post.findUnique({
      where: { slug: postSlug },
      include: {
        subreddit: {
          select: { id: true, name: true, slug: true },
          where: {
            AND: [{ isPublic: true }, { slug: subredditSlug }],
          },
        },
        user: {
          select: { id: true, username: true, profilePicture: true },
        },
      },
    });

    if (!post) {
      throw createHttpError.NotFound("Post not found");
    }

    res.status(200).json({
      status: 200,
      data: post,
    });
  } catch (err) {
    next(err);
  }
};

export const store = async (req, res, next) => {
  try {
    const data = await postValidation.validateAsync(req.body);
    const subreddit = await prisma.subreddit.findUnique({
      where: { slug: req.params.subreddit },
    });
    if (!subreddit) {
      throw createHttpError.NotFound("Subreddit not found");
    }

    data.subredditId = subreddit.id;
    data.userId = req.user.id;
    data.slug =
      data.title.toLowerCase().split(" ").join("-") + "-" + Date.now();

    const post = await prisma.post.create({ data });
    res.status(201).json({
      status: 201,
      message: "Post created successfully",
      data: post,
    });
  } catch (err) {
    if (err.isJoi === true) err.status = 422;
    next(err);
  }
};

export const update = async (req, res, next) => {
  try {
    const data = await postValidation.validateAsync(req.body);

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

    if (post.userId !== req.user.id) {
      throw createHttpError.Forbidden("You are not allowed to do this action");
    }

    data.subredditId = subreddit.id;
    data.userId = req.user.id;
    data.slug =
      data.title.toLowerCase().split(" ").join("-") + "-" + Date.now();

    const updatedPost = await prisma.post.update({
      where: { slug: req.params.post },
      data,
    });

    res.status(200).json({
      status: 200,
      message: "Post updated successfully",
      data: updatedPost,
    });
  } catch (err) {
    if (err.isJoi === true) err.status = 422;
    next(err);
  }
};

export const destroy = async (req, res, next) => {
  try {
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

    if (post.userId !== req.user.id) {
      throw createHttpError.Forbidden("You are not allowed to do this action");
    }

    await prisma.post.delete({
      where: { slug: req.params.post },
    });

    res.status(200).json({
      status: 200,
      message: "Post deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};
