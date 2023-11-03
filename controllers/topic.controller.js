import createHttpError from "http-errors";
import prisma from "../config/database.js";
import topicValidation from "../validations/topic.validation.js";

export const index = async (req, res, next) => {
  try {
    const topics = await prisma.topic.findMany();
    res.status(200).json({
      status: 200,
      data: topics,
    });
  } catch (err) {
    next(err);
  }
};

export const create = async (req, res, next) => {
  try {
    const data = await topicValidation.validateAsync(req.body);
    const checkTitle = await prisma.topic.findUnique({
      where: { title: data.title },
    });
    if (checkTitle) {
      throw createHttpError.BadRequest("Topic already exists");
    }

    data.slug = data.title.toLowerCase().split(" ").join("-");
    const topic = await prisma.topic.create({ data });
    res.status(201).json({
      status: 201,
      message: "Topic created successfully",
      data: topic,
    });
  } catch (err) {
    if (err.isJoi === true) err.status = 422;
    next(err);
  }
};

export const update = async (req, res, next) => {
  const id = req.params.id;
  try {
    const data = await topicValidation.validateAsync(req.body);
    const checkTitle = await prisma.topic.findUnique({
      where: { title: data.title },
    });
    if (checkTitle && checkTitle.id !== id) {
      throw createHttpError.BadRequest("Topic already exists");
    }

    data.slug = data.title.toLowerCase().split(" ").join("-");
    const topic = await prisma.topic.update({
      where: { id: parseInt(id) },
      data,
    });

    res.status(200).json({
      status: 200,
      message: "Topic updated successfully",
      data: topic,
    });
  } catch (err) {
    next(err);
  }
};

export const destroy = async (req, res, next) => {
  const id = parseInt(req.params.id);

  try {
    const topic = await prisma.topic.findUnique({
      where: { id },
    });
    if (!topic) {
      throw createHttpError.NotFound("Topic not found");
    }

    await prisma.topic.delete({
      where: { id },
    });
    res.status(200).json({
      status: 200,
      message: "Topic deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};
