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

    if (!mySubreddit) {
      throw createHttpError.NotFound("Subreddit not found");
    }

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
