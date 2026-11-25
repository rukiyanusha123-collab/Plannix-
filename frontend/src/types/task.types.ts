export type TaskStatus = "todo" | "in-progress" | "completed";
export type TaskPriority = "low" | "medium" | "high" | "urgent";
export type EnergyLevel = "low" | "medium" | "high";
export type TaskCategory = "work" | "personal" | "study" | "health" | "other";

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  category: TaskCategory;
  tags: string[];
  dueDate: string | null;
  estimatedMinutes: number;
  energyLevel: EnergyLevel;
  subtasks: Subtask[];
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  priority?: TaskPriority;
  category?: TaskCategory;
  dueDate?: string | null;
  estimatedMinutes?: number;
  energyLevel?: EnergyLevel;
  tags?: string[];
}

export interface UpdateTaskInput extends Partial<CreateTaskInput> {
  status?: TaskStatus;
  isPinned?: boolean;
  subtasks?: Subtask[];
}