const express = require("express");

const {
  getTasks,
  createTask,
  getTaskById,
  updateTask,
  deleteTask,
  completeTask,
} = require("../controllers/task.controller");

const protect = require("../middleware/auth.middleware");

const router = express.Router();

router.use(protect);

router.get("/", getTasks);
router.post("/", createTask);
router.get("/:id", getTaskById);
router.put("/:id", updateTask);
router.delete("/:id", deleteTask);
router.post("/:id/complete", completeTask);

module.exports = router;