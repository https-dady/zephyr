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

    if (!title || !category) {
      return res.status(400).json({
        success: false,
        message:
          "Title and category are required",
      });
    }

    const task = await Task.create({
      user: req.user.userId,
      title: title.trim(),
      description: description
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
    const task = await Task.findOne({
      _id: req.params.id,
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

    const task = await Task.findOne({
      _id: req.params.id,
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
    const task = await Task.findOne({
      _id: req.params.id,
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
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      user: req.user.userId,
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    if (task.completed) {
      return res.status(409).json({
        success: false,
        message:
          "Task is already completed",
      });
    }

    task.completed = true;
    task.completedAt = new Date();

    await task.save();

    const xpResult =
      await awardTaskCompletionXP(
        req.user.userId
      );

    const streakResult =
      await updateUserStreak(
        req.user.userId
      );

    const attributeResult =
      await updateUserAttribute(
        req.user.userId,
        task.category
      );

    const economyResult =
      await awardTaskCompletionCurrency(
        req.user.userId
      );

    const completionLog =
      await createCompletionLog({
        userId: req.user.userId,
        task,
        xpAwarded:
          xpResult.xpAwarded,
        currencyAwarded:
          economyResult.currencyAwarded,
        attribute:
          attributeResult,
      });

    return res.status(200).json({
      success: true,
      data: {
        task,
        xp: xpResult,
        streak: streakResult,
        attribute: attributeResult,
        economy: economyResult,
        completionLog,
      },
    });
  } catch (error) {
    console.error(
      "Complete task error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
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