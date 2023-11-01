import Joi from "joi";

const registerValidation = Joi.object({
  username: Joi.string().min(3).max(25).required(),
  fullname: Joi.string().min(1).required(),
  email: Joi.string().min(6).required().email(),
  password: Joi.string().min(8).required(),
  password_confirmation: Joi.string().valid(Joi.ref("password")).required(),
  profilePicture: Joi.string().allow(null, ""),
}).options({ abortEarly: false });

export default registerValidation;
