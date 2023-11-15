import prisma from "../config/database.js";
import createHttpError from "http-errors";

export const mySubreddit = async (req, res, next) => {
  try {
    const mySubreddit = await prisma.subreddit.findMany({
      where: { createdBy: req.user.username },
      include: {
        topic: {
          select: { id: true, title: true, slug: true },
        },
      },
    });

    mySubreddit.map((s) => {
      s.avatar = s.avatar
        ? `https://res.cloudinary.com/dvyru6uni/image/upload/v1699947307/${s.avatar}`
        : null;
    });
    res.status(200).json({
      status: 200,
      data: mySubreddit,
    });
  } catch (err) {
    next(err);
  }
};

export const mySubscibtion = async (req, res, next) => {
  try {
    const mySubscibtion = await prisma.subreddit.findMany({
      where: { subscribes: { some: { userId: req.user.id } } },
      include: {
        topic: {
          select: { id: true, title: true, slug: true },
        },
        subscribes: {
          select: { userId: true },
        },
      },
    });

    mySubscibtion.map((s) => {
      s.avatar = s.avatar
        ? `https://res.cloudinary.com/dvyru6uni/image/upload/v1699947307/${s.avatar}`
        : null;
      s.subscribed = s.subscribes.some((s) => s.userId === req.user?.id);
      delete s.subscribes;
    });

    res.status(200).json({
      status: 200,
      data: mySubscibtion,
    });
  } catch (err) {
    next(err);
  }
};
