
import { useMemo, useState } from "react";
import { addMonths, subMonths, addWeeks, subWeeks, format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, isSameMonth, isToday, parseISO } from "date-fns";
import { ChevronLeft, ChevronRight, Plus, CheckCircle2, Circle, X, Sparkles, CalendarDays, StickyNote } from "lucide-react";
import { toast } from "sonner";

type Task = {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: "High" | "Medium" | "Low";
  status: "todo" | "in-progress" | "completed";
  due: string;
};

type CalendarPageProps = {
  tasks: Task[];
  onAddTask: (task: Omit<Task, "id">) => void;
  onToggleTask: (id: string) => void;
};

const priorityStyles: Record<Task["priority"], string> = {
  High: "bg-rose-100 text-rose-700",
  Medium: "bg-amber-100 text-amber-700",
  Low: "bg-emerald-100 text-emerald-700",
};

const getTaskDate = (due: string): Date | null => {
  if (!due) return null;
  if (due.toLowerCase() === "today") return new Date();
  if (due.toLowerCase() === "tomorrow") {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    return date;
  }
  try {
    const date = parseISO(due);
    return isNaN(date.getTime()) ? null : date;
  } catch {
    return null;
  }
};

export default function CalendarPage({ tasks, onAddTask, onToggleTask }: CalendarPageProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 10, 1));
  const [selectedDate, setSelectedDate] = useState(new Date(2026, 10, 24));
  const [view, setView] = useState<"Month" | "Week">("Month");
  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("Personal");
  const [newPriority, setNewPriority] = useState<Task["priority"]>("Medium");
  const [newDescription, setNewDescription] = useState("");
  const [notes, setNotes] = useState<Record<string, string>>(() => {
    try {
      return JSON.parse(localStorage.getItem("plannix-calendar-notes") || "{}");
    } catch {
      return {};
    }
  });

  const monthDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 0 });
    const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 0 });
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const weekDays = useMemo(() => {
    const start = startOfWeek(selectedDate, { weekStartsOn: 0 });
    const end = endOfWeek(selectedDate, { weekStartsOn: 0 });
    return eachDayOfInterval({ start, end });
  }, [selectedDate]);

  const visibleDays = view === "Month" ? monthDays : weekDays;

  const datedTasks = useMemo(
    () => tasks.map((task) => ({ task, date: getTaskDate(task.due) })).filter((item) => item.date !== null),
    [tasks]
  );

  const selectedTasks = datedTasks.filter((item) => isSameDay(item.date!, selectedDate));
  const getDayTasks = (date: Date) => datedTasks.filter((item) => isSameDay(item.date!, date));

  const upcomingTasks = datedTasks
    .filter((item) => item.date! >= new Date(new Date().setHours(0, 0, 0, 0)))
    .sort((a, b) => a.date!.getTime() - b.date!.getTime())
    .slice(0, 4);

  const completedCount = tasks.filter((task) => task.status === "completed").length;
  const pendingCount = tasks.length - completedCount;
  const selectedKey = format(selectedDate, "yyyy-MM-dd");
  const selectedNote = notes[selectedKey] || "";

  const changeMonth = (direction: number) => {
    if (view === "Week") {
      const next = direction > 0 ? addWeeks(selectedDate, 1) : subWeeks(selectedDate, 1);
      setSelectedDate(next);
      setCurrentMonth(next);
    } else {
      setCurrentMonth((prev) => direction > 0 ? addMonths(prev, 1) : subMonths(prev, 1));
    }
  };

  const goToday = () => {
    const today = new Date();
    setCurrentMonth(today);
    setSelectedDate(today);
  };

  const saveNote = () => {
    const existing = notes[selectedKey] || "";
    const note = window.prompt(existing ? "Edit your note for this date:" : "Add a note for this date:", existing);
    if (note === null) return;
    const updated = { ...notes, [selectedKey]: note.trim() };
    if (!note.trim()) delete updated[selectedKey];
    setNotes(updated);
    localStorage.setItem("plannix-calendar-notes", JSON.stringify(updated));
    toast.success(note.trim() ? "Note saved!" : "Note removed!");
  };

  const handleAddTask = () => {
    if (!newTitle.trim()) {
      toast.error("Please enter a task title");
      return;
    }
    onAddTask({
      title: newTitle.trim(),
      description: newDescription.trim(),
      category: newCategory,
      priority: newPriority,
      status: "todo",
      due: format(selectedDate, "yyyy-MM-dd"),
    });
    setNewTitle("");
    setNewDescription("");
    setNewCategory("Personal");
    setNewPriority("Medium");
    setShowModal(false);
  };

  const toggleTask = (task: Task) => {
    onToggleTask(task.id);
    toast.success(task.status === "completed" ? "Task marked as pending" : "Task completed! 🎉");
  };

  return (
    <div className="calendar-page min-h-full bg-[#E9F0E7] p-4 md:p-7">
      <style>{`
        .calendar-page {
          animation: calPageEnter .6s ease both;
        }
        .calendar-page .cal-header {
          animation: calSlideUp .65s cubic-bezier(.22,1,.36,1) both;
        }
        .calendar-page .cal-main {
          animation: calSlideUp .7s .1s cubic-bezier(.22,1,.36,1) both;
        }
        .calendar-page .cal-side {
          animation: calSlideUp .7s .2s cubic-bezier(.22,1,.36,1) both;
        }

        /* Main calendar card */
        .calendar-page .cal-planner {
          transition: transform .4s cubic-bezier(.22,1,.36,1), box-shadow .4s ease, border-color .35s ease;
        }
        .calendar-page .cal-planner:hover {
          transform: translateY(-5px);
          box-shadow: 0 24px 48px rgba(36,70,55,.13);
          border-color: #BFD3BC;
        }

        /* Inner calendar surface */
        .calendar-page .cal-calendar-surface {
          transition: transform .35s ease, box-shadow .35s ease, border-color .35s ease;
        }
        .calendar-page .cal-calendar-surface:hover {
          box-shadow: 0 12px 30px rgba(36,70,55,.07);
          border-color: #BFD3BC;
        }

        /* Each calendar date */
        .calendar-page .cal-day {
          transition: transform .25s cubic-bezier(.22,1,.36,1), background-color .25s ease, box-shadow .25s ease, opacity .25s ease;
        }
        .calendar-page .cal-day:hover {
          transform: translateY(-4px) scale(1.06);
          box-shadow: 0 8px 18px rgba(49,86,59,.12);
          z-index: 3;
        }
        .calendar-page .cal-day:active {
          transform: scale(.93);
        }

        /* Individual statistic cards */
        .calendar-page .cal-stat {
          transform: translateY(0);
          transition: transform .35s cubic-bezier(.22,1,.36,1), box-shadow .35s ease, border-color .3s ease;
          animation: calCardEnter .55s cubic-bezier(.22,1,.36,1) both;
        }
        .calendar-page .cal-stat:nth-child(1) { animation-delay: .05s; }
        .calendar-page .cal-stat:nth-child(2) { animation-delay: .12s; }
        .calendar-page .cal-stat:nth-child(3) { animation-delay: .19s; }
        .calendar-page .cal-stat:hover {
          transform: translateY(-7px) scale(1.025);
          box-shadow: 0 14px 28px rgba(36,70,55,.12);
          border-color: #BFD3BC;
        }

        /* Selected date card & upcoming card */
        .calendar-page .cal-panel {
          transition: transform .35s cubic-bezier(.22,1,.36,1), box-shadow .35s ease, border-color .35s ease;
          animation: calCardEnter .65s cubic-bezier(.22,1,.36,1) both;
        }
        .calendar-page .cal-panel:nth-child(2) {
          animation-delay: .16s;
        }
        .calendar-page .cal-panel:hover {
          transform: translateY(-6px);
          box-shadow: 0 18px 35px rgba(36,70,55,.11);
          border-color: #BFD3BC;
        }

        /* Every individual task card */
        .calendar-page .cal-task {
          transition: transform .3s cubic-bezier(.22,1,.36,1), box-shadow .3s ease, border-color .3s ease, background-color .3s ease;
          animation: calCardEnter .5s cubic-bezier(.22,1,.36,1) both;
        }
        .calendar-page .cal-task:hover {
          transform: translateY(-5px) scale(1.015);
          box-shadow: 0 12px 24px rgba(36,70,55,.10);
          border-color: #BFD3BC;
          background: #FCFDFB;
        }

        /* Each upcoming task row */
        .calendar-page .cal-upcoming {
          border-radius: 14px;
          padding: 10px 8px;
          margin-left: -8px;
          margin-right: -8px;
          transition: transform .3s cubic-bezier(.22,1,.36,1), background-color .3s ease, box-shadow .3s ease;
          animation: calCardEnter .5s cubic-bezier(.22,1,.36,1) both;
        }
        .calendar-page .cal-upcoming:nth-child(2) { animation-delay: .07s; }
        .calendar-page .cal-upcoming:nth-child(3) { animation-delay: .14s; }
        .calendar-page .cal-upcoming:nth-child(4) { animation-delay: .21s; }
        .calendar-page .cal-upcoming:nth-child(5) { animation-delay: .28s; }
        .calendar-page .cal-upcoming:hover {
          transform: translateX(5px) scale(1.015);
          background: #F1F6EF;
          box-shadow: 0 7px 18px rgba(36,70,55,.06);
        }

        /* Notes */
        .calendar-page .cal-note {
          transition: transform .3s ease, box-shadow .3s ease, background-color .3s ease;
        }
        .calendar-page .cal-note:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 20px rgba(36,70,55,.06);
        }
        .calendar-page .cal-note-preview {
          transform-origin: top;
          animation: calNoteEnter .35s ease both;
          transition: transform .3s ease, box-shadow .3s ease;
        }
        .calendar-page .cal-note-preview:hover {
          transform: translateY(-2px);
          box-shadow: 0 7px 18px rgba(180,145,55,.09);
        }

        /* Buttons */
        .calendar-page .cal-button {
          transition: transform .25s cubic-bezier(.22,1,.36,1), box-shadow .25s ease, background-color .25s ease, color .25s ease;
        }
        .calendar-page .cal-button:hover {
          transform: translateY(-3px);
          box-shadow: 0 7px 16px rgba(36,70,55,.12);
        }
        .calendar-page .cal-button:active {
          transform: scale(.94);
          box-shadow: none;
        }

        /* Modal */
        .calendar-page .cal-modal-backdrop {
          animation: calBackdrop .25s ease both;
        }
        .calendar-page .cal-modal {
          animation: calModalEnter .4s cubic-bezier(.22,1,.36,1) both;
          transition: box-shadow .3s ease;
        }
        .calendar-page .cal-modal:hover {
          box-shadow: 0 30px 80px rgba(24,55,42,.25);
        }

        /* Decorative stars */
        .calendar-page .cal-star {
          animation: calFloat 4s ease-in-out infinite;
        }
        .calendar-page .cal-star:nth-child(2) { animation-delay: 1s; }
        .calendar-page .cal-star:nth-child(3) { animation-delay: 1.8s; }

        @keyframes calPageEnter {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes calSlideUp {
          from { opacity: 0; transform: translateY(22px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes calCardEnter {
          from { opacity: 0; transform: translateY(15px) scale(.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes calModalEnter {
          from { opacity: 0; transform: translateY(28px) scale(.94); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes calBackdrop {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes calNoteEnter {
          from { opacity: 0; transform: translateY(-8px) scale(.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes calFloat {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-5px) rotate(8deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          .calendar-page, .calendar-page *, .calendar-page *::before, .calendar-page *::after {
            animation-duration: .01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: .01ms !important;
          }
        }
      `}</style>

      <div className="mx-auto max-w-[1350px]">
        <div className="cal-header mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-[#244637]">My Calendar</h1>
            <p className="mt-1 text-sm text-[#718674]">A little space to plan your days 🌿</p>
          </div>
          <button onClick={() => setShowModal(true)} className="cal-button flex items-center gap-2 rounded-xl bg-[#244637] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#18372A] hover:-translate-y-0.5">
            <Plus size={17} /> Add task
          </button>
        </div>

        <div className="cal-main grid grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="cal-planner overflow-hidden rounded-[30px] border border-[#D8E5D5] bg-gradient-to-br from-[#D9E9D7] via-[#E8F1E5] to-[#F4F5E9] p-4 shadow-[0_12px_35px_rgba(36,70,55,0.08)] sm:p-6">
            <div className="cal-calendar-surface relative mb-5 overflow-hidden rounded-[24px] border border-[#C8D9C5] bg-[#FBFCF8] p-5 sm:p-7">
              <div className="pointer-events-none absolute -right-5 -top-7 h-24 w-28 rounded-full bg-[#E7EFE1] blur-2xl" />
              <div className="pointer-events-none absolute -bottom-8 -left-4 h-24 w-28 rounded-full bg-[#DDEBDD] blur-2xl" />
              <div className="cal-star pointer-events-none absolute right-8 top-5 text-[#E5C95E]">✦</div>
              <div className="cal-star pointer-events-none absolute left-8 top-16 text-[#E5C95E]">✧</div>
              <div className="cal-star pointer-events-none absolute bottom-5 right-12 text-[#E5C95E]">✦</div>

              <div className="relative flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#829782]"><Sparkles size={14} /> Your little planner</div>
                  <h2 className="text-2xl font-bold tracking-tight text-[#244637] sm:text-3xl">A little time for everything</h2>
                </div>
                <button onClick={goToday} className="cal-button rounded-full border border-[#D5E1D1] bg-white px-4 py-2 text-xs font-bold text-[#31563B] transition hover:bg-[#EAF2E7]">Today</button>
              </div>

              <div className="relative mt-6 flex items-center justify-between">
                <button onClick={() => changeMonth(-1)} className="cal-button flex h-10 w-10 items-center justify-center rounded-full border border-[#D8E4D5] bg-white text-[#31563B] transition hover:bg-[#E7EFE4]" aria-label="Previous"><ChevronLeft size={18} /></button>
                <div className="text-center">
                  <h3 className="text-2xl font-extrabold text-[#31563B] sm:text-3xl">{format(view === "Week" ? selectedDate : currentMonth, "MMMM")}</h3>
                  <p className="text-sm font-semibold text-[#8CA18B]">{format(view === "Week" ? selectedDate : currentMonth, "yyyy")}</p>
                </div>
                <button onClick={() => changeMonth(1)} className="cal-button flex h-10 w-10 items-center justify-center rounded-full border border-[#D8E4D5] bg-white text-[#31563B] transition hover:bg-[#E7EFE4]" aria-label="Next"><ChevronRight size={18} /></button>
              </div>

              <div className="relative mt-5 flex justify-center">
                <div className="flex rounded-full bg-[#E8F0E5] p-1">
                  {(["Month", "Week"] as const).map((option) => (
                    <button key={option} onClick={() => setView(option)} className={`cal-button rounded-full px-5 py-2 text-xs font-bold transition ${view === option ? "bg-[#31563B] text-white shadow-sm" : "text-[#718674] hover:text-[#31563B]"}`}>{option}</button>
                  ))}
                </div>
              </div>

              <div className="relative mt-6 grid grid-cols-7 gap-1.5 sm:gap-2">
                {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((day) => (
                  <div key={day} className="py-2 text-center text-[10px] font-extrabold tracking-wide text-[#8CA18B] sm:text-xs">{day}</div>
                ))}
                {visibleDays.map((date) => {
                  const dayTasks = getDayTasks(date);
                  const selected = isSameDay(date, selectedDate);
                  const inMonth = isSameMonth(date, currentMonth);
                  const today = isToday(date);
                  const hasNote = !!notes[format(date, "yyyy-MM-dd")];
                  return (
                    <button key={date.toISOString()} onClick={() => { setSelectedDate(date); if (view === "Week") setCurrentMonth(date); }} onDoubleClick={() => {
                      setSelectedDate(date);
                      const key = format(date, "yyyy-MM-dd");
                      const note = window.prompt("Add a note for this date:", notes[key] || "");
                      if (note !== null) {
                        const updated = { ...notes, [key]: note.trim() };
                        if (!note.trim()) delete updated[key];
                        setNotes(updated);
                        localStorage.setItem("plannix-calendar-notes", JSON.stringify(updated));
                        toast.success(note.trim() ? "Note saved!" : "Note removed!");
                      }
                    }} className={`cal-day relative flex min-h-[58px] flex-col items-center justify-center rounded-2xl p-1 transition-all sm:min-h-[76px] ${selected ? "bg-[#FDFCF6] ring-2 ring-[#9DB59D] shadow-sm" : today ? "bg-[#31563B] text-white shadow-sm" : "hover:bg-[#F6F8F2]"} ${!inMonth && view === "Month" ? "opacity-40" : ""}`}>
                      <span className={`text-sm font-bold ${selected ? "text-[#31563B]" : today ? "text-white" : "text-[#4C654F]"}`}>{format(date, "d")}</span>
                      {hasNote && <span className="absolute right-1 top-1 text-[9px] text-[#D8B842]">★</span>}
                      <div className="mt-1 flex min-h-[7px] items-center justify-center gap-1">
                        {dayTasks.slice(0, 3).map((item) => (
                          <span key={item.task.id} className={`h-1.5 w-1.5 rounded-full ${selected || today ? "bg-[#A6C2A3]" : item.task.status === "completed" ? "bg-[#91B39A]" : item.task.priority === "High" ? "bg-[#D58C8C]" : item.task.priority === "Medium" ? "bg-[#D9B96A]" : "bg-[#83A58A]"}`} />
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="cal-note relative mt-5 flex items-center justify-between rounded-2xl bg-[#E9F1E5] px-4 py-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-[#31563B]"><StickyNote size={16} />{selectedNote ? "Note saved for this day" : "Double-click a date to add a note"}</div>
                <button onClick={saveNote} className="cal-button rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-[#31563B] transition hover:bg-[#DCE9D8]">{selectedNote ? "Edit note" : "Add note"}</button>
              </div>
              {selectedNote && <div className="cal-note-preview relative mt-2 rounded-xl border border-[#E8D99C] bg-[#FFF9DF] px-4 py-3 text-sm text-[#77663A]">{selectedNote}</div>}
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "All tasks", value: tasks.length, color: "text-[#31563B]", bg: "bg-[#FBFCF8]" },
                { label: "Remaining", value: pendingCount, color: "text-[#B58C3D]", bg: "bg-[#FFF9E9]" },
                { label: "Completed", value: completedCount, color: "text-[#64866B]", bg: "bg-[#EDF5EC]" },
              ].map((stat) => (
                <div key={stat.label} className={`cal-stat rounded-2xl border border-[#D8E5D5] ${stat.bg} p-4`}>
                  <p className="text-xs font-semibold text-[#849784]">{stat.label}</p>
                  <p className={`mt-1 text-2xl font-extrabold ${stat.color}`}>{stat.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="cal-side space-y-5">
            <div className="cal-panel rounded-[26px] border border-[#D8E5D5] bg-[#FBFCF8] p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div><p className="text-xs font-bold uppercase tracking-wider text-[#8CA18B]">Selected date</p><h3 className="mt-1 text-lg font-extrabold text-[#244637]">{format(selectedDate, "EEE, MMM d")}</h3></div>
                <div className="rounded-xl bg-[#E8F0E5] p-2 text-[#31563B]"><CalendarDays size={20} /></div>
              </div>
              <div className="space-y-3">
                {selectedTasks.length === 0 ? (
                  <div className="rounded-2xl bg-[#F0F5ED] px-4 py-8 text-center">
                    <div className="mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#8CA18B]"><Sparkles size={19} /></div>
                    <p className="text-sm font-semibold text-[#58715B]">Nothing planned yet</p>
                    <p className="mt-1 text-xs text-[#93A593]">Enjoy the free space or add a task.</p>
                    <button onClick={() => setShowModal(true)} className="cal-button mt-3 inline-flex items-center gap-1 rounded-lg bg-[#31563B] px-3 py-2 text-xs font-bold text-white hover:bg-[#244637]"><Plus size={14} /> Add task</button>
                  </div>
                ) : (
                  selectedTasks.map(({ task }) => (
                    <div key={task.id} className="cal-task rounded-2xl border border-[#E5ECE1] bg-white p-3.5">
                      <div className="flex items-start gap-3">
                        <button onClick={() => toggleTask(task)} className="mt-0.5 text-[#7C9A80] transition hover:scale-110" aria-label="Toggle task completion">{task.status === "completed" ? <CheckCircle2 size={19} /> : <Circle size={19} />}</button>
                        <div className="min-w-0 flex-1">
                          <p className={`text-sm font-bold text-[#31563B] ${task.status === "completed" ? "line-through opacity-50" : ""}`}>{task.title}</p>
                          {task.description && <p className="mt-1 text-xs text-[#839684]">{task.description}</p>}
                          <div className="mt-2 flex flex-wrap items-center gap-1.5"><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${priorityStyles[task.priority]}`}>{task.priority}</span><span className="rounded-full bg-[#EDF3EA] px-2 py-1 text-[10px] font-bold text-[#6B856F]">{task.category}</span></div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="cal-panel rounded-[26px] border border-[#D8E5D5] bg-[#FBFCF8] p-5 shadow-sm">
              <h3 className="mb-4 text-base font-extrabold text-[#244637]">Coming up 🌱</h3>
              {upcomingTasks.length === 0 ? (
                <p className="rounded-xl bg-[#F0F5ED] p-4 text-sm text-[#8CA18B]">No upcoming tasks yet.</p>
              ) : (
                <div className="space-y-3">
                  {upcomingTasks.map(({ task, date }) => (
                    <div key={task.id} className="cal-upcoming flex items-start gap-3 border-b border-[#EDF2E9] pb-3 last:border-0 last:pb-0">
                      <div className="min-w-[42px] rounded-xl bg-[#E8F0E5] px-2 py-2 text-center"><p className="text-[10px] font-bold uppercase text-[#829782]">{format(date!, "MMM")}</p><p className="text-lg font-extrabold text-[#31563B]">{format(date!, "d")}</p></div>
                      <div className="min-w-0 flex-1"><p className="text-sm font-bold text-[#31563B]">{task.title}</p><p className="mt-1 text-xs text-[#8CA18B]">{task.category}</p></div>
                      <span className={`rounded-full px-2 py-1 text-[10px] font-bold ${priorityStyles[task.priority]}`}>{task.priority}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="cal-modal-backdrop fixed inset-0 z-50 flex items-center justify-center bg-[#18372A]/45 p-4 backdrop-blur-sm">
          <div className="cal-modal w-full max-w-md rounded-[28px] border border-[#D8E5D5] bg-[#FBFCF8] p-5 shadow-2xl sm:p-6">
            <div className="mb-5 flex items-center justify-between">
              <div><p className="text-xs font-bold uppercase tracking-wider text-[#8CA18B]">New task</p><h3 className="mt-1 text-xl font-extrabold text-[#244637]">Add to your day 🌿</h3></div>
              <button onClick={() => setShowModal(false)} className="cal-button flex h-9 w-9 items-center justify-center rounded-full bg-[#E8F0E5] text-[#31563B] hover:bg-[#DCE9D8]" aria-label="Close modal"><X size={17} /></button>
            </div>
            <div className="mb-4 rounded-xl bg-[#EAF1E6] px-3 py-2 text-xs font-bold text-[#55705A]">Date: {format(selectedDate, "EEEE, MMMM d, yyyy")}</div>
            <div className="space-y-3">
              <div>
                <label className="mb-1.5 block text-xs font-bold text-[#58715B]">Task title *</label>
                <input autoFocus value={newTitle} onChange={(e) => setNewTitle(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAddTask()} placeholder="What do you need to do?" className="w-full rounded-xl border border-[#D8E5D5] bg-white px-3.5 py-3 text-sm text-[#31563B] outline-none transition focus:border-[#88A58B] focus:ring-2 focus:ring-[#E1EBDD]" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold text-[#58715B]">Description</label>
                <textarea value={newDescription} onChange={(e) => setNewDescription(e.target.value)} placeholder="Add a little detail..." rows={2} className="w-full resize-none rounded-xl border border-[#D8E5D5] bg-white px-3.5 py-3 text-sm text-[#31563B] outline-none transition focus:border-[#88A58B] focus:ring-2 focus:ring-[#E1EBDD]" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-[#58715B]">Category</label>
                  <select value={newCategory} onChange={(e) => setNewCategory(e.target.value)} className="w-full rounded-xl border border-[#D8E5D5] bg-white px-3 py-3 text-sm text-[#31563B] outline-none focus:border-[#88A58B]">
                    {["Personal", "Development", "Design", "Planning", "Work", "Study", "Health", "Other"].map((category) => <option key={category}>{category}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-[#58715B]">Priority</label>
                  <select value={newPriority} onChange={(e) => setNewPriority(e.target.value as Task["priority"])} className="w-full rounded-xl border border-[#D8E5D5] bg-white px-3 py-3 text-sm text-[#31563B] outline-none focus:border-[#88A58B]">
                    <option>Low</option><option>Medium</option><option>High</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="mt-5 flex gap-3">
              <button onClick={() => setShowModal(false)} className="cal-button flex-1 rounded-xl border border-[#D8E5D5] bg-white px-4 py-3 text-sm font-bold text-[#58715B] transition hover:bg-[#F0F5ED]">Cancel</button>
              <button onClick={handleAddTask} className="cal-button flex-1 rounded-xl bg-[#31563B] px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#244637]">Create task</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
