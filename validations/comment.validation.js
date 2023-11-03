import Joi from "joi";

const commentValidation = Joi.object({
  content: Joi.string().required(),
}).options({ abortEarly: false });

export default commentValidation;
