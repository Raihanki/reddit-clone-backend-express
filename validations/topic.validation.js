import Joi from "joi";

const topicValidation = Joi.object({
  title: Joi.string().min(3).max(50).required(),
  description: Joi.string().min(1).required(),
}).options({ abortEarly: false });

export default topicValidation;
