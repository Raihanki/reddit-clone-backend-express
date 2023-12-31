import express from "express";
import dotenv from "dotenv";
import fileUpload from "express-fileupload";
import cors from "cors";
import createHttpError from "http-errors";
import { authenticate } from "./middlewares/authenticate.midleware.js";
import cookieParser from "cookie-parser";
import { v2 as cloudinary } from "cloudinary";

// import routes
import authRoutes from "./routes/auth.route.js";
import subredditRoutes from "./routes/subreddit.route.js";
import topicRoutes from "./routes/topic.route.js";
import postRoutes from "./routes/post.route.js";
import voteRoutes from "./routes/vote.route.js";
import userRoutes from "./routes/user.route.js";

const app = express();
dotenv.config();
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(
  fileUpload({
    useTempFiles: true,
  })
);
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// route
app.get("/api/v1", authenticate, (req, res) => res.json({ user: req.user }));

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/subreddits", subredditRoutes);
app.use("/api/v1/topics", topicRoutes);
app.use("/api/v1/posts", postRoutes);
app.use("/api/v1/votes", voteRoutes);

app.use((req, res, next) => {
  next(createHttpError.NotFound());
});

app.use((err, req, res, next) => {
  res.status(err.status || 500);
  if (err.status === 422) {
    return res.json({
      status: err.status,
      message: "Validation Errors",
      errors: err.details,
    });
  }
  return res.json({
    status: err.status || 500,
    message: err.message,
  });
});

app.listen(process.env.APP_PORT || 5000, () => {
  console.log(`Server is running on port ${process.env.APP_PORT || 5000}`);
});
