import createHttpError from "http-errors";
import jwt from "jsonwebtoken";
import prisma from "../config/database.js";

export const authenticate = async (req, res, next) => {
  try {
    const accessToken = req.cookies.accessToken;
    if (!accessToken) {
      req.user = null;
      return next();
    }

    const user = await new Promise((resolve, reject) => {
      jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) {
          if (err.name === "TokenExpiredError") {
            reject(createHttpError.Unauthorized("Access token expired"));
          }
          reject(createHttpError.Unauthorized());
        }
        resolve(user);
      });
    });

    const authenticatedUser = await prisma.user.findUnique({
      where: { id: user.aud },
    });
    delete authenticatedUser.password;
    req.user = authenticatedUser;

    next();
  } catch (err) {
    next(err);
  }
};
