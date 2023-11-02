import Joi from "joi";
import prisma from "../config/database.js";

const updateSubredditValidation = Joi.object({
  name: Joi.string()
    .min(3)
    .max(100)
    .required()
    .external(async (value, helpers) => {
      const checkName = await prisma.subreddit.findUnique({
        where: { name: value },
      });
      if (checkName && checkName.slug !== helpers.prefs.context.slug) {
        throw new Error("Subreddit name already exists");
      }
    }),
  description: Joi.string().min(1).max(191).required(),
  isPublic: Joi.boolean(),
  allowPost: Joi.boolean(),
  country: Joi.string().required(),
  topicId: Joi.number().required(),
}).options({ abortEarly: false });

export default updateSubredditValidation;
