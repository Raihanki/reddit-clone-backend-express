import Joi from "joi";

const postValidation = Joi.object({
  title: Joi.string().required(),
  content: Joi.string().required(),
}).options({ abortEarly: false });

export default postValidation;
