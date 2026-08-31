const db = require("../config/db");

// GET ALL TASKS
exports.getTasks = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM tasks ORDER BY created_at DESC",
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to retrieve tasks.",
    });
  }
};

// GET ONE TASK
exports.getTask = async (req, res) => {
  try {
    const { id } = req.params;

    if (isNaN(id)) {
      return res.status(400).json({
        message: "Invalid task ID.",
      });
    }

    const [rows] = await db.query("SELECT * FROM tasks WHERE id = ?", [id]);

    if (rows.length === 0) {
      return res.status(404).json({
        message: "Task not found.",
      });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to retrieve task." });
  }
};

// CREATE TASK
exports.createTask = async (req, res) => {
  try {
    const { title, description, status, due_date } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: "Task title is required." });
    }
    const taskStatus = status === "completed" ? "completed" : "pending";
    const formattedDueDate =
      due_date && due_date.trim() !== "" ? due_date : null;

    const [result] = await db.query(
      `INSERT INTO tasks (title, description, status, due_date) VALUES (?,?,?,?)`,
      [title.trim(), description || null, taskStatus, formattedDueDate],
    );

    const [newTask] = await db.query("SELECT * FROM tasks WHERE id = ?", [
      result.insertId,
    ]);

    res.status(201).json(newTask[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create task." });
  }
};

// UPDATE TASK
exports.updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status, due_date } = req.body;

    if (isNaN(id)) {
      return res.status(400).json({
        message: "Invalid task ID.",
      });
    }

    if (!title || !title.trim()) {
      return res.status(400).json({
        message: "Task title is required.",
      });
    }

    const taskStatus = status === "completed" ? "completed" : "pending";
    const formattedDueDate =
      due_date && due_date.trim() !== "" ? due_date : null;

    await db.query(
      `UPDATE tasks
       SET
         title = ?,
         description = ?,
         status = ?,
         due_date = ?
       WHERE id = ?`,
      [title.trim(), description || null, taskStatus, formattedDueDate, id],
    );

    const [rows] = await db.query("SELECT * FROM tasks WHERE id = ?", [id]);

    if (rows.length === 0) {
      return res.status(404).json({
        message: "Task not found.",
      });
    }

    res.json({
      message: "Task updated successfully.",
      task: rows[0],
    });
  } catch (error) {
    console.error("UPDATE ERROR:", error);
    res.status(500).json({
      message: "Failed to update task.",
      error: error.message,
    });
  }
};

// DELETE TASK
exports.deleteTasks = async (req, res) => {
  try {
    const { id } = req.params;

    if (isNaN(id)) {
      return res.status(400).json({
        message: "Invalid task id",
      });
    }

    const [result] = await db.query("DELETE FROM tasks WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Task not found.",
      });
    }

    res.json({ message: "Task deleted successfully." });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Failed to delete task." });
  }
};
