import Joi from "joi";
import prisma from "../config/database.js";

const createSubredditValidation = Joi.object({
  name: Joi.string()
    .min(3)
    .max(100)
    .required()
    .external(async (value) => {
      const checkName = await prisma.subreddit.findUnique({
        where: { name: value },
      });
      if (checkName) {
        throw new Error("Subreddit name already exists");
      }
    }),
  description: Joi.string().min(1).max(191).required(),
  isPublic: Joi.boolean(),
  allowPost: Joi.boolean(),
  country: Joi.string().required(),
  topicId: Joi.number().required(),
  avatar: Joi.any(),
}).options({ abortEarly: false });

export default createSubredditValidation;
