const mongoose = require("mongoose");

const Task = require("../models/task.model");

const {
  awardTaskCompletionXP,
} = require("../services/xp.service");

const {
  updateUserStreak,
} = require("../services/streak.service");

const {
  updateUserAttribute,
} = require("../services/attribute.service");

const {
  awardTaskCompletionCurrency,
} = require("../services/economy.service");

const {
  createCompletionLog,
} = require("../services/completionLog.service");

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({
      user: req.user.userId,
    }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      data: {
        tasks,
      },
    });
  } catch (error) {
    console.error(
      "Get tasks error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

const createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
    } = req.body;

    if (
      typeof title !== "string" ||
      typeof category !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Title and category must be valid strings",
      });
    }

    if (!title.trim() || !category.trim()) {
      return res.status(400).json({
        success: false,
        message:
          "Title and category are required",
      });
    }

    if (
      description !== undefined &&
      typeof description !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Description must be a valid string",
      });
    }

    const task = await Task.create({
      user: req.user.userId,
      title: title.trim(),
      description:
        description !== undefined
          ? description.trim()
          : "",
      category: category.trim(),
    });

    return res.status(201).json({
      success: true,
      data: {
        task,
      },
    });
  } catch (error) {
    console.error(
      "Create task error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

const getTaskById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID",
      });
    }

    const task = await Task.findOne({
      _id: id,
      user: req.user.userId,
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        task,
      },
    });
  } catch (error) {
    console.error(
      "Get task by ID error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

const updateTask = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
    } = req.body;

    if (
      title !== undefined &&
      typeof title !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Title must be a valid string",
      });
    }

    if (
      description !== undefined &&
      typeof description !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Description must be a valid string",
      });
    }

    if (
      category !== undefined &&
      typeof category !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Category must be a valid string",
      });
    }

    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID",
      });
    }

    const task = await Task.findOne({
      _id: id,
      user: req.user.userId,
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    if (title !== undefined) {
      if (!title.trim()) {
        return res.status(400).json({
          success: false,
          message:
            "Title cannot be empty",
        });
      }

      task.title = title.trim();
    }

    if (description !== undefined) {
      task.description =
        description.trim();
    }

    if (category !== undefined) {
      if (!category.trim()) {
        return res.status(400).json({
          success: false,
          message:
            "Category cannot be empty",
        });
      }

      task.category =
        category.trim();
    }

    await task.save();

    return res.status(200).json({
      success: true,
      data: {
        task,
      },
    });
  } catch (error) {
    console.error(
      "Update task error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID",
      });
    }

    const task = await Task.findOne({
      _id: id,
      user: req.user.userId,
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    await task.deleteOne();

    return res.status(200).json({
      success: true,
      data: {
        message:
          "Task deleted successfully",
      },
    });
  } catch (error) {
    console.error(
      "Delete task error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

const completeTask = async (req, res) => {
  const session =
    await mongoose.startSession();

  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID",
      });
    }

    let completionResult;

    await session.withTransaction(
      async () => {
        const task = await Task.findOne({
          _id: id,
          user: req.user.userId,
        }).session(session);

        if (!task) {
          const error =
            new Error("Task not found");

          error.statusCode = 404;

          throw error;
        }

        if (task.completed) {
          const error =
            new Error(
              "Task is already completed"
            );

          error.statusCode = 409;

          throw error;
        }

        task.completed = true;
        task.completedAt = new Date();

        await task.save({
          session,
        });

        const xpResult =
          await awardTaskCompletionXP(
            req.user.userId,
            session
          );

        const streakResult =
          await updateUserStreak(
            req.user.userId,
            session
          );

        const attributeResult =
          await updateUserAttribute(
            req.user.userId,
            task.category,
            session
          );

        const economyResult =
          await awardTaskCompletionCurrency(
            req.user.userId,
            session
          );

        const completionLog =
          await createCompletionLog(
            {
              userId:
                req.user.userId,
              task,
              xpAwarded:
                xpResult.xpAwarded,
              currencyAwarded:
                economyResult.currencyAwarded,
              attribute:
                attributeResult,
            },
            session
          );

        completionResult = {
          task,
          xp: xpResult,
          streak: streakResult,
          attribute:
            attributeResult,
          economy:
            economyResult,
          completionLog,
        };
      }
    );

    return res.status(200).json({
      success: true,
      data: completionResult,
    });
  } catch (error) {
    console.error(
      "Complete task error:",
      error.message
    );

    if (error.statusCode) {
      return res.status(
        error.statusCode
      ).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  } finally {
    await session.endSession();
  }
};

module.exports = {
  getTasks,
  createTask,
  getTaskById,
  updateTask,
  deleteTask,
  completeTask,
};