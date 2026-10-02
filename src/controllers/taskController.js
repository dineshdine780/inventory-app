const Task = require("../models/Task");

// Get all tasks
const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find().sort({ dueDate: 1 });

    res.status(200).json({
      success: true,
      tasks,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch tasks",
      error: error.message,
    });
  }
};

// Create a task
const createTask = async (req, res) => {
  try {
    const { title, dueDate } = req.body;

    if (!title || !title.trim() || !dueDate) {
      return res.status(400).json({
        success: false,
        message: "Task title and due date are required",
      });
    }

    const task = await Task.create({
      title: title.trim(),
      dueDate,
    });

    res.status(201).json({
      success: true,
      message: "Task created successfully",
      task,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create task",
      error: error.message,
    });
  }
};


// Update a task
const updateTask = async (req, res) => {
  try {
    const { title, dueDate } = req.body;

    if (!title || !title.trim() || !dueDate) {
      return res.status(400).json({
        success: false,
        message: "Task title and due date are required",
      });
    }

    const task = await Task.findByIdAndUpdate(
      req.params.taskId,
      {
        title: title.trim(),
        dueDate,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Task updated successfully",
      task,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update task",
      error: error.message,
    });
  }
};


// Toggle task completion
const toggleTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    task.completed = !task.completed;
    await task.save();

    res.status(200).json({
      success: true,
      message: "Task status updated",
      task,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update task",
      error: error.message,
    });
  }
};

// Delete a task
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.taskId);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete task",
      error: error.message,
    });
  }
};

module.exports = {
  getTasks,
  createTask,
  updateTask,
  toggleTask,
  deleteTask,
};