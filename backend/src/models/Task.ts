import mongoose, { Schema, Document, Types } from "mongoose";

export interface ITask extends Document {
  userId: Types.ObjectId;
  title: string;
  description: string;
  category: string;
  priority: "High" | "Medium" | "Low";
  status: "todo" | "in-progress" | "completed";
  due: string;
}

const taskSchema = new Schema<ITask>(
  {
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
  },
  { timestamps: true }
);

const Task = mongoose.model<ITask>("Task", taskSchema);

export default Task;