import { useMemo } from "react";
import type { CSSProperties } from "react";
import {
  Activity, CheckCircle2, Circle, Clock3, AlertCircle, TrendingUp,
  CalendarDays, Target, Zap, ArrowUpRight, ListTodo, Sparkles
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis,
  Tooltip, PieChart, Pie, Cell
} from "recharts";
import { format, parseISO, startOfWeek, addDays, isSameDay, isToday, isTomorrow } from "date-fns";

type Task = {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: "High" | "Medium" | "Low";
  status: "todo" | "in-progress" | "completed";
  due: string;
};

type AnalyticsPageProps = { tasks: Task[] };

const GREEN = "#31563B";
const SAGE = "#91A991";
const PALE = "#DCE8DA";
const COLORS = ["#31563B", "#91A991", "#DCE8DA"];

const getTaskDate = (due: string) => {
  if (due === "Today") return new Date();
  if (due === "Tomorrow") return addDays(new Date(), 1);
  try {
    const date = parseISO(due);
    return isNaN(date.getTime()) ? null : date;
  } catch {
    return null;
  }
};

const percent = (value: number, total: number) =>
  total === 0 ? 0 : Math.round((value / total) * 100);

const statusLabel = (status: Task["status"]) =>
  status === "todo" ? "To Do" : status === "in-progress" ? "In Progress" : "Completed";

export default function AnalyticsPage({ tasks }: AnalyticsPageProps) {
  const total = tasks.length;
  const completed = tasks.filter((task) => task.status === "completed").length;
  const inProgress = tasks.filter((task) => task.status === "in-progress").length;
  const todo = tasks.filter((task) => task.status === "todo").length;
  const completion = percent(completed, total);

  const overdue = tasks.filter((task) => {
    const date = getTaskDate(task.due);
    return date && date < new Date(new Date().setHours(0, 0, 0, 0)) && task.status !== "completed";
  }).length;

  const weekData = useMemo(() => {
    const start = startOfWeek(new Date(), { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, i) => {
      const date = addDays(start, i);
      const count = tasks.filter((task) => {
        const taskDate = getTaskDate(task.due);
        return taskDate && isSameDay(taskDate, date);
      }).length;
      return { day: format(date, "EEE"), date: format(date, "dd"), tasks: count, today: isToday(date) };
    });
  }, [tasks]);

  const statusData = [
    { name: "Completed", value: completed, color: GREEN },
    { name: "In Progress", value: inProgress, color: SAGE },
    { name: "To Do", value: todo, color: PALE },
  ].filter((item) => item.value > 0);

  const priorityData = [
    { name: "High", value: tasks.filter((t) => t.priority === "High").length, color: "#52765A" },
    { name: "Medium", value: tasks.filter((t) => t.priority === "Medium").length, color: "#A7BBA2" },
    { name: "Low", value: tasks.filter((t) => t.priority === "Low").length, color: "#DCE8DA" },
  ];

  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {};
    tasks.forEach((task) => {
      counts[task.category || "Other"] = (counts[task.category || "Other"] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [tasks]);

  const recentTasks = [...tasks].filter((task) => task.status === "completed").slice(-4).reverse();

  const upcomingTasks = tasks
    .filter((task) => task.status !== "completed")
    .sort((a, b) => {
      const dateA = getTaskDate(a.due)?.getTime() ?? Infinity;
      const dateB = getTaskDate(b.due)?.getTime() ?? Infinity;
      return dateA - dateB;
    })
    .slice(0, 4);

  const productivityMessage =
    total === 0 ? "Start by adding your first task." :
    completion >= 75 ? "You're doing amazing. Keep your momentum going!" :
    completion >= 40 ? "You're making progress. One task at a time." :
    "Every small step counts. Let's get started!";

  const card = "analytics-card";

  const chartTooltip = {
    contentStyle: {
      background: "#fff",
      border: "1px solid #E7EDE5",
      borderRadius: "14px",
      boxShadow: "0 8px 24px rgba(34,65,43,0.08)",
      fontSize: "12px",
      padding: "10px 14px",
    },
  };

  return (
    <div className="analytics-page min-h-full bg-[#F5F7F2] p-4 sm:p-6 lg:p-8">
      <style>{`
        .analytics-page {
          --agreen:#31563B;
          --sage:#91A991;
          --muted:#91A092;
          --border:#E6EDE4;
          animation:anPageIn .65s cubic-bezier(.2,.8,.2,1) both;
        }

        @keyframes anPageIn {
          from {opacity:0;transform:translateY(16px)}
          to {opacity:1;transform:translateY(0)}
        }

        .an-reveal {
          opacity:0;
          animation:anReveal .75s cubic-bezier(.16,1,.3,1) forwards;
        }

        @keyframes anReveal {
          from {opacity:0;transform:translateY(24px) scale(.985);filter:blur(3px)}
          to {opacity:1;transform:translateY(0) scale(1);filter:blur(0)}
        }

        .an-d1{animation-delay:.07s}
        .an-d2{animation-delay:.14s}
        .an-d3{animation-delay:.21s}
        .an-d4{animation-delay:.28s}
        .an-d5{animation-delay:.35s}
        .an-d6{animation-delay:.42s}

        .analytics-card {
          background:white;
          border:1px solid var(--border);
          border-radius:24px;
          box-shadow:0 3px 12px rgba(41,67,46,.025);
          transition:transform .45s cubic-bezier(.2,.8,.2,1),box-shadow .45s,border-color .35s;
        }

        .analytics-card:hover {
          transform:translateY(-4px);
          box-shadow:0 15px 35px rgba(41,67,46,.07);
          border-color:#D5E2D3;
        }

        .analytics-stat {
          position:relative;
          overflow:hidden;
          background:white;
          border:1px solid var(--border);
          border-radius:22px;
          box-shadow:0 3px 12px rgba(41,67,46,.025);
          transition:transform .45s cubic-bezier(.2,.8,.2,1),box-shadow .45s,border-color .35s;
        }

        .analytics-stat:after {
          content:"";
          position:absolute;
          width:120px;
          height:120px;
          border-radius:50%;
          right:-65px;
          bottom:-75px;
          background:var(--stat-glow,#EFF4EC);
          opacity:.55;
          transition:transform .5s,opacity .5s;
        }

        .analytics-stat:hover {
          transform:translateY(-6px);
          box-shadow:0 16px 32px rgba(41,67,46,.08);
          border-color:#D1DFD0;
        }

        .analytics-stat:hover:after {
          transform:scale(1.6);
          opacity:.8;
        }

        .an-icon {
          transition:transform .4s cubic-bezier(.2,.8,.2,1),background .3s;
        }

        .analytics-stat:hover .an-icon {
          transform:rotate(-8deg) scale(1.08);
        }

        .an-banner {
          position:relative;
          overflow:hidden;
        }

        .an-banner:after {
          content:"";
          position:absolute;
          top:-100%;
          left:-40%;
          height:300%;
          width:40%;
          background:linear-gradient(90deg,transparent,rgba(255,255,255,.09),transparent);
          transform:rotate(18deg);
          animation:anShine 1.8s ease .35s both;
          pointer-events:none;
        }

        @keyframes anShine {
          to {left:145%}
        }

        .an-float {animation:anFloat 6s ease-in-out infinite alternate}
        .an-float2 {animation:anFloat 8s ease-in-out -2s infinite alternate}

        @keyframes anFloat {
          from {transform:translate(0,0)}
          to {transform:translate(-12px,12px)}
        }

        .an-ring {
          animation:anRing .8s cubic-bezier(.16,1,.3,1) .2s both;
        }

        @keyframes anRing {
          from {opacity:0;transform:scale(.65) rotate(-35deg)}
          to {opacity:1;transform:scale(1) rotate(0)}
        }

        .an-progress {
          overflow:hidden;
          border-radius:999px;
          background:#EFF3EC;
        }

        .an-progress-fill {
          height:100%;
          border-radius:999px;
          transform-origin:left;
          animation:anGrow 1.2s cubic-bezier(.16,1,.3,1) .35s both;
          transition:filter .3s, height .3s;
        }

        @keyframes anGrow {
          from {transform:scaleX(0)}
          to {transform:scaleX(1)}
        }

        /* PRIORITY CARD HOVER */
        .an-priority-card {
          position:relative;
          padding:13px 12px;
          margin:0 -12px;
          border-radius:16px;
          transition:background .35s,transform .35s,box-shadow .35s;
        }

        .an-priority-card:hover {
          background:linear-gradient(110deg,#F2F7F0,#FAFCF9);
          transform:translateX(5px);
          box-shadow:0 7px 18px rgba(49,86,59,.045);
        }

        .an-priority-card:hover .an-progress-fill {
          filter:saturate(1.35);
        }

        .an-priority-card:hover .an-progress {
          height:11px;
        }

        .an-priority-card .an-progress {
          transition:height .3s;
        }

        .an-priority-card:hover .an-priority-label {
          color:#31563B;
        }

        .an-priority-label {
          transition:color .3s;
        }

        /* CATEGORY CARD HOVER */
        .an-category {
          padding:9px;
          margin:-9px;
          border-radius:15px;
          transition:transform .35s,background .35s,box-shadow .35s;
        }

        .an-category:hover {
          transform:translateX(5px);
          background:#F2F7F0;
          box-shadow:0 6px 18px rgba(49,86,59,.045);
        }

        .an-category-icon {
          transition:transform .35s,box-shadow .35s;
        }

        .an-category:hover .an-category-icon {
          transform:scale(1.12) rotate(-5deg);
          box-shadow:0 5px 12px rgba(49,86,59,.08);
        }

        .an-category .an-progress-fill {
          transition:filter .3s;
        }

        .an-category:hover .an-progress-fill {
          filter:saturate(1.4) brightness(1.04);
        }

        /* RECENTLY COMPLETED HOVER */
        .an-row {
          transition:transform .35s cubic-bezier(.2,.8,.2,1),background .35s,box-shadow .35s,border-color .35s;
          border:1px solid transparent;
        }

        .an-row:hover {
          transform:translateX(5px) scale(1.015);
          background:#EDF4EB;
          box-shadow:0 8px 20px rgba(49,86,59,.07);
          border-color:#DDE9DC;
        }

        .an-completed-row {
          position:relative;
          overflow:hidden;
        }

        .an-completed-row:before {
          content:"";
          position:absolute;
          inset:0;
          transform:translateX(-110%);
          background:linear-gradient(100deg,transparent,rgba(255,255,255,.65),transparent);
          transition:transform .65s ease;
          pointer-events:none;
        }

        .an-completed-row:hover:before {
          transform:translateX(110%);
        }

        .an-completed-icon {
          transition:transform .4s cubic-bezier(.2,.8,.2,1),background .3s;
        }

        .an-completed-row:hover .an-completed-icon {
          transform:rotate(-10deg) scale(1.12);
          background:#D7E7D9;
        }

        .an-done-badge {
          transition:transform .3s,background .3s;
        }

        .an-completed-row:hover .an-done-badge {
          transform:scale(1.07);
          background:#E5F1E4;
        }

        /* UPCOMING */
        .an-upcoming-row {
          transition:transform .35s,background .35s,box-shadow .35s;
        }

        .an-upcoming-row:hover {
          transform:translateX(5px);
          background:#EDF4EB;
          box-shadow:0 7px 18px rgba(49,86,59,.05);
        }

        .an-legend {
          transition:transform .3s;
        }

        .an-legend:hover {
          transform:translateX(3px);
        }

        @media(prefers-reduced-motion:reduce) {
          .analytics-page *,.analytics-page *:before,.analytics-page *:after {
            animation:none!important;
            transition:none!important;
            scroll-behavior:auto!important;
          }
          .an-reveal {opacity:1}
        }
      `}</style>

      <div className="mx-auto max-w-[1500px] space-y-6 sm:space-y-7">

        {/* HEADER */}
        <header className="an-reveal flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-[#8CA18A] text-[11px] font-bold uppercase tracking-[2.2px]">
              <Activity size={14} /> Your productivity
            </div>
            <h1 className="text-3xl sm:text-[36px] font-bold tracking-tight text-[#244637]">Analytics</h1>
            <p className="mt-1.5 text-sm text-[#879687]">A little progress every day adds up to big results.</p>
          </div>
          <div className="an-reveal an-d2 flex w-fit items-center gap-2 rounded-2xl border border-[#E4EDE1] bg-white px-4 py-3 text-xs font-semibold text-[#45634B] shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#EEF4EC]"><CalendarDays size={15} /></span>
            <span>This week <span className="mx-1 text-[#C3D0C0]">·</span> {format(new Date(), "MMM d")}</span>
          </div>
        </header>

        {/* PRODUCTIVITY BANNER */}
        <section className="an-reveal an-d1 an-banner relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#244637] via-[#31563B] to-[#496D51] p-6 sm:p-8 text-white shadow-[0_14px_35px_rgba(36,70,55,0.12)]">
          <div className="an-float absolute -right-16 -top-20 h-64 w-64 rounded-full border border-white/[0.09]" />
          <div className="an-float2 absolute right-10 -top-10 h-40 w-40 rounded-full border border-white/[0.08]" />
          <div className="absolute right-24 bottom-[-100px] h-48 w-48 rounded-full bg-[#9BB79A]/10 blur-3xl" />
          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-lg">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.07] px-3 py-1.5 text-[10px] font-semibold tracking-[1.5px] text-[#D4E4D0]">
                <Sparkles size={13} /> PRODUCTIVITY SNAPSHOT
              </div>
              <h2 className="text-2xl sm:text-[28px] font-bold leading-snug tracking-tight">{productivityMessage}</h2>
              <p className="mt-2 max-w-md text-sm leading-6 text-white/65">
                You've completed {completed} out of {total} tasks. Stay focused on what matters and celebrate your little wins.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <span className="rounded-full bg-white/[0.09] px-3 py-1.5 text-[11px] text-white/75">{completed} completed</span>
                <span className="rounded-full bg-white/[0.09] px-3 py-1.5 text-[11px] text-white/75">{inProgress} in progress</span>
                <span className="rounded-full bg-white/[0.09] px-3 py-1.5 text-[11px] text-white/75">{todo} remaining</span>
              </div>
            </div>
            <div className="an-reveal an-d3 flex shrink-0 items-center gap-4 rounded-[22px] border border-white/[0.11] bg-white/[0.07] p-4 backdrop-blur-md transition-all duration-500 hover:bg-white/[0.11] hover:-translate-y-1">
              <div className="an-ring flex h-[104px] w-[104px] items-center justify-center rounded-full" style={{ background: `conic-gradient(#DCE8DA ${completion * 3.6}deg, rgba(255,255,255,0.12) 0deg)` }}>
                <div className="flex h-[82px] w-[82px] flex-col items-center justify-center rounded-full bg-[#31563B] shadow-inner">
                  <span className="text-2xl font-bold tracking-tight">{completion}%</span>
                  <span className="text-[9px] uppercase tracking-[1.5px] text-white/60">Complete</span>
                </div>
              </div>
              <div className="pr-2">
                <p className="text-xs text-white/55">Completion rate</p>
                <p className="mt-1 text-3xl font-bold">{completed}<span className="text-sm font-medium text-white/40">/{total}</span></p>
                <p className="mt-1 text-xs text-[#D4E4D0]">tasks finished</p>
              </div>
            </div>
          </div>
        </section>

        {/* STAT CARDS */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { title: "Total Tasks", value: total, subtitle: "All your tasks", icon: ListTodo, color: "#31563B", bg: "#E7EFE5" },
            { title: "Completed", value: completed, subtitle: `${completion}% completion rate`, icon: CheckCircle2, color: "#52765A", bg: "#E9F2E8" },
            { title: "In Progress", value: inProgress, subtitle: "Currently working on", icon: Clock3, color: "#718D75", bg: "#EFF3EB" },
            { title: "Overdue", value: overdue, subtitle: "Need your attention", icon: AlertCircle, color: "#8A7262", bg: "#F3ECE6" },
          ].map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className={`analytics-stat an-reveal an-d${index + 1} p-5`} style={{ "--stat-glow": item.bg } as CSSProperties}>
                <div className="relative z-10 flex items-start justify-between">
                  <div>
                    <p className="text-xs font-semibold text-[#91A092]">{item.title}</p>
                    <p className="mt-3 text-[34px] font-bold tracking-tight text-[#244637]">{item.value}</p>
                    <p className="mt-1 text-xs text-[#9BA99B]">{item.subtitle}</p>
                  </div>
                  <div className="an-icon flex h-11 w-11 items-center justify-center rounded-[15px]" style={{ background: item.bg, color: item.color }}>
                    <Icon size={19} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* CHARTS */}
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.55fr_1fr]">
          {/* WEEKLY CHART */}
          <section className={`${card} an-reveal an-d2 p-5 sm:p-6`}>
            <div className="mb-5 flex items-start justify-between">
              <div>
                <h3 className="text-[16px] font-bold text-[#31563B]">Weekly overview</h3>
                <p className="mt-1 text-xs text-[#94A194]">Tasks scheduled across this week</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-[#EFF4EC] text-[#668269] transition-transform hover:rotate-6 hover:scale-105"><TrendingUp size={18} /></div>
            </div>
            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weekData} margin={{ top: 10, right: 8, left: -22, bottom: 0 }}>
                  <defs>
                    <linearGradient id="plxWeeklyFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#91A991" stopOpacity={0.32} />
                      <stop offset="95%" stopColor="#91A991" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#EDF1EA" strokeDasharray="4 5" vertical={false} />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "#96A395", fontSize: 11 }} />
                  <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: "#96A395", fontSize: 11 }} />
                  <Tooltip {...chartTooltip} formatter={(value) => [`${value} tasks`, "Scheduled"]} labelFormatter={(label) => ` ${label}`} />
                  <Area type="monotone" dataKey="tasks" stroke="#52765A" strokeWidth={3} fill="url(#plxWeeklyFill)" activeDot={{ r: 5, fill: GREEN }} dot={{ r: 3, fill: SAGE, strokeWidth: 0 }} animationDuration={1400} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 flex items-center gap-2 text-[11px] text-[#96A395]"><span className="h-2 w-2 rounded-full bg-[#91A991]" /> Tasks scheduled by due date</div>
          </section>

          {/* STATUS CHART */}
          <section className={`${card} an-reveal an-d3 p-5 sm:p-6`}>
            <div>
              <h3 className="text-[16px] font-bold text-[#31563B]">Task distribution</h3>
              <p className="mt-1 text-xs text-[#94A194]">Your current task status</p>
            </div>
            <div className="relative mt-2 h-[205px]">
              {total === 0 ? (
                <div className="flex h-full items-center justify-center text-xs text-[#9BA99B]">No tasks to display yet</div>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={62} outerRadius={86} paddingAngle={4} stroke="none" animationDuration={1200}>
                        {statusData.map((item) => <Cell key={item.name} fill={item.color} />)}
                      </Pie>
                      <Tooltip {...chartTooltip} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-[27px] font-bold text-[#31563B]">{total}</span>
                    <span className="text-[10px] text-[#96A395]">Total tasks</span>
                  </div>
                </>
              )}
            </div>
            <div className="space-y-3 pt-1">
              {[
                { name: "Completed", value: completed, color: GREEN },
                { name: "In Progress", value: inProgress, color: SAGE },
                { name: "To Do", value: todo, color: PALE },
              ].map((item, index) => (
                <div key={item.name} className={`an-legend an-reveal an-d${index + 1} flex items-center justify-between text-xs`}>
                  <div className="flex items-center gap-2.5 text-[#788B79"><span className="h-2.5 w-2.5 rounded-full" style={{ background: item.color }} />{item.name}</div>
                  <span className="font-bold text-[#31563B]">{item.value}<span className="ml-1 font-normal text-[#A0ADA0]">({percent(item.value, total)}%)</span></span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* LOWER ANALYTICS */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {/* PRIORITY */}
          <section className={`${card} an-reveal an-d3 p-5 sm:p-6 an-special-card an-priority-section`}>
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-[16px] font-bold text-[#31563B]">Priority breakdown</h3>
                <p className="mt-1 text-xs text-[#94A194]">Know what needs attention first</p>
              </div>
              <div className="an-special-icon flex h-10 w-10 items-center justify-center rounded-[14px] bg-[#EFF4EC] text-[#668269]"><Target size={18} /></div>
            </div>
            <div className="space-y-4">
              {priorityData.map((item, index) => {
                const value = percent(item.value, total);
                return (
                  <div key={item.name} className={`an-priority-card an-reveal an-d${index + 1}`}>
                    <div className="mb-2.5 flex items-center justify-between text-xs">
                      <span className="an-priority-label font-semibold text-[#657B68]">{item.name} priority</span>
                      <span className="font-bold text-[#31563B]">{item.value} <span className="font-normal text-[#A0ADA0]">· {value}%</span></span>
                    </div>
                    <div className="an-progress h-[9px]">
                      <div className="an-progress-fill" style={{ width: `${value}%`, background: item.color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* CATEGORY */}
          <section className={`${card} an-reveal an-d4 p-5 sm:p-6 an-special-card an-category-section`}>
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="text-[16px] font-bold text-[#31563B]">By category</h3>
                <p className="mt-1 text-xs text-[#94A194]">Where your tasks are focused</p>
              </div>
              <div className="an-special-icon flex h-10 w-10 items-center justify-center rounded-[14px] bg-[#EFF4EC] text-[#668269]"><Zap size={18} /></div>
            </div>
            {categoryData.length === 0 ? (
              <div className="flex h-[160px] items-center justify-center text-xs text-[#9BA99B]">Your categories will appear here</div>
            ) : (
              <div className="space-y-3.5">
                {categoryData.map((item, index) => {
                  const color = COLORS[index % COLORS.length];
                  return (
                    <div key={item.name} className={`an-category an-reveal an-d${index + 1} flex items-center gap-3`}>
                      <div className="an-category-icon flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-bold" style={{ background: `${color}22`, color: GREEN }}>{item.name.slice(0, 1).toUpperCase()}</div>
                      <div className="min-w-0 flex-1">
                        <div className="mb-1.5 flex items-center justify-between text-xs">
                          <span className="truncate font-semibold text-[#657B68]">{item.name}</span>
                          <span className="ml-2 font-bold text-[#31563B]">{item.count}</span>
                        </div>
                        <div className="an-progress h-[6px]">
                          <div className="an-progress-fill" style={{ width: `${percent(item.count, total)}%`, background: color }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        {/* RECENT & UPCOMING */}
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          {/* RECENT COMPLETED */}
          <section className={`${card} an-reveal an-d2 p-5 sm:p-6 an-special-card an-recent-section`}>
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="text-[16px] font-bold text-[#31563B]">Recently completed</h3>
                <p className="mt-1 text-xs text-[#94A194]">Little wins worth celebrating ✨</p>
              </div>
              <div className="an-special-icon flex h-10 w-10 items-center justify-center rounded-[14px] bg-[#EAF2E8] text-[#719177"><CheckCircle2 size={19} /></div>
            </div>
            {recentTasks.length === 0 ? (
              <div className="rounded-2xl bg-[#F6F8F4] py-8 text-center text-xs text-[#9BA99B]">Completed tasks will show up here 🌱</div>
            ) : (
              <div className="space-y-2.5">
                {recentTasks.map((task, index) => (
                  <div key={task.id} className={`an-row an-completed-row an-reveal an-d${index + 1} flex items-center gap-3 rounded-2xl bg-[#F6F8F4] p-3.5`}>
                    <div className="an-completed-icon flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#E4EDE1] text-[#638169]"><CheckCircle2 size={16} /></div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-[#45634B]">{task.title}</p>
                      <p className="mt-1 text-[10px] text-[#9BA99B]">{task.category} · {task.priority} priority</p>
                    </div>
                    <span className="an-done-badge rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold text-[#638169]">Done</span>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* UPCOMING */}
          <section className={`${card} an-reveal an-d3 p-5 sm:p-6 an-special-card an-upcoming-section`}>
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="text-[16px] font-bold text-[#31563B]">Coming up</h3>
                <p className="mt-1 text-xs text-[#94A194]">Keep an eye on what's next</p>
              </div>
              <div className="an-special-icon flex h-10 w-10 items-center justify-center rounded-[14px] bg-[#EFF4EC] text-[#719177"><ArrowUpRight size={19} /></div>
            </div>
            {upcomingTasks.length === 0 ? (
              <div className="rounded-2xl bg-[#F6F8F4] py-8 text-center text-xs text-[#9BA99B]">You're all caught up! 🌿</div>
            ) : (
              <div className="space-y-2.5">
                {upcomingTasks.map((task, index) => {
                  const date = getTaskDate(task.due);
                  const dateLabel = date ? isToday(date) ? "Today" : isTomorrow(date) ? "Tomorrow" : format(date, "MMM d") : "No date";
                  return (
                    <div key={task.id} className={`an-row an-upcoming-row an-reveal an-d${index + 1} flex items-center gap-3 rounded-2xl bg-[#F6F8F4] p-3.5`}>
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-[#9FB19D]"><Circle size={15} /></div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-[#45634B]">{task.title}</p>
                        <p className="mt-1 text-[10px] text-[#9BA99B]">{task.category} · {statusLabel(task.status)}</p>
                      </div>
                      <span className="shrink-0 rounded-full border border-[#E7EDE5] bg-white px-2.5 py-1 text-[10px] font-semibold text-[#7C927D]">{dateLabel}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        {/* FOOTER */}
        <div className="an-reveal an-d4 flex items-center justify-center gap-2 rounded-2xl py-3 text-xs text-[#9BA99B]">
          <Sparkles size={13} className="text-[#A4B79E]" /> Small steps, steady growth, big things ahead.
        </div>
      </div>
    </div>
  );
}