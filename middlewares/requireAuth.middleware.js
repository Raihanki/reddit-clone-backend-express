import createHttpError from "http-errors";

export const requireAuth = async (req, res, next) => {
  if (!req.user) {
    return next(createHttpError.Unauthorized("Unauthenticated"));
  }
  next();
};
