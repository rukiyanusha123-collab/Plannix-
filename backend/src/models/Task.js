import mongoose, { Schema } from "mongoose";

const taskSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    default: "",
  },
  category: {
    type: String,
    default: "Development",
  },
  priority: {
    type: String,
    enum: ["High", "Medium", "Low"],
    default: "Medium",
  },
  status: {
    type: String,
    enum: ["todo", "in-progress", "completed"],
    default: "todo",
  },
  due: {
    type: String,
    default: "Today",
  },
}, { timestamps: true });

const Task = mongoose.model("Task", taskSchema);

export default Task;