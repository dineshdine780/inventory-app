const express = require("express");
const router = express.Router();

const {
  getTasks,
  createTask,
  updateTask,
  toggleTask,
  deleteTask,
} = require("../controllers/taskController");

router.get("/", getTasks);
router.post("/", createTask);
router.put("/:taskId", updateTask);
router.patch("/:taskId/toggle", toggleTask);
router.delete("/:taskId", deleteTask);

module.exports = router;