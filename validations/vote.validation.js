import Joi from "joi";

const voteValidation = Joi.object({
  voteType: Joi.string().required().valid("up", "down"),
}).options({ abortEarly: false });

export default voteValidation;
