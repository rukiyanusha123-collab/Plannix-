
import { useCallback, useEffect, useState } from "react";
import {
  Plus, Search, ListTodo, CheckCircle2, Clock3, Circle,
  LayoutGrid, List, CalendarDays, X, Check, Eye, FileText,
  Pencil, Trash2, AlertTriangle
} from "lucide-react";
import { fetchTasks } from "../services/taskService";
import type { TaskData, TaskFilters } from "../services/taskService";

type Task = {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: "High" | "Medium" | "Low";
  status: "todo" | "in-progress" | "completed";
  due: string;
};

type TasksPageProps = {
  tasks: Task[];
  onAddTask: (task: Task) => void;
  onToggleTask: (id: string) => void;
  onUpdateTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  projectCategory?: string;
};

const filters = ["All", "To do", "In progress", "Completed"];

function TasksPage({
  tasks,
  onAddTask,
  onToggleTask,
  onUpdateTask,
  onDeleteTask,
  projectCategory,
}: TasksPageProps) {
  const [serverTasks, setServerTasks] = useState<Task[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"list" | "grid">("list");
  const [showModal, setShowModal] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [deleteTaskId, setDeleteTaskId] = useState<string | null>(null);

  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newCategory, setNewCategory] = useState(projectCategory || "Development");
  const [newPriority, setNewPriority] = useState<Task["priority"]>("Medium");
  const [newDue, setNewDue] = useState("Today");
  const [toast, setToast] = useState("");

  const mapTask = (task: TaskData): Task => ({
    id: task._id,
    title: task.title,
    description: task.description || "",
    category: task.category,
    priority: task.priority,
    status: task.status,
    due: task.due,
  });

  // BACKEND FILTERING
  const loadFilteredTasks = useCallback(async () => {
    setLoadingTasks(true);

    const filters: TaskFilters = {
      status:
        activeFilter === "All"
          ? undefined
          : activeFilter === "To do"
          ? "todo"
          : activeFilter === "In progress"
          ? "in-progress"
          : "Completed",
      search: search.trim() || undefined,
      category: projectCategory || undefined,
    };

    try {
      const result = await fetchTasks(filters);
      setServerTasks(result.map(mapTask));
    } catch (error) {
      console.error("Backend task filtering failed:", error);
      setToast("Unable to load filtered tasks.");
    } finally {
      setLoadingTasks(false);
    }
  }, [activeFilter, search, projectCategory]);

  // FILTER OR SEARCH CHANGES -> SEND API REQUEST
  useEffect(() => {
    const timer = setTimeout(() => {
      loadFilteredTasks();
    }, 300);

    return () => clearTimeout(timer);
  }, [loadFilteredTasks]);

  // TOAST AUTO CLOSE
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  const completedTasks = tasks.filter((task) => task.status === "completed").length;
  const remainingTasks = tasks.length - completedTasks;

  // BACKEND RESPONSE IS DISPLAYED DIRECTLY
  const filteredTasks = serverTasks;

  const selectedTask = serverTasks.find((task) => task.id === selectedTaskId) ?? null;
  const taskToDelete = serverTasks.find((task) => task.id === deleteTaskId) ?? null;

  const addTask = () => {
    if (!newTitle.trim()) return;

    const task: Task = {
      id: `temp-${Date.now()}`,
      title: newTitle.trim(),
      description: newDescription.trim() || "No description added.",
      category: projectCategory || newCategory,
      priority: newPriority,
      status: "todo",
      due: newDue,
    };

    onAddTask(task);
    setNewTitle("");
    setNewDescription("");
    setNewCategory(projectCategory || "Development");
    setNewPriority("Medium");
    setNewDue("Today");
    setShowModal(false);
    setActiveFilter("All");
    setSearch("");
    setToast("Task created successfully!");
  };

  const saveEditedTask = () => {
    if (!editTask || !editTask.title.trim()) return;

    onUpdateTask({
      ...editTask,
      category: projectCategory || editTask.category,
      title: editTask.title.trim(),
      description: editTask.description.trim() || "No description added.",
    });

    setEditTask(null);
    setToast("Task updated successfully!");
  };

  const confirmDeleteTask = () => {
    if (deleteTaskId === null) return;
    onDeleteTask(deleteTaskId);
    setDeleteTaskId(null);
    setSelectedTaskId(null);
    setToast("Task deleted successfully!");
  };

  const priorityStyle = (priority: Task["priority"]) => {
    if (priority === "High") return "bg-rose-50 text-rose-600 border-rose-100";
    if (priority === "Medium") return "bg-amber-50 text-amber-700 border-amber-100";
    return "bg-emerald-50 text-emerald-700 border-emerald-100";
  };

  const statusStyle = (status: Task["status"]) => {
    if (status === "completed") return "bg-emerald-50 text-emerald-700";
    if (status === "in-progress") return "bg-blue-50 text-blue-700";
    return "bg-stone-100 text-stone-600";
  };

  const statusLabel = (status: Task["status"]) => {
    if (status === "in-progress") return "In progress";
    if (status === "completed") return "Completed";
    return "To do";
  };

  const inputStyle = "w-full rounded-xl border border-[#e5eae3] bg-[#fafbf9] px-4 py-3 text-sm outline-none transition focus:border-[#78947d] focus:ring-2 focus:ring-[#78947d]/10";
  const labelStyle = "mb-1.5 block text-xs font-semibold text-[#506352]";

  return (
    <div className="min-h-screen bg-[#f7f8f5] p-6 md:p-9">
      <style>{`
        @keyframes plxFadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes plxModalIn {
          from { opacity: 0; transform: scale(.94) translateY(12px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes plxToastIn {
          from { opacity: 0; transform: translateX(35px) scale(.96); }
          to { opacity: 1; transform: translateX(0) scale(1); }
        }
        @keyframes plxCheckPop {
          0% { transform: scale(.5); opacity: 0; }
          70% { transform: scale(1.15); }
          100% { transform: scale(1); opacity: 1; }
        }
        .plx-task-animate { animation: plxFadeUp .4s ease both; }
        .plx-modal-animate { animation: plxModalIn .25s cubic-bezier(.2,.8,.2,1) both; }
        .plx-toast-animate { animation: plxToastIn .35s cubic-bezier(.2,.8,.2,1) both; }
        .plx-check-animate { animation: plxCheckPop .25s ease both; }
      `}</style>

      {toast && (
        <div className="fixed right-5 top-5 z-[90] plx-toast-animate">
          <div className="flex items-center gap-3 rounded-2xl border border-emerald-100 bg-white px-5 py-4 shadow-xl shadow-emerald-900/10">
            <div className="plx-check-animate flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <Check size={19} strokeWidth={3} />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#294436]">Success!</p>
              <p className="text-xs text-[#849187]">{toast}</p>
            </div>
            <button onClick={() => setToast("")} className="ml-2 rounded-lg p-1 text-[#9aa49b] transition hover:bg-gray-100 hover:text-gray-600">
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-7xl space-y-7">
        <div className="plx-task-animate flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="mb-2 text-sm font-medium text-[#809080]">Workspace / Tasks</p>
            <h1 className="text-3xl font-bold tracking-tight text-[#203b30]">My Tasks</h1>
            <p className="mt-2 text-sm text-[#849187]">Organize your work and keep moving forward.</p>
          </div>
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 rounded-xl bg-[#294c3b] px-5 py-3 text-sm font-semibold text-white shadow-md shadow-[#294c3b]/10 transition duration-300 hover:-translate-y-1 hover:bg-[#1e3d2d] hover:shadow-lg active:scale-95">
            <Plus size={18} /> New task
          </button>
        </div>

        <div className="plx-task-animate grid grid-cols-1 gap-4 sm:grid-cols-3" style={{ animationDelay: "80ms" }}>
          <div className="group rounded-2xl border border-[#e8ebe5] bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md">
            <div className="flex items-center justify-between"><span className="text-sm text-[#849087]">Total tasks</span><div className="rounded-xl bg-[#edf3ed] p-2 text-[#426b51] transition group-hover:scale-110"><ListTodo size={19} /></div></div>
            <h2 className="mt-3 text-3xl font-bold text-[#294436]">{tasks.length}</h2>
            <p className="mt-1 text-xs text-[#98a198]">Tasks in your workspace</p>
          </div>
          <div className="group rounded-2xl border border-[#e8ebe5] bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md">
            <div className="flex items-center justify-between"><span className="text-sm text-[#849087]">Completed</span><div className="rounded-xl bg-emerald-50 p-2 text-emerald-600 transition group-hover:scale-110"><CheckCircle2 size={19} /></div></div>
            <h2 className="mt-3 text-3xl font-bold text-[#294436]">{completedTasks}</h2>
            <p className="mt-1 text-xs text-[#98a198]">Successfully finished</p>
          </div>
          <div className="group rounded-2xl border border-[#e8ebe5] bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md">
            <div className="flex items-center justify-between"><span className="text-sm text-[#849087]">Remaining</span><div className="rounded-xl bg-amber-50 p-2 text-amber-600 transition group-hover:scale-110"><Clock3 size={19} /></div></div>
            <h2 className="mt-3 text-3xl font-bold text-[#294436]">{remainingTasks}</h2>
            <p className="mt-1 text-xs text-[#98a198]">Still on your list</p>
          </div>
        </div>

        <div className="plx-task-animate flex flex-col gap-4 rounded-2xl border border-[#e8ebe5] bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between" style={{ animationDelay: "140ms" }}>
          <div className="relative w-full md:max-w-sm">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a0aaa1]" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search your tasks..." className="w-full rounded-xl border border-[#e8ebe5] bg-[#fafbf9] py-2.5 pl-10 pr-4 text-sm outline-none transition duration-300 focus:border-[#78947d] focus:ring-2 focus:ring-[#78947d]/10" />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 rounded-xl bg-[#f5f7f4] p-1">
              {filters.map((filter) => (
                <button key={filter} onClick={() => setActiveFilter(filter)} className={`rounded-lg px-3 py-2 text-xs font-medium transition-all duration-200 ${activeFilter === filter ? "bg-white text-[#294c3b] shadow-sm" : "text-[#8a968c] hover:bg-white/60 hover:text-[#294c3b]"}`}>{filter}</button>
              ))}
            </div>
            <div className="flex items-center gap-1 rounded-xl border border-[#e8ebe5] p-1">
              <button onClick={() => setView("list")} className={`rounded-lg p-2 transition duration-200 ${view === "list" ? "bg-[#edf3ed] text-[#31543c]" : "text-[#98a198] hover:bg-[#f5f7f4]"}`} title="List view"><List size={18} /></button>
              <button onClick={() => setView("grid")} className={`rounded-lg p-2 transition duration-200 ${view === "grid" ? "bg-[#edf3ed] text-[#31543c]" : "text-[#98a198] hover:bg-[#f5f7f4]"}`} title="Grid view"><LayoutGrid size={18} /></button>
            </div>
          </div>
        </div>

        <div className="plx-task-animate rounded-2xl border border-[#e8ebe5] bg-white p-5 shadow-sm md:p-6" style={{ animationDelay: "200ms" }}>
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-[#294436]">All tasks</h2>
              <p className="mt-1 text-xs text-[#95a096]">{loadingTasks ? "Filtering tasks..." : `${filteredTasks.length} tasks found`}</p>
            </div>
            <button onClick={() => setShowModal(true)} className="flex items-center gap-2 rounded-lg border border-[#e8ebe5] px-3 py-2 text-xs text-[#708071] transition duration-200 hover:bg-[#f6f8f5] hover:border-[#cbd9cc]"><Plus size={15} /> Add task</button>
          </div>

          {loadingTasks ? (
            <div className="py-16 text-center text-sm text-[#95a096]">Loading tasks...</div>
          ) : filteredTasks.length === 0 ? (
            <div className="py-16 text-center plx-task-animate">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#edf3ed] text-[#719078]"><Search size={22} /></div>
              <h3 className="font-semibold text-[#294436]">No tasks found</h3>
              <p className="mt-1 text-sm text-[#95a096]">Try changing your search or filter.</p>
            </div>
          ) : (
            <div className={view === "grid" ? "grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3" : "space-y-3"}>
              {filteredTasks.map((task, index) => (
                <div key={task.id} style={{ animationDelay: `${index * 50}ms` }} className={`plx-task-animate group rounded-xl border border-[#edf0eb] p-4 transition duration-300 hover:-translate-y-0.5 hover:border-[#d5e1d5] hover:bg-[#fbfcfa] hover:shadow-sm ${view === "list" ? "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between" : "flex flex-col"}`}>
                  <div className="flex min-w-0 items-start gap-3">
                    <button onClick={() => onToggleTask(task.id)} className={`mt-0.5 shrink-0 transition duration-300 hover:scale-110 ${task.status === "completed" ? "text-emerald-600" : "text-[#b8c2b8] hover:text-[#64846a]"}`} title="Toggle completion">
                      {task.status === "completed" ? <CheckCircle2 size={21} className="plx-check-animate" /> : <Circle size={21} />}
                    </button>
                    <div className="min-w-0 flex-1">
                      <button onClick={() => setSelectedTaskId(task.id)} className="group/title flex items-start gap-2 text-left">
                        <h3 className={`text-sm font-semibold transition-colors ${task.status === "completed" ? "text-[#9aa49b] line-through" : "text-[#304536]"} group-hover/title:text-[#54785b]`}>{task.title}</h3>
                        <Eye size={14} className="mt-0.5 shrink-0 text-[#a1afa2] opacity-0 transition group-hover/title:opacity-100" />
                      </button>
                      <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[#8b968d]">{task.description}</p>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <span className={`rounded-md border px-2.5 py-1 text-[10px] font-medium ${priorityStyle(task.priority)}`}>{task.priority} priority</span>
                        <span className="rounded-md bg-[#f3f5f1] px-2.5 py-1 text-[10px] font-medium text-[#778579]">{task.category}</span>
                        <span className={`rounded-md px-2.5 py-1 text-[10px] font-medium ${statusStyle(task.status)}`}>{statusLabel(task.status)}</span>
                      </div>
                    </div>
                  </div>
                  <div className={`flex shrink-0 items-center justify-between gap-3 text-xs text-[#95a096] ${view === "grid" ? "mt-5" : "sm:pl-4"}`}>
                    <span className="flex items-center gap-2"><CalendarDays size={15} />{task.due}</span>
                    <button onClick={() => setSelectedTaskId(task.id)} className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-[#66816b] transition hover:bg-[#edf3ed] hover:text-[#31543c]"><FileText size={14} /> Details</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="plx-task-animate flex items-center justify-center gap-2 pb-4 text-xs text-[#9aa49b]" style={{ animationDelay: "250ms" }}><CheckCircle2 size={14} /><span>You have completed {completedTasks} of {tasks.length} tasks</span></div>
      </div>

      {selectedTask && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#14251b]/35 p-4 backdrop-blur-sm" onClick={() => setSelectedTaskId(null)}>
          <div className="plx-modal-animate w-full max-w-lg overflow-hidden rounded-3xl border border-[#e6ebe5] bg-white shadow-2xl shadow-[#183624]/15" onClick={(e) => e.stopPropagation()}>
            <div className="relative overflow-hidden bg-gradient-to-br from-[#edf4ee] via-[#f6f9f5] to-white p-6 pb-7">
              <div className="absolute -right-8 -top-10 h-36 w-36 rounded-full bg-[#dce9de]/70 blur-2xl" />
              <div className="relative flex items-start justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[#426b51] shadow-sm"><FileText size={20} /></div>
                <button onClick={() => setSelectedTaskId(null)} className="rounded-xl bg-white/80 p-2 text-[#738277] transition hover:rotate-90 hover:bg-white"><X size={18} /></button>
              </div>
              <p className="relative mt-5 text-[11px] font-semibold uppercase tracking-[.16em] text-[#7c9380]">Task details</p>
              <h2 className="relative mt-2 break-words text-xl font-bold leading-snug text-[#294436] sm:text-2xl">{selectedTask.title}</h2>
              <p className="relative mt-2 text-sm text-[#809083]">Task · Plannix workspace</p>
            </div>

            <div className="space-y-5 p-6">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#98a198]">Description</p>
                <div className="rounded-2xl border border-[#edf0eb] bg-[#fafbf9] p-4">
                  <p className="whitespace-pre-wrap text-sm leading-7 text-[#617063]">{selectedTask.description?.trim() || "No description added for this task."}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-[#edf0eb] p-4">
                  <p className="mb-3 text-xs text-[#97a198]">Priority</p>
                  <span className={`inline-flex rounded-lg border px-3 py-1.5 text-xs font-semibold ${priorityStyle(selectedTask.priority)}`}>{selectedTask.priority}</span>
                </div>
                <div className="rounded-2xl border border-[#edf0eb] p-4">
                  <p className="mb-3 text-xs text-[#97a198]">Status</p>
                  <span className={`inline-flex rounded-lg px-3 py-1.5 text-xs font-semibold ${statusStyle(selectedTask.status)}`}>{statusLabel(selectedTask.status)}</span>
                </div>
                <div className="rounded-2xl border border-[#edf0eb] p-4">
                  <p className="mb-2 text-xs text-[#97a198]">Category</p>
                  <p className="text-sm font-semibold text-[#536655]">{selectedTask.category}</p>
                </div>
                <div className="rounded-2xl border border-[#edf0eb] p-4">
                  <p className="mb-2 text-xs text-[#97a198]">Due date</p>
                  <p className="flex items-center gap-2 text-sm font-semibold text-[#536655]"><CalendarDays size={15} />{selectedTask.due}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => { setEditTask({ ...selectedTask }); setSelectedTaskId(null); }} className="flex items-center justify-center gap-2 rounded-xl border border-[#dce6dc] bg-[#f6f9f5] py-3 text-sm font-semibold text-[#49654e] transition hover:bg-[#edf3ed] hover:-translate-y-0.5">
                  <Pencil size={16} /> Edit task
                </button>
                <button onClick={() => setDeleteTaskId(selectedTask.id)} className="flex items-center justify-center gap-2 rounded-xl border border-rose-100 bg-rose-50 py-3 text-sm font-semibold text-rose-600 transition hover:bg-rose-100 hover:-translate-y-0.5">
                  <Trash2 size={16} /> Delete task
                </button>
              </div>

              <div className="flex flex-col-reverse gap-3 pt-1 sm:flex-row">
                <button onClick={() => setSelectedTaskId(null)} className="flex-1 rounded-xl border border-[#e5eae3] py-3 text-sm font-semibold text-[#718071] transition hover:bg-[#f7f8f5]">Close</button>
                <button onClick={() => { onToggleTask(selectedTask.id); setToast(selectedTask.status === "completed" ? "Task moved back to active!" : "Task completed!"); }} className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition hover:-translate-y-0.5 ${selectedTask.status === "completed" ? "border border-[#e5eae3] bg-white text-[#607162] hover:bg-[#f7f8f5]" : "bg-[#294c3b] text-white shadow-md shadow-[#294c3b]/10 hover:bg-[#1e3d2d]"}`}>
                  <CheckCircle2 size={17} />{selectedTask.status === "completed" ? "Mark as active" : "Mark as completed"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {editTask && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#14251b]/40 p-4 backdrop-blur-sm" onClick={() => setEditTask(null)}>
          <div className="plx-modal-animate w-full max-w-lg rounded-3xl border border-[#e8ebe5] bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-[#edf3ed] p-2.5 text-[#426b51]"><Pencil size={19} /></div>
                <div><h2 className="text-lg font-bold text-[#294436]">Edit task</h2><p className="text-xs text-[#98a198]">Update your task details.</p></div>
              </div>
              <button onClick={() => setEditTask(null)} className="rounded-lg p-2 text-[#89958b] transition hover:rotate-90 hover:bg-[#f3f5f1]"><X size={19} /></button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); saveEditedTask(); }} className="space-y-4">
              <div>
                <label className={labelStyle}>Task title *</label>
                <input required autoFocus value={editTask.title} onChange={(e) => setEditTask({ ...editTask, title: e.target.value })} placeholder="Task title" className={inputStyle} />
              </div>
              <div>
                <label className={labelStyle}>Description</label>
                <textarea value={editTask.description} onChange={(e) => setEditTask({ ...editTask, description: e.target.value })} placeholder="Add a description..." rows={3} className={`${inputStyle} resize-none`} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                {!projectCategory && (
                  <div>
                    <label className={labelStyle}>Category</label>
                    <select value={editTask.category} onChange={(e) => setEditTask({ ...editTask, category: e.target.value })} className={inputStyle}>
                      <option>Development</option><option>Design</option><option>Planning</option><option>Personal</option><option>Learning</option>
                    </select>
                  </div>
                )}
                <div className={projectCategory ? "col-span-2" : ""}>
                  <label className={labelStyle}>Priority</label>
                  <select value={editTask.priority} onChange={(e) => setEditTask({ ...editTask, priority: e.target.value as Task["priority"] })} className={inputStyle}>
                    <option>High</option><option>Medium</option><option>Low</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelStyle}>Due</label>
                  <select value={editTask.due} onChange={(e) => setEditTask({ ...editTask, due: e.target.value })} className={inputStyle}>
                    <option>Today</option><option>Tomorrow</option><option>Nov 26</option><option>Nov 27</option><option>Nov 28</option><option>Next week</option>
                  </select>
                </div>
                <div>
                  <label className={labelStyle}>Status</label>
                  <select value={editTask.status} onChange={(e) => setEditTask({ ...editTask, status: e.target.value as Task["status"] })} className={inputStyle}>
                    <option value="todo">To do</option><option value="in-progress">In progress</option><option value="completed">Completed</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setEditTask(null)} className="flex-1 rounded-xl border border-[#e5eae3] py-3 text-sm font-semibold text-[#657466] transition hover:bg-[#f7f8f5]">Cancel</button>
                <button type="submit" className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#294c3b] py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#1e3d2d] active:scale-95"><Check size={17} /> Save changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteTaskId !== null && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#14251b]/45 p-4 backdrop-blur-sm" onClick={() => setDeleteTaskId(null)}>
          <div className="plx-modal-animate w-full max-w-sm rounded-3xl border border-rose-100 bg-white p-6 text-center shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-500"><AlertTriangle size={24} /></div>
            <h2 className="mt-4 text-lg font-bold text-[#294436]">Delete this task?</h2>
            <p className="mt-2 text-sm leading-relaxed text-[#8b968d]">Are you sure you want to delete <span className="font-semibold text-[#526554]">{taskToDelete?.title ?? "this task"}</span>? This action cannot be undone.</p>
            <div className="mt-6 flex gap-3">
              <button onClick={() => setDeleteTaskId(null)} className="flex-1 rounded-xl border border-[#e5eae3] py-3 text-sm font-semibold text-[#657466] transition hover:bg-[#f7f8f5]">Cancel</button>
              <button onClick={confirmDeleteTask} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-rose-500 py-3 text-sm font-semibold text-white transition hover:bg-rose-600 active:scale-95"><Trash2 size={16} /> Delete</button>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-[50] flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm" onClick={() => setShowModal(false)}>
          <div className="plx-modal-animate w-full max-w-lg rounded-3xl border border-[#e8ebe5] bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-[#edf3ed] p-2.5 text-[#426b51]"><Plus size={19} /></div>
                <div><h2 className="text-lg font-bold text-[#294436]">Create a task</h2><p className="text-xs text-[#98a198]">Add something to your list.</p></div>
              </div>
              <button onClick={() => setShowModal(false)} className="rounded-lg p-2 text-[#89958b] transition hover:rotate-90 hover:bg-[#f3f5f1]"><X size={19} /></button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); addTask(); }} className="space-y-4">
              <div>
                <label className={labelStyle}>Task title *</label>
                <input autoFocus required value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="What needs to get done?" className={inputStyle} />
              </div>
              <div>
                <label className={labelStyle}>Description</label>
                <textarea value={newDescription} onChange={(e) => setNewDescription(e.target.value)} placeholder="Add a little more detail..." rows={3} className={`${inputStyle} resize-none`} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                {!projectCategory && (
                  <div>
                    <label className={labelStyle}>Category</label>
                    <select value={newCategory} onChange={(e) => setNewCategory(e.target.value)} className={inputStyle}>
                      <option>Development</option><option>Design</option><option>Planning</option><option>Personal</option><option>Learning</option>
                    </select>
                  </div>
                )}
                <div className={projectCategory ? "col-span-2" : ""}>
                  <label className={labelStyle}>Priority</label>
                  <select value={newPriority} onChange={(e) => setNewPriority(e.target.value as Task["priority"])} className={inputStyle}>
                    <option>High</option><option>Medium</option><option>Low</option>
                  </select>
                </div>
              </div>
              <div>
                <label className={labelStyle}>Due</label>
                <select value={newDue} onChange={(e) => setNewDue(e.target.value)} className={inputStyle}>
                  <option>Today</option><option>Tomorrow</option><option>Nov 26</option><option>Nov 27</option><option>Nov 28</option><option>Next week</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 rounded-xl border border-[#e5eae3] py-3 text-sm font-semibold text-[#657466] transition hover:bg-[#f7f8f5]">Cancel</button>
                <button type="submit" className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#294c3b] py-3 text-sm font-semibold text-white transition duration-300 hover:-translate-y-0.5 hover:bg-[#1e3d2d] active:scale-95"><Plus size={17} /> Create task</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default TasksPage;
