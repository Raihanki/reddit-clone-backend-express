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
        subscribes: {
          select: { userId: true },
        },
      },
    });

    subreddits.map((s) => {
      s.avatar = s.avatar
        ? `https://res.cloudinary.com/dvyru6uni/image/upload/v1699947307/${s.avatar}`
        : null;
      s.subscribed = s.subscribes.some((s) => s.userId === req.user?.id);
      delete s.subscribes;
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
        subscribes: {
          select: { userId: true },
        },
      },
    });

    if (!subreddit) {
      throw createHttpError.NotFound("Subreddit not found");
    }

    subreddit.avatar = subreddit.avatar
      ? `https://res.cloudinary.com/dvyru6uni/image/upload/v1699947307/${subreddit.avatar}`
      : null;
    subreddit.subscribed = subreddit.subscribes.some(
      (s) => s.userId === req.user?.id
    );
    subreddit.totalSubs = subreddit.subscribes.length;
    delete subreddit.subscribes;
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
    if (req.files.avatar === undefined) {
      return next(createHttpError.NotAcceptable("File not found"));
    }

    const validateImage = await validateMIMEType(
      req.files.avatar.tempFilePath,
      {
        allowMimeTypes: ["image/jpeg", "image/png", "image/jpg"],
      }
    );
    const validateImageSize = req.files.avatar.size < 2000000;
    if (!validateImageSize) {
      return next(createHttpError.NotAcceptable("File size too large"));
    }
    if (!validateImage.ok) {
      return next(createHttpError.NotAcceptable("File type not supported"));
    }

    const uploadAvatar = await cloudinary.uploader.upload(
      req.files.avatar.tempFilePath,
      {
        folder: "RedditClone/Subreddit",
      }
    );

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

    if (req.files.avatar === undefined) {
      data.avatar = subreddit.avatar;
    } else {
      subreddit.avatar && (await cloudinary.uploader.destroy(subreddit.avatar));
      const uploadAvatar = await cloudinary.uploader.upload(
        req.files.avatar.tempFilePath,
        {
          folder: "RedditClone/Subreddit",
        }
      );
      data.avatar = uploadAvatar.public_id;
    }

    await prisma.subreddit.update({
      where: { slug },
      data,
    });

    res.status(200).json({
      status: 200,
      message: "Subreddit updated successfully",
      slug: data.slug,
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

export const subscribe = async (req, res, next) => {
  try {
    const slug = req.params.slug;

    const subreddit = await prisma.subreddit.findUnique({
      where: { slug },
    });
    if (!subreddit) {
      throw createHttpError.NotFound("Subreddit not found");
    }

    const subscribed = await prisma.subscribe.findFirst({
      where: {
        AND: [{ userId: req.user.id }, { subredditId: subreddit.id }],
      },
    });
    if (subscribed) {
      throw createHttpError.Conflict("Already subscribed");
    }

    const subscribe = await prisma.subscribe.create({
      data: {
        userId: req.user.id,
        subredditId: subreddit.id,
      },
    });

    res.status(200).json({
      status: 200,
      message: "Subscribed successfully",
      data: subscribe,
    });
  } catch (err) {
    next(err);
  }
};

export const unsubscribe = async (req, res, next) => {
  try {
    const slug = req.params.slug;

    const subreddit = await prisma.subreddit.findUnique({
      where: { slug },
    });
    if (!subreddit) {
      throw createHttpError.NotFound("Subreddit not found");
    }

    const subscribe = await prisma.subscribe.findFirst({
      where: {
        AND: [{ userId: req.user.id }, { subredditId: subreddit.id }],
      },
    });
    if (!subscribe) {
      throw createHttpError.NotFound("Subscribe not found");
    }

    await prisma.subscribe.delete({
      where: { id: subscribe.id },
    });

    res.status(200).json({
      status: 200,
      message: "Unsubscribed successfully",
    });
  } catch (err) {
    next(err);
  }
};
