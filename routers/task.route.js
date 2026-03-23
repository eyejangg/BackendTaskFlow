const express = require("express");
const router = express.Router();
const taskController = require("../controllers/task.controller");
const { protectedRoute } = require("../middlewares/auth.middleware");

// http://localhost:5000/api/v1/tasks
router.post(
    "",
    protectedRoute,
    taskController.createTask
);

// http://localhost:5000/api/v1/tasks
router.get(
    "",
    protectedRoute,
    taskController.getTasks
);

// http://localhost:5000/api/v1/tasks/:id
router.put(
    "/:id",
    protectedRoute,
    taskController.updateTask
);

// http://localhost:5000/api/v1/tasks/:id
router.delete(
    "/:id",
    protectedRoute,
    taskController.deleteTask
);

module.exports = router;
