import Task from "../models/Task";
// GET ALL TASKS
export const getTasks = async (req, res) => {
    try {
        const tasks = await Task.find({ userId: req.userId }).sort({ createdAt: -1 });
        return res.status(200).json({ tasks });
    }
    catch (error) {
        console.error("Get Tasks Error:", error);
        return res.status(500).json({ message: "Failed to fetch tasks" });
    }
};
// CREATE TASK
export const createTask = async (req, res) => {
    try {
        const { title, description, category, priority, status, due } = req.body;
        if (!title?.trim()) {
            return res.status(400).json({ message: "Task title is required" });
        }
        const task = await Task.create({
            userId: req.userId,
            title: title.trim(),
            description,
            category,
            priority,
            status,
            due,
        });
        return res.status(201).json({ message: "Task created successfully", task });
    }
    catch (error) {
        console.error("Create Task Error:", error);
        return res.status(500).json({ message: "Failed to create task" });
    }
};
// UPDATE TASK
export const updateTask = async (req, res) => {
    try {
        const task = await Task.findOneAndUpdate({ _id: req.params.id, userId: req.userId }, req.body, { new: true, runValidators: true });
        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }
        return res.status(200).json({ message: "Task updated successfully", task });
    }
    catch (error) {
        console.error("Update Task Error:", error);
        return res.status(500).json({ message: "Failed to update task" });
    }
};
// DELETE TASK
export const deleteTask = async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({
            _id: req.params.id,
            userId: req.userId,
        });
        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }
        return res.status(200).json({ message: "Task deleted successfully" });
    }
    catch (error) {
        console.error("Delete Task Error:", error);
        return res.status(500).json({ message: "Failed to delete task" });
    }
};
// CLEAR ALL TASKS
export const clearTasks = async (req, res) => {
    try {
        await Task.deleteMany({ userId: req.userId });
        return res.status(200).json({ message: "All tasks cleared successfully" });
    }
    catch (error) {
        console.error("Clear Tasks Error:", error);
        return res.status(500).json({ message: "Failed to clear tasks" });
    }
};
