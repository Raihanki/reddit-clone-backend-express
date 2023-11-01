import registerValidation from "../validations/register.validaiton.js";
import prisma from "../config/database.js";
import bcrypt from "bcrypt";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../services/jwt.service.js";
import createHttpError from "http-errors";

export const register = async (req, res, next) => {
  try {
    const data = await registerValidation.validateAsync(req.body);
    delete data.password_confirmation;

    const checkEmail = await prisma.user.findUnique({
      where: { email: data.email },
    });
    const checkUsername = await prisma.user.findUnique({
      where: { username: data.username },
    });
    if (checkEmail) {
      throw createHttpError.Conflict("Email already exists");
    } else if (checkUsername) {
      throw createHttpError.Conflict("Username already exists");
    }

    const salt = await bcrypt.genSalt(13);
    const hashedPassword = await bcrypt.hash(data.password, salt);
    data.password = hashedPassword;
    data.email = data.email.toLowerCase();
    data.username = data.username.toLowerCase();

    const user = await prisma.user.create({ data });

    const accessToken = await generateAccessToken(user.id);
    const refreshToken = await generateRefreshToken(user.id);
    return res.status(201).json({
      status: 201,
      message: "User created successfully",
      accessToken,
      refreshToken,
    });
  } catch (err) {
    if (err.isJoi === true) err.status = 422;
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    if (!req.body.email || !req.body.password) {
      throw createHttpError.BadRequest("Invalid email or password");
    }
    const data = {
      email: req.body.email,
      password: req.body.password,
    };

    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });
    if (!user) {
      throw createHttpError.BadRequest("Invalida email or password");
    }

    const checkPassword = await bcrypt.compare(data.password, user.password);
    if (!checkPassword) {
      throw createHttpError.BadRequest("Invalid email or password");
    }

    const accessToken = await generateAccessToken(user.id);
    const refreshToken = await generateRefreshToken(user.id);

    return res.status(200).json({
      status: 200,
      message: "User logged in successfully",
      accessToken,
      refreshToken,
    });
  } catch (err) {
    next(err);
  }
};

export const refreshToken = async (req, res, next) => {
  try {
    const data = req.body.refreshToken;
    if (!data) {
      throw createHttpError.BadRequest("Refresh token is required");
    }

    const refreshTokenPayload = await verifyRefreshToken(data);
    const accessToken = await generateAccessToken(refreshTokenPayload);
    const refreshToken = await generateRefreshToken(refreshTokenPayload);

    res.status(200).json({
      status: 200,
      message: "Token refreshed successfully",
      accessToken,
      refreshToken,
    });
  } catch (err) {
    next(err);
  }
};

export const logout = (req, res, next) => {
  res.end("logout");
};
