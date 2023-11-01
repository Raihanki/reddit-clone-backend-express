import createHttpError from "http-errors";
import jwt from "jsonwebtoken";

export const generateAccessToken = (userId) => {
  return new Promise((resolve, reject) => {
    const payload = {};
    const options = {
      expiresIn: "1h",
      audience: userId,
    };
    jwt.sign(
      payload,
      process.env.ACCESS_TOKEN_SECRET,
      options,
      (err, token) => {
        if (err) {
          return reject(err);
        }
        resolve(token);
      }
    );
  });
};

export const generateRefreshToken = (userId) => {
  return new Promise((resolve, reject) => {
    const payload = {};
    const options = {
      expiresIn: "1y",
      audience: userId,
    };
    jwt.sign(
      payload,
      process.env.REFRESH_TOKEN_SECRET,
      options,
      (err, token) => {
        if (err) {
          return reject(err);
        }
        resolve(token);
      }
    );
  });
};

export const verifyRefreshToken = (refreshToken) => {
  return new Promise((resolve, reject) => {
    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      (err, payload) => {
        if (err) {
          return reject(createHttpError.Unauthorized());
        }
        const userId = payload.aud;
        resolve(userId);
      }
    );
  });
};
