
import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { LayoutDashboard, ListTodo, CalendarDays, ChartNoAxesCombined, Settings, Search, Bell, Plus, ChevronDown, ArrowUpRight, ArrowRight, Check, Clock3, Flame, Zap, MoreHorizontal, Sparkles, Menu, X, Leaf, TrendingUp, Calendar, CheckCircle2, CircleDot, SlidersHorizontal, Sprout, Flower2 } from "lucide-react";
import { Toaster, toast } from "sonner";
import TasksPage from "./pages/TasksPage";
import CalendarPage from "./pages/CalendarPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import SettingsPage from "./pages/SettingsPage";
import FocusRoom from "./pages/FocusRoom";
import FocusGarden from "./components/FocusGarden";
import { AuthPage } from "./pages/AuthPage";
import api from "./services/api";
import { fetchTasks, addTask, editTask, removeTask, clearAllTasks as clearTasksAPI } from "./services/taskService";
import type { TaskData } from "./services/taskService";
import UserProfileMenu from "./components/UserProfileMenu";
import type { PlannixUser } from "./components/UserProfileMenu";

type Task = { id: string; title: string; description: string; category: string; priority: "High" | "Medium" | "Low"; status: "todo" | "in-progress" | "completed"; due: string };
const mapTask = (task: TaskData): Task => ({ id: task._id, title: task.title, description: task.description, category: task.category, priority: task.priority, status: task.status, due: task.due });
const getGreeting = () => { const hour = new Date().getHours(); if (hour >= 5 && hour < 12) return "Good morning"; if (hour >= 12 && hour < 17) return "Good afternoon"; return "Good evening"; };
const navItems = [{ name: "Overview", icon: LayoutDashboard }, { name: "My Tasks", icon: ListTodo }, { name: "Calendar", icon: CalendarDays }, { name: "Analytics", icon: ChartNoAxesCombined }];
const projectNames = ["Development", "Design", "Personal"];

function App() {
  const [user, setUser] = useState<PlannixUser | null>(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem("plannix-token");
      if (!token) { setAuthChecking(false); return; }
      try {
        const response = await api.get("/auth/me");
        const currentUser = response.data.user as PlannixUser;
        const backendTasks = await fetchTasks();
        setUser(currentUser);
        setTasks(backendTasks.map(mapTask));
        localStorage.setItem("plannix-user", JSON.stringify(currentUser));
      } catch (error) {
        console.error("Session restore failed:", error);
        localStorage.removeItem("plannix-token");
        localStorage.removeItem("plannix-user");
        setUser(null);
        setTasks([]);
      } finally { setAuthChecking(false); }
    };
    void restoreSession();
  }, []);

  const [activeNav, setActiveNav] = useState("Overview");
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [newTask, setNewTask] = useState("");
  const [newCategory, setNewCategory] = useState("Development");
  const [newPriority, setNewPriority] = useState<Task["priority"]>("Medium");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const completed = tasks.filter(task => task.status === "completed").length;
  const remaining = tasks.length - completed;
  const progress = tasks.length ? Math.round(completed / tasks.length * 100) : 0;
  const projectCounts = { Development: tasks.filter(task => task.category === "Development").length, Design: tasks.filter(task => task.category === "Design").length, Personal: tasks.filter(task => task.category === "Personal").length };
  const projectTasks = tasks.filter(task => task.category === activeNav);
  const filteredTasks = tasks.filter(task => {
    const matchesFilter = filter === "All" || (filter === "Active" && task.status !== "completed") || (filter === "Completed" && task.status === "completed");
    return matchesFilter && task.title.toLowerCase().includes(search.toLowerCase());
  });

  const toggleTask = async (id: string) => {
    const task = tasks.find(item => item.id === id);
    if (!task) return;
    const updatedStatus = task.status === "completed" ? "todo" : "completed";
    try {
      await editTask(id, { status: updatedStatus });
      setTasks(prev => prev.map(item => item.id === id ? { ...item, status: updatedStatus } : item));
      toast.success(updatedStatus === "completed" ? "Task completed! 🎉" : "Task moved back to active!");
    } catch { toast.error("Could not update task."); }
  };

  const handleCreateTask = async () => {
    if (!newTask.trim()) { toast.error("Please enter a task name."); return; }
    try {
      const created = await addTask({ title: newTask.trim(), description: "", category: newCategory, priority: newPriority, status: "todo", due: "Today" });
      setTasks(prev => [mapTask(created), ...prev]);
      setNewTask("");
      setNewCategory("Development");
      setNewPriority("Medium");
      setShowModal(false);
      toast.success("Task added successfully! 🌿");
    } catch { toast.error("Could not create task."); }
  };

  const addTaskFromPage = async (task: Omit<Task, "id">): Promise<Task | null> => {
    try {
      const created = await addTask(task);
      const mapped = mapTask(created);
      setTasks(prev => [mapped, ...prev]);
      toast.success("Task added successfully! 🌿");
      return mapped;
    } catch { toast.error("Could not create task."); return null; }
  };

  const addTaskFromTasksPage = (task: Task) => {
    void addTaskFromPage({ title: task.title, description: task.description, category: task.category, priority: task.priority, status: task.status, due: task.due });
  };
  const toggleTaskFromPage = (id: string) => { void toggleTask(id); };

  const updateTaskFromPage = async (updatedTask: Task) => {
    try {
      const updated = await editTask(updatedTask.id, { title: updatedTask.title, description: updatedTask.description, category: updatedTask.category, priority: updatedTask.priority, status: updatedTask.status, due: updatedTask.due });
      setTasks(prev => prev.map(task => task.id === updatedTask.id ? mapTask(updated) : task));
      toast.success("Task updated successfully! ✨");
    } catch { toast.error("Could not update task."); }
  };

  const deleteTaskFromPage = async (id: string) => {
    try {
      await removeTask(id);
      setTasks(prev => prev.filter(task => task.id !== id));
      toast.success("Task deleted successfully.");
    } catch { toast.error("Could not delete task."); }
  };

  const clearAllTasks = async () => {
    try { await clearTasksAPI(); setTasks([]); toast.success("All tasks cleared."); }
    catch { toast.error("Could not clear tasks."); }
  };

  const handleLogin = async (newUser: PlannixUser) => {
    setUser(newUser);
    try {
      const backendTasks = await fetchTasks();
      setTasks(backendTasks.map(mapTask));
    } catch { setTasks([]); toast.error("Could not load your tasks."); }
    setActiveNav("Overview");
    setSidebarOpen(false);
    toast.success(`Welcome to Plannix, ${newUser.name}! 🌿`);
  };

  const handleLogout = () => {
    localStorage.removeItem("plannix-token");
    localStorage.removeItem("plannix-user");
    setTasks([]);
    setUser(null);
    setActiveNav("Overview");
    setSidebarOpen(false);
    toast.success("Logged out successfully.");
  };

  if (authChecking) return <div className="plx-loading-screen"><Toaster position="top-right" richColors closeButton /><div className="brand-mark"><Leaf size={22} /></div><p>Restoring your Plannix session...</p></div>;
  if (!user) return <><Toaster position="top-right" richColors closeButton /><AuthPage onLogin={handleLogin} /></>;

  return (
    <div className="plx-shell">
      <Toaster position="top-right" richColors closeButton />
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}
      <aside className={`plx-sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
        <div className="brand"><div className="brand-mark"><Leaf size={21} /></div><span>plannix<span className="brand-dot">.</span></span><button className="sidebar-close" onClick={() => setSidebarOpen(false)}><X size={19} /></button></div>
        <button className="workspace-switch"><div className="workspace-avatar">P</div><div className="workspace-info"><strong>Personal workspace</strong><span>Free plan</span></div><ChevronDown size={16} /></button>
        <div className="nav-label">WORKSPACE</div>
        <nav className="side-nav">
          {navItems.map(({ name, icon: Icon }) => <button key={name} className={`nav-item sidebar-item ${activeNav === name ? "nav-active" : ""}`} onClick={() => { setActiveNav(name); setSidebarOpen(false); }}><Icon size={18} /><span>{name}</span>{name === "My Tasks" && <span className="nav-count">{tasks.length}</span>}</button>)}
        </nav>
        <div className="nav-label project-label">PROJECTS<button onClick={() => setShowModal(true)}><Plus size={15} /></button></div>
        <div className="project-list">
          {projectNames.map(project => <button key={project} className={activeNav === project ? "project-active" : ""} onClick={() => { setActiveNav(project); setFilter("All"); setSearch(""); setSidebarOpen(false); }}><span className={`project-dot ${project === "Development" ? "dot-sage" : project === "Design" ? "dot-purple" : "dot-yellow"}`} />{project}<span className="project-number">{projectCounts[project as keyof typeof projectCounts]}</span></button>)}
        </div>
        <div className="sidebar-bottom">
          <div className="sidebar-tip"><div className="tip-icon"><Sparkles size={17} /></div><strong>A little progress is still progress.</strong><p>Keep showing up. Your future self will thank you.</p></div>
          <button className={`nav-item sidebar-item ${activeNav === "Settings" ? "nav-active" : ""}`} onClick={() => { setActiveNav("Settings"); setSidebarOpen(false); }}><Settings size={18} /><span>Settings</span></button>
          <div className="user-profile"><div className="user-avatar">{user.name.trim().charAt(0).toUpperCase()}</div><div className="user-info"><strong>{user.name}</strong><span>{user.email}</span></div><MoreHorizontal size={18} /></div>
        </div>
      </aside>

      <main className="plx-main">
        <header className="topbar">
          <div className="topbar-left"><button className="icon-button mobile-menu" onClick={() => setSidebarOpen(true)}><Menu size={19} /></button><div className="breadcrumb">Workspace <span>/</span> <strong>{activeNav}</strong></div></div>
          <div className="topbar-actions"><div className="top-search"><Search size={16} /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search anything..." /><kbd>⌘ K</kbd></div><button className="icon-button notification-button"><Bell size={18} /><span className="notification-dot" /></button><UserProfileMenu user={user} onLogout={handleLogout} /></div>
        </header>

        <div key={activeNav} className="dashboard-content page-enter">
          {projectNames.includes(activeNav) ? <TasksPage tasks={projectTasks} projectCategory={activeNav} onAddTask={addTaskFromTasksPage} onToggleTask={toggleTaskFromPage} onUpdateTask={updateTaskFromPage} onDeleteTask={deleteTaskFromPage} /> : activeNav === "Settings" ? <SettingsPage taskCount={tasks.length} onClearTasks={clearAllTasks} /> : activeNav === "Calendar" ? <CalendarPage tasks={tasks} onAddTask={addTaskFromPage} onToggleTask={toggleTaskFromPage} /> : activeNav === "My Tasks" ? <TasksPage tasks={tasks} onAddTask={addTaskFromTasksPage} onToggleTask={toggleTaskFromPage} onUpdateTask={updateTaskFromPage} onDeleteTask={deleteTaskFromPage} /> : activeNav === "Analytics" ? <AnalyticsPage tasks={tasks} /> : activeNav === "Focus Room" ? <FocusRoom tasks={tasks} onExit={() => { setActiveNav("Overview"); setSidebarOpen(false); }} /> : (
            <>
              <section className="welcome-row stagger-item"><div><div className="eyebrow"><span className="live-dot" /> YOUR SPACE, YOUR PACE</div><h1>{getGreeting()}, {user.name.split(" ")[0]} <span className="wave">✳</span></h1><p>Small steps today. Big things tomorrow.</p></div><button className="primary-button btn-glow" onClick={() => setShowModal(true)}><Plus size={18} /> Create task</button></section>

              <section className="stats-grid">
                <article className="stat-card stat-highlight stagger-item"><div className="stat-top"><span>Tasks completed</span><span className="stat-icon"><CheckCircle2 size={18} /></span></div><div className="stat-value">{completed}<span className="stat-total"> / {tasks.length}</span></div><div className="stat-foot"><span className="trend-positive"><TrendingUp size={14} /> {progress}%</span> of your tasks completed</div><div className="stat-line"><span style={{ width: `${progress}%` }} /></div></article>
                <article className="stat-card stagger-item"><div className="stat-top"><span>Remaining tasks</span><span className="stat-icon stat-icon-amber"><ListTodo size={18} /></span></div><div className="stat-value">{remaining}<span className="stat-caption"> tasks</span></div><div className="stat-foot">One thing at a time, you've got this.</div><div className="stat-decoration">↗</div></article>
                <article className="stat-card stagger-item"><div className="stat-top"><span>Focus streak</span><span className="stat-icon stat-icon-orange"><Flame size={18} /></span></div><div className="stat-value">5<span className="stat-caption"> days</span></div><div className="stat-foot"><span className="trend-positive"><Flame size={14} /> Keep it alive</span> you're on a roll!</div><div className="streak-dots"><i /><i /><i /><i /><i className="dot-today" /><i /><i /></div></article>
                <article className="stat-card stagger-item"><div className="stat-top"><span>Focus time</span><span className="stat-icon stat-icon-purple"><Clock3 size={18} /></span></div><div className="stat-value">2.4<span className="stat-caption"> hrs</span></div><div className="stat-foot">Today · deep work session</div><div className="focus-mini-bars"><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /></div></article>
              </section>

              <section className="main-grid stagger-item">
                <div className="tasks-panel panel">
                  <div className="panel-heading"><div><h2>Today's tasks <span className="heading-count">{tasks.length}</span></h2><p>Your daily dose of getting things done.</p></div><button className="icon-button" onClick={() => setShowModal(true)}><Plus size={18} /></button></div>
                  <div className="task-toolbar"><div className="filter-tabs">{["All", "Active", "Completed"].map(f => <button key={f} className={filter === f ? "filter-active" : ""} onClick={() => setFilter(f)}>{f}</button>)}</div><button className="filter-button"><SlidersHorizontal size={15} /> Filter</button></div>
                  <div className="task-list">
                    {filteredTasks.length === 0 ? <div className="empty-state"><CircleDot size={26} /><p>No tasks here. Add a task to get started!</p><button onClick={() => setShowModal(true)}>Create a task</button></div> : filteredTasks.map((task, index) => <div className={`task-row stagger-item ${task.status === "completed" ? "task-completed" : ""}`} key={task.id} style={{ animationDelay: `${Math.min(index * 0.06, 0.48)}s` }}><button className={`task-check ${task.status === "completed" ? "checked" : ""}`} onClick={() => void toggleTask(task.id)}>{task.status === "completed" && <Check size={14} />}</button><div className="task-details"><strong>{task.title}</strong><div className="task-meta"><span className="task-category">{task.category}</span><span className="task-due"><Calendar size={13} /> {task.due}</span></div></div><span className={`priority priority-${task.priority.toLowerCase()}`}><i />{task.priority}</span><button className="task-more"><MoreHorizontal size={17} /></button></div>)}
                  </div>
                  <button className="view-all-button" onClick={() => setActiveNav("My Tasks")}>View all tasks <ArrowRight size={15} /></button>
                </div>

                <div className="right-column">
                  <div className="progress-panel panel card-hover"><div className="panel-heading"><div><h2>Daily progress</h2><p>Look how far you've come!</p></div><span className="progress-icon"><Zap size={17} /></span></div><div className="progress-visual"><div className="progress-circle" style={{ "--progress": `${progress}%` } as CSSProperties}><div className="progress-circle-inner"><strong>{progress}%</strong><span>completed</span></div></div></div><div className="progress-summary"><span><i className="legend-done" /> Completed <strong>{completed}</strong></span><span><i className="legend-pending" /> Remaining <strong>{remaining}</strong></span></div></div>
                  <div className="focus-panel panel card-hover"><div className="focus-top"><div className="focus-symbol"><Leaf size={20} /></div><span>FOCUS MODE</span><Sparkles size={16} /></div><h2>Make space for<br />deep work.</h2><p>Quiet the noise. Focus on what matters right now.</p><button className="focus-button btn-glow" onClick={() => { setActiveNav("Focus Room"); setSidebarOpen(false); }}>Enter focus room <ArrowUpRight size={16} /></button><div className="focus-plant">✳</div></div>
                </div>
              </section>

              <section className="bottom-grid stagger-item">
                <style>{`
                  .bottom-grid{align-items:start}
                  .little-wins-card{box-sizing:border-box;align-self:start;position:sticky;top:24px;overflow:hidden;display:flex;flex-direction:column;gap:16px;padding:22px;border-radius:24px;border:1px solid #e2eae2;background:linear-gradient(145deg,#ffffff 0%,#f8fbf7 100%);box-shadow:0 8px 28px rgba(39,75,52,.055)}
                  .little-wins-card:before{content:"";position:absolute;width:190px;height:190px;right:-90px;top:-100px;border-radius:50%;background:#e8f1e6;opacity:.65;pointer-events:none}
                  .lw-top,.lw-stats,.lw-bottom{position:relative;z-index:1}
                  .lw-top{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:0;padding-right:8px}
                  .lw-heading{display:flex;align-items:center;gap:11px}
                  .lw-main-icon{width:43px;height:43px;display:grid;place-items:center;border-radius:15px;background:#eaf3e9;color:#507858}
                  .lw-heading h2{margin:0;font-size:17px;font-weight:700;letter-spacing:-.4px;color:#24392a}
                  .lw-heading p{margin:4px 0 0;font-size:11.5px;color:#8b998b}
                  .lw-today{display:flex;align-items:center;gap:5px;border:1px solid #e5ece2;background:#f5f8f3;border-radius:30px;padding:7px 10px;color:#6c8869;font-size:9px;font-weight:800;letter-spacing:1px;position:relative;z-index:2}
                  .lw-stats{display:flex;flex-direction:column;gap:12px}
                  .lw-row{display:flex;align-items:center;gap:12px;padding:11px 12px;border:1px solid #edf1ec;background:rgba(255,255,255,.8);border-radius:16px}
                  .lw-icon{width:38px;height:38px;flex-shrink:0;display:grid;place-items:center;border-radius:13px;background:#eef4ed;color:#688465}
                  .lw-row:nth-child(2) .lw-icon{background:#f4f1e7;color:#9b8755}
                  .lw-row:nth-child(3) .lw-icon{background:#edf0f6;color:#7a83a1}
                  .lw-row-info{min-width:0;flex:1}
                  .lw-row-label{font-size:12px;color:#687669;font-weight:600}
                  .lw-row-sub{font-size:10px;color:#9aa49a;margin-top:3px}
                  .lw-row-number{font-size:22px;font-weight:750;letter-spacing:-.8px;color:#344b36}
                  .lw-bottom{margin-top:0;padding:16px 15px 15px;border-radius:17px;background:#edf4eb;border:1px solid #e4ede2}
                  .lw-quote-tag{display:flex;align-items:center;gap:6px;color:#6c876b;font-size:9px;font-weight:800;letter-spacing:1.4px}
                  .lw-quote-text{font-family:Georgia,serif;font-size:15px;line-height:1.65;letter-spacing:-.15px;color:#405743;margin:10px 0 12px}
                  .lw-quote-footer{display:flex;align-items:center;gap:7px;color:#819181;font-size:10px}
                  .lw-quote-footer span{width:17px;height:1px;background:#b5c8b2}
                  @media(max-width:1024px){.bottom-grid{grid-template-columns:1fr;align-items:start}.little-wins-card{position:static;top:auto;align-self:start;width:100%;height:auto}}
                  @media(max-width:600px){.little-wins-card{padding:18px;border-radius:20px}.lw-row{padding:10px}.lw-quote-text{font-size:14px}}
                `}</style>

                <div className="week-panel panel card-hover">
                  <FocusGarden tasks={tasks} onAddTask={addTaskFromPage} onToggleTask={toggleTaskFromPage} onDeleteTask={deleteTaskFromPage} />
                </div>

                <div className="little-wins-card">
                  <div className="lw-top">
                    <div className="lw-heading">
                      <div className="lw-main-icon"><Sprout size={21} /></div>
                      <div><h2>Your little wins</h2><p>Every step forward counts.</p></div>
                    </div>
                    <div className="lw-today"><Flower2 size={12} /> TODAY</div>
                  </div>

                  <div className="lw-stats">
                    <div className="lw-row"><div className="lw-icon"><CheckCircle2 size={18} /></div><div className="lw-row-info"><div className="lw-row-label">Tasks completed</div><div className="lw-row-sub">Small wins, beautifully done.</div></div><div className="lw-row-number">{completed}</div></div>
                    <div className="lw-row"><div className="lw-icon"><Flame size={18} /></div><div className="lw-row-info"><div className="lw-row-label">Focus streak</div><div className="lw-row-sub">Days of showing up.</div></div><div className="lw-row-number">5</div></div>
                    <div className="lw-row"><div className="lw-icon"><Sprout size={18} /></div><div className="lw-row-info"><div className="lw-row-label">Seeds waiting</div><div className="lw-row-sub">Ready for your next step.</div></div><div className="lw-row-number">{remaining}</div></div>
                  </div>

                  <div className="lw-bottom"><div className="lw-quote-tag"><Sparkles size={12} /> DAILY REMINDER</div><p className="lw-quote-text">“You don't have to see the whole staircase. Just take the first step.”</p><div className="lw-quote-footer"><span /> A little wisdom for today</div></div>
                </div>
              </section>

              <footer className="dashboard-footer"><span><Leaf size={14} /> Made for mindful productivity.</span><span>Plannix © 2026</span></footer>
            </>
          )}
        </div>
      </main>

      {showModal && <div className="modal-backdrop" onClick={() => setShowModal(false)}><div className="task-modal modal-enter" onClick={e => e.stopPropagation()}><div className="modal-header"><div className="modal-icon"><Plus size={19} /></div><button onClick={() => setShowModal(false)}><X size={19} /></button></div><h2>Create a task</h2><p>Make it small. Make it doable. Start there.</p><label htmlFor="task-name">Task name</label><input id="task-name" autoFocus placeholder="What needs to get done?" value={newTask} onChange={e => setNewTask(e.target.value)} onKeyDown={e => e.key === "Enter" && void handleCreateTask()} /><div className="modal-fields"><div><label htmlFor="task-category">Category</label><select id="task-category" value={newCategory} onChange={e => setNewCategory(e.target.value)}><option value="Development">Development</option><option value="Design">Design</option><option value="Planning">Planning</option><option value="Personal">Personal</option></select></div><div><label htmlFor="task-priority">Priority</label><select id="task-priority" value={newPriority} onChange={e => setNewPriority(e.target.value as Task["priority"])}><option value="High">High</option><option value="Medium">Medium</option><option value="Low">Low</option></select></div></div><button className="modal-submit btn-glow" onClick={() => void handleCreateTask()}><Plus size={17} /> Create task</button></div></div>}
    </div>
  );
}
export default App;
