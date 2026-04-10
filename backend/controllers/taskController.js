const Task = require("../models/Task");
const User = require("../models/User");

// ─── helpers ──────────────────────────────────────────────
const isCreator  = (task, userId) => task.createdBy._id.toString() === userId;
const isAssignee = (task, userId) => task.assignedTo?._id?.toString() === userId;

// ─── CREATE ───────────────────────────────────────────────
exports.createTask = async (req, res) => {
  try {
    const { title, description, dueDate, assignedTo } = req.body;
    if (!title || !description)
      return res.status(400).json({ message: "Title and description are required" });

    // Validate assignee exists if provided
    if (assignedTo) {
      const assignee = await User.findById(assignedTo);
      if (!assignee) return res.status(404).json({ message: "Assigned user not found" });
    }

    const task = await Task.create({
      title, description, dueDate: dueDate || null,
      assignedTo: assignedTo || null,
      createdBy: req.user.id,
    });

    const populated = await task.populate("createdBy assignedTo", "name email");
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// ─── GET ALL (for current user) ───────────────────────────
exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({
      $or: [{ createdBy: req.user.id }, { assignedTo: req.user.id }],
    }).populate("createdBy assignedTo", "name email").sort({ createdAt: -1 });

    res.json(tasks);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

// ─── GET ONE ──────────────────────────────────────────────
exports.getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate("createdBy assignedTo", "name email");

    if (!task) return res.status(404).json({ message: "Task not found" });

    if (!isCreator(task, req.user.id) && !isAssignee(task, req.user.id))
      return res.status(403).json({ message: "Access denied" });

    res.json(task);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

// ─── UPDATE ───────────────────────────────────────────────
exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate("createdBy assignedTo", "name email");

    if (!task) return res.status(404).json({ message: "Task not found" });

    const userId   = req.user.id;
    const creator  = isCreator(task, userId);
    const assignee = isAssignee(task, userId);

    if (!creator && !assignee)
      return res.status(403).json({ message: "Access denied" });

    const { title, description, status, dueDate } = req.body;

    if (creator && !task.assignedTo) {
      // Personal task — full edit
      if (title)       task.title       = title;
      if (description) task.description = description;
      if (status)      task.status      = status;
      if (dueDate !== undefined) task.dueDate = dueDate;
    } else if (creator) {
      // Assigner on an assigned task — can edit everything EXCEPT status
      if (title)       task.title       = title;
      if (description) task.description = description;
      if (dueDate !== undefined) task.dueDate = dueDate;
      if (status)
        return res.status(403).json({ message: "Assigner cannot change status" });
    } else if (assignee) {
      // Assignee — can ONLY change status
      if (title || description || dueDate !== undefined)
        return res.status(403).json({ message: "Assignee can only update status" });
      if (status) task.status = status;
    }

    await task.save();
    res.json(task);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

// ─── DELETE ───────────────────────────────────────────────
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate("createdBy", "name email");

    if (!task) return res.status(404).json({ message: "Task not found" });

    if (!isCreator(task, req.user.id))
      return res.status(403).json({ message: "Only the creator can delete this task" });

    await task.deleteOne();
    res.json({ message: "Task deleted" });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

// ─── GET ALL USERS (for assign dropdown) ──────────────────
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user.id } }, "name email");
    res.json(users);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};