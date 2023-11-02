import createHttpError from "http-errors";
import jwt from "jsonwebtoken";
import prisma from "../config/database.js";

export const authenticate = async (req, res, next) => {
  try {
    const accessTokenHeader = req.headers["authorization"];
    if (!accessTokenHeader) throw createHttpError.Unauthorized();

    const accessToken = accessTokenHeader && accessTokenHeader.split(" ")[1];

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