import createHttpError from "http-errors";
import prisma from "../config/database.js";
import createSubredditValidation from "../validations/createSubreddit.validation.js";
import updateSubredditValidation from "../validations/updateSubreddit.validation.js";
import { v2 as cloudinary } from "cloudinary";
import { validateMIMEType } from "validate-image-type";

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
      include: {
        topic: {
          select: { id: true, title: true, slug: true },
        },
      },
    });

    subreddits.map((s) => {
      s.avatar = s.avatar
        ? `https://res.cloudinary.com/dvyru6uni/image/upload/v1699947307/${s.avatar}`
        : null;
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

export const show = async (req, res, next) => {
  try {
    const slug = req.params.slug;
    const subreddit = await prisma.subreddit.findUnique({
      where: { slug },
      include: {
        topic: {
          select: { id: true, title: true, slug: true },
        },
      },
    });

    if (!subreddit) {
      throw createHttpError.NotFound("Subreddit not found");
    }

    subreddit.avatar = subreddit.avatar
      ? `https://res.cloudinary.com/dvyru6uni/image/upload/v1699947307/${subreddit.avatar}`
      : null;
    res.status(200).json({
      status: 200,
      data: subreddit,
    });
  } catch (err) {
    next(err);
  }
};

export const store = async (req, res, next) => {
  try {
    const data = await createSubredditValidation.validateAsync(req.body);
    const validateImage = await validateMIMEType(
      req.files.avatar.tempFilePath,
      {
        allowMimeTypes: ["image/jpeg", "image/png", "image/jpg"],
      }
    );
    if (!validateImage.ok) {
      return next(createHttpError.NotAcceptable("File type not supported"));
    }

    const uploadAvatar = await cloudinary.uploader.upload(
      req.files.avatar.tempFilePath,
      {
        folder: "RedditClone/Subreddit",
      }
    );
    console.log(uploadAvatar);
    const topic = await prisma.topic.findUnique({
      where: { id: data.topicId },
    });
    if (!topic) {
      throw createHttpError.BadRequest("Topic not found");
    }

    data.createdBy = req.user.username;
    data.avatar = uploadAvatar.public_id;
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

    const topic = await prisma.topic.findUnique({
      where: { id: data.topicId },
    });
    if (!topic) {
      throw createHttpError.BadRequest("Topic not found");
    }

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

    await cloudinary.uploader.destroy(subreddit.avatar);
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
