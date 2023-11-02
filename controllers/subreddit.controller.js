import createHttpError from "http-errors";
import prisma from "../config/database.js";
import createSubredditValidation from "../validations/createSubreddit.validation.js";
import updateSubredditValidation from "../validations/updateSubreddit.validation.js";

export const index = async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  const order = req.query.order || "desc";
  const sort = req.query.sort || "id";
  try {
    const totalRows = await prisma.subreddit.count();
    const subreddits = await prisma.subreddit.findMany({
      skip: offset,
      take: limit,
      orderBy: {
        [sort]: order,
      },
    });

    res.status(200).json({
      status: 200,
      data: subreddits,
      meta: {
        totalRows,
        page,
        limit,
        offset,
        totalPages: Math.ceil(totalRows / limit),
      },
    });
  } catch (err) {
    next(err);
  }
};

export const store = async (req, res, next) => {
  try {
    const data = await createSubredditValidation.validateAsync(req.body);
    const topic = await prisma.topic.findUnique({
      where: { id: data.topicId },
    });
    if (!topic) {
      throw createHttpError.BadRequest("Topic not found");
    }

    data.createdBy = req.user.username;
    data.slug = data.name.toLowerCase().split(" ").join("-");
    const subreddit = await prisma.subreddit.create({ data });
    await prisma.moderators.create({
      data: {
        userId: req.user.id,
        subredditId: subreddit.id,
      },
    });

    res.status(201).json({
      status: 201,
      message: "Subreddit created successfully",
    });
  } catch (err) {
    if (err.isJoi === true) err.status = 422;
    next(err);
  }
};

export const update = async (req, res, next) => {
  const slug = req.params.slug;
  try {
    const data = await updateSubredditValidation.validateAsync(req.body, {
      context: { slug },
    });
    data.slug = data.name.toLowerCase().split(" ").join("-");

    const subreddit = await prisma.subreddit.findUnique({
      where: { slug },
    });
    if (!subreddit) {
      throw createHttpError.NotFound("Subreddit not found");
    }

    await prisma.subreddit.update({
      where: { slug },
      data,
    });

    res.status(200).json({
      status: 200,
      message: "Subreddit updated successfully",
    });
  } catch (err) {
    if (err.isJoi === true) err.status = 422;
    next(err);
  }
};

export const destroy = async (req, res, next) => {
  try {
    const slug = req.params.slug;

    const subreddit = await prisma.subreddit.findUnique({
      where: { slug },
    });
    if (!subreddit) {
      throw createHttpError.NotFound("Subreddit not found");
    }

    await prisma.subreddit.delete({
      where: { slug },
    });

    res.status(200).json({
      status: 200,
      message: "Subreddit deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};
