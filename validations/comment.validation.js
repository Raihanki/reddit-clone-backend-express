import Joi from "joi";

const commentValidation = Joi.object({
  content: Joi.string().required(),
  parentId: Joi.string().allow(null).optional(),
}).options({ abortEarly: false });

export default commentValidation;
