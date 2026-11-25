
import { Request, Response } from "express";
import Task from "../models/Task";

interface AuthRequest extends Request {
  userId?: string;
}

// GET ALL TASKS + BACKEND FILTERING
export const getTasks = async (req: AuthRequest, res: Response) => {
  try {
    const { status, category, priority, search, sortBy, dueFilter } = req.query;

    const query: Record<string, any> = {
      userId: req.userId,
    };

    // STATUS FILTER
    if (status === "Active") {
      query.status = { $in: ["todo", "in-progress"] };
    } else if (status === "Completed") {
      query.status = "completed";
    } else if (status === "todo" || status === "in-progress") {
      query.status = status;
    }

    // CATEGORY FILTER
    if (category && category !== "All") {
      query.category = category;
    }

    // PRIORITY FILTER
    if (priority && priority !== "All") {
      query.priority = priority;
    }

    // SEARCH FILTER
    if (search && typeof search === "string" && search.trim()) {
      const safeSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      query.$or = [
        { title: { $regex: safeSearch, $options: "i" } },
        { description: { $regex: safeSearch, $options: "i" } },
      ];
    }

    // FETCH TASKS FROM DATABASE
    let tasks = await Task.find(query).sort({ createdAt: -1 });

    // DUE DATE FILTER
    if (dueFilter && typeof dueFilter === "string" && dueFilter !== "All") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      tasks = tasks.filter((task) => {
        const dueValue = task.due;
        if (!dueValue) return false;

        if (dueValue === "Today") {
          return dueFilter === "Today";
        }

        const dueDate = new Date(dueValue);
        if (isNaN(dueDate.getTime())) return false;

        dueDate.setHours(0, 0, 0, 0);

        if (dueFilter === "Today") {
          return dueDate.getTime() === today.getTime();
        }

        if (dueFilter === "Upcoming") {
          return dueDate.getTime() > today.getTime();
        }

        if (dueFilter === "Overdue") {
          return dueDate.getTime() < today.getTime() && task.status !== "completed";
        }

        return true;
      });
    }

    // SORTING
    if (sortBy && typeof sortBy === "string") {
      if (sortBy === "Newest") {
        tasks.sort((a, b) => {
          const dateA = new Date((a as any)._id.getTimestamp?.() || 0).getTime();
          const dateB = new Date((b as any)._id.getTimestamp?.() || 0).getTime();
          return dateB - dateA;
        });
      } else if (sortBy === "Oldest") {
        tasks.sort((a, b) => {
          const dateA = (a as any)._id.getTimestamp?.()?.getTime?.() || 0;
          const dateB = (b as any)._id.getTimestamp?.()?.getTime?.() || 0;
          return dateA - dateB;
        });
      } else if (sortBy === "Priority") {
        const priorityOrder: Record<string, number> = {
          High: 1,
          Medium: 2,
          Low: 3,
        };

        tasks.sort(
          (a, b) =>
            (priorityOrder[a.priority] || 4) -
            (priorityOrder[b.priority] || 4)
        );
      } else if (sortBy === "Due date") {
        tasks.sort((a, b) => {
          const dateA = new Date(a.due).getTime();
          const dateB = new Date(b.due).getTime();

          const validA = isNaN(dateA) ? Infinity : dateA;
          const validB = isNaN(dateB) ? Infinity : dateB;

          return validA - validB;
        });
      }
    }

    return res.status(200).json({ tasks });
  } catch (error) {
    console.error("Get Tasks Error:", error);
    return res.status(500).json({ message: "Failed to fetch tasks" });
  }
};

// CREATE TASK
export const createTask = async (req: AuthRequest, res: Response) => {
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

    return res.status(201).json({
      message: "Task created successfully",
      task,
    });
  } catch (error) {
    console.error("Create Task Error:", error);
    return res.status(500).json({ message: "Failed to create task" });
  }
};

// UPDATE TASK
export const updateTask = async (req: AuthRequest, res: Response) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    return res.status(200).json({
      message: "Task updated successfully",
      task,
    });
  } catch (error) {
    console.error("Update Task Error:", error);
    return res.status(500).json({ message: "Failed to update task" });
  }
};

// DELETE TASK
export const deleteTask = async (req: AuthRequest, res: Response) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    return res.status(200).json({
      message: "Task deleted successfully",
    });
  } catch (error) {
    console.error("Delete Task Error:", error);
    return res.status(500).json({ message: "Failed to delete task" });
  }
};

// CLEAR ALL TASKS
export const clearTasks = async (req: AuthRequest, res: Response) => {
  try {
    await Task.deleteMany({ userId: req.userId });

    return res.status(200).json({
      message: "All tasks cleared successfully",
    });
  } catch (error) {
    console.error("Clear Tasks Error:", error);
    return res.status(500).json({
      message: "Failed to clear tasks",
    });
  }
};
