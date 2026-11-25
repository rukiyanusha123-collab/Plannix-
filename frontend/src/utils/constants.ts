import type { TaskStatus, TaskPriority, TaskCategory, EnergyLevel } from "../types/task.types";
import type { NavItem, SelectOption } from "../types/common.types";

export const APP_NAME = "Plannix";
export const APP_TAGLINE = "Plan less chaos. Make more progress.";
export const APP_DESCRIPTION = "Your personal productivity workspace.";

export const TASK_STATUSES: SelectOption<TaskStatus>[] = [
  { label: "To Do", value: "todo" },
  { label: "In Progress", value: "in-progress" },
  { label: "Completed", value: "completed" },
];

export const TASK_PRIORITIES: SelectOption<TaskPriority>[] = [
  { label: "Low", value: "low" },
  { label: "Medium", value: "medium" },
  { label: "High", value: "high" },
  { label: "Urgent", value: "urgent" },
];

export const TASK_CATEGORIES: SelectOption<TaskCategory>[] = [
  { label: "Work", value: "work" },
  { label: "Personal", value: "personal" },
  { label: "Study", value: "study" },
  { label: "Health", value: "health" },
  { label: "Other", value: "other" },
];

export const ENERGY_LEVELS: SelectOption<EnergyLevel>[] = [
  { label: "Low Energy", value: "low" },
  { label: "Medium Energy", value: "medium" },
  { label: "High Energy", value: "high" },
];

export const NAVIGATION: NavItem[] = [
  { label: "Dashboard", path: "/dashboard", icon: "layout-dashboard" },
  { label: "My Tasks", path: "/tasks", icon: "check-square" },
  { label: "My Board", path: "/board", icon: "columns-3" },
  { label: "Calendar", path: "/calendar", icon: "calendar-days" },
  { label: "Focus Room", path: "/focus", icon: "timer" },
  { label: "Insights", path: "/insights", icon: "chart-no-axes-combined" },
];

export const TASK_DEFAULTS = {
  status: "todo" as TaskStatus,
  priority: "medium" as TaskPriority,
  category: "personal" as TaskCategory,
  energyLevel: "medium" as EnergyLevel,
  estimatedMinutes: 30,
  isPinned: false,
};

export const TASK_LIMITS = {
  titleMinLength: 3,
  titleMaxLength: 100,
  descriptionMaxLength: 1000,
  maxTags: 8,
  maxSubtasks: 20,
  maxPinnedTasks: 3,
};

export const STORAGE_KEYS = {
  auth: "plannix-auth",
  tasks: "plannix-tasks",
  theme: "plannix-theme",
  focusSessions: "plannix-focus-sessions",
};