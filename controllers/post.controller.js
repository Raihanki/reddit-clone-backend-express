import createHttpError from "http-errors";
import prisma from "../config/database.js";
import postValidation from "../validations/post.validation.js";
import { authenticate } from "../middlewares/authenticate.midleware.js";

export const getAllPost = async (req, res, next) => {
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
          where: { isPublic: true },
        },
        user: {
          select: { id: true, username: true },
        },
        votes: {
          select: { voteType: true },
        },
        comments: {
          select: { id: true },
        },
      },
    });
    const postCount = await prisma.post.count();

    posts.forEach((post) => {
      const upVotes = post.votes.filter(
        (vote) => vote.voteType === "up"
      ).length;
      const downVotes = post.votes.filter(
        (vote) => vote.voteType === "down"
      ).length;
      const comment = post.comments.length;
      post.upVotes = upVotes;
      post.downVotes = downVotes;
      post.commentCount = comment;
      delete post.votes;
    });

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

export const getMyPost = async (req, res, next) => {
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
      where: { userId: req.user.id },
      include: {
        subreddit: {
          select: { id: true, name: true, slug: true },
          where: { isPublic: true },
        },
        user: {
          select: { id: true, username: true },
        },
        votes: {
          select: { voteType: true },
        },
        comments: {
          select: { id: true },
        },
      },
    });
    const postCount = await prisma.post.count();

    posts.forEach((post) => {
      const upVotes = post.votes.filter(
        (vote) => vote.voteType === "up"
      ).length;
      const downVotes = post.votes.filter(
        (vote) => vote.voteType === "down"
      ).length;
      const comment = post.comments.length;
      post.upVotes = upVotes;
      post.downVotes = downVotes;
      post.commentCount = comment;
      delete post.votes;
    });

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

export const index = async (req, res, next) => {
  try {
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;
    const offset = (page - 1) * limit;
    const order = req.query.order || "desc";
    const sort = req.query.sort || "createdAt";

    const subreddit = await prisma.subreddit.findUnique({
      where: { slug: req.params.subreddit },
    });

    const posts = await prisma.post.findMany({
      skip: offset,
      take: limit,
      orderBy: {
        [sort]: order,
      },
      where: { subredditId: subreddit.id },
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
        votes: {
          select: { voteType: true },
        },
      },
    });
    const postCount = await prisma.post.count();

    posts.forEach((post) => {
      const upVotes = post.votes.filter(
        (vote) => vote.voteType === "up"
      ).length;
      const downVotes = post.votes.filter(
        (vote) => vote.voteType === "down"
      ).length;
      post.upVotes = upVotes;
      post.downVotes = downVotes;
      delete post.votes;
    });

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
        comments: {
          include: {
            user: {
              select: { id: true, username: true, profilePicture: true },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        subreddit: {
          select: { id: true, name: true, slug: true, createdBy: true },
          where: {
            AND: [{ isPublic: true }, { slug: subredditSlug }],
          },
        },
        user: {
          select: { id: true, username: true, profilePicture: true },
        },
        votes: {
          select: { voteType: true },
        },
      },
    });

    // console.log(await authenticate(req, res, next));
    if (req.user) {
      const myVote = await prisma.vote.findFirst({
        where: {
          AND: [{ userId: req.user.id }, { postId: post.id }],
        },
      });
      if (!myVote) {
        post.myVote = null;
      } else {
        post.myVote = myVote.voteType;
      }
    } else {
      post.myVote = null;
    }

    if (!post) {
      throw createHttpError.NotFound("Post not found");
    }

    const upVotes = post.votes.filter((vote) => vote.voteType === "up").length;
    const commentCount = post.comments.length;
    const downVotes = post.votes.filter(
      (vote) => vote.voteType === "down"
    ).length;
    post.upVotes = upVotes;
    post.downVotes = downVotes;
    post.commentCount = commentCount;
    delete post.votes;

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

export const getReplyComment = async (req, res, next) => {
  try {
    const replies = await prisma.comment.findMany({
      where: { parentId: req.params.comment },
      include: {
        user: {
          select: { id: true, username: true, profilePicture: true },
        },
      },
    });
    res.status(200).json({
      status: 200,
      data: replies,
    });
  } catch (err) {
    next(err);
  }
};
