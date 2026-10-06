const express = require("express");

const router = express.Router();

const {
  getTasks,
  createTask,
  updateTask,
  toggleTask,
  deleteTask,
} = require("../controllers/taskController");

const protect = require("../middleware/authMiddleware");

router.get("/", protect, getTasks);

router.post("/", protect, createTask);

router.put("/:taskId", protect, updateTask);

router.patch("/:taskId/toggle", protect, toggleTask);

router.delete("/:taskId", protect, deleteTask);

module.exports = router;