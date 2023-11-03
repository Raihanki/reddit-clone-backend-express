import express from "express";
import dotenv from "dotenv";
import fileUpload from "express-fileupload";
import cors from "cors";
import createHttpError from "http-errors";
import { authenticate } from "./middlewares/authenticate.midleware.js";

// import routes
import authRoutes from "./routes/auth.route.js";
import subredditRoutes from "./routes/subreddit.route.js";
import topicRoutes from "./routes/topic.route.js";
import postRoutes from "./routes/post.route.js";

const app = express();
dotenv.config();
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

app.use(express.json());
app.use(fileUpload());

// route
app.get("/api/v1", authenticate, (req, res) => res.json({ user: req.user }));

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/subreddits", subredditRoutes);
app.use("/api/v1/topics", topicRoutes);
app.use("/api/v1/posts", postRoutes);

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
