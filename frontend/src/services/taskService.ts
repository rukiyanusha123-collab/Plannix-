
import api from "./api";

export interface TaskData {
  _id: string;
  title: string;
  description: string;
  category: string;
  priority: "High" | "Medium" | "Low";
  status: "todo" | "in-progress" | "completed";
  due: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTaskData {
  title: string;
  description?: string;
  category?: string;
  priority?: "High" | "Medium" | "Low";
  status?: "todo" | "in-progress" | "completed";
  due?: string;
}

export interface TaskFilters {
  status?: string;
  category?: string;
  priority?: string;
  search?: string;
  sortBy?: string;
  dueFilter?: string;
}

// GET TASKS WITH BACKEND FILTERS
export const fetchTasks = async (filters?: TaskFilters): Promise<TaskData[]> => {
  const params: Record<string, string> = {};

  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== "All") params[key] = value;
    });
  }

  const response = await api.get("/tasks", { params });
  return response.data.tasks;
};

// CREATE TASK
export const addTask = async (taskData: CreateTaskData): Promise<TaskData> => {
  const response = await api.post("/tasks", taskData);
  return response.data.task;
};

// UPDATE TASK
export const editTask = async (
  taskId: string,
  updates: Partial<CreateTaskData>
): Promise<TaskData> => {
  const response = await api.put(`/tasks/${taskId}`, updates);
  return response.data.task;
};

// DELETE TASK
export const removeTask = async (taskId: string): Promise<void> => {
  await api.delete(`/tasks/${taskId}`);
};

// CLEAR ALL TASKS
export const clearAllTasks = async (): Promise<void> => {
  await api.delete("/tasks/clear/all");
};
