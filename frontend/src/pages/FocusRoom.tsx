
import { useEffect, useState } from "react";
import {
  ArrowLeft, Play, Pause, RotateCcw, Leaf, Clock,
  CheckCircle2, Coffee, Target, Sparkles
} from "lucide-react";

type Task = {
  id: string;
  title: string;
  status: "todo" | "in-progress" | "completed";
};

type FocusRoomProps = {
  tasks: Task[];
  onExit: () => void;
};

type Mode = "focus" | "break";

const FOCUS_TIME = 25 * 60;
const BREAK_TIME = 5 * 60;

function FocusRoom({ tasks, onExit }: FocusRoomProps) {
  const [mode, setMode] = useState<Mode>("focus");
  const [timeLeft, setTimeLeft] = useState(FOCUS_TIME);
  const [isRunning, setIsRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const [selectedTask, setSelectedTask] = useState("");

  const availableTasks = tasks.filter((task) => task.status !== "completed");
  const totalTime = mode === "focus" ? FOCUS_TIME : BREAK_TIME;
  const progress = ((totalTime - timeLeft) / totalTime) * 100;
  const minutes = Math.floor(timeLeft / 60).toString().padStart(2, "0");
  const seconds = (timeLeft % 60).toString().padStart(2, "0");

  // Timer + completion logic
  useEffect(() => {
    if (!isRunning) return;

    const timer = setTimeout(() => {
      if (timeLeft <= 1) {
        setIsRunning(false);

        if (mode === "focus") {
          setSessions((prev) => prev + 1);
          setMode("break");
          setTimeLeft(BREAK_TIME);
        } else {
          setMode("focus");
          setTimeLeft(FOCUS_TIME);
        }
      } else {
        setTimeLeft((prev) => prev - 1);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [isRunning, timeLeft, mode]);

  const handleModeChange = (newMode: Mode) => {
    setIsRunning(false);
    setMode(newMode);
    setTimeLeft(newMode === "focus" ? FOCUS_TIME : BREAK_TIME);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(mode === "focus" ? FOCUS_TIME : BREAK_TIME);
  };

  return (
    <div className="min-h-screen bg-[#f5f7f2] px-4 py-6 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <button
          onClick={onExit}
          className="mb-8 inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-[#65796b] transition hover:bg-white hover:text-[#294436]"
        >
          <ArrowLeft size={17} /> Back to dashboard
        </button>

        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-[#79917e]">
              <Leaf size={16} /> Plannix Focus Room
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-[#263f30] sm:text-4xl">
              Make space for deep work.
            </h1>
            <p className="mt-2 text-[#859387]">
              One thing at a time. You've got this.
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-[#e5ebe3] bg-white px-5 py-4 shadow-sm">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#edf4ec] text-[#63826a]">
              <CheckCircle2 size={21} />
            </div>
            <div>
              <p className="text-xs text-[#91a095]">Focus sessions completed</p>
              <p className="text-2xl font-bold text-[#294436]">{sessions}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.35fr_0.85fr]">
          {/* TIMER */}
          <section className="rounded-[30px] border border-[#e7ece5] bg-white p-5 shadow-[0_12px_40px_rgba(43,66,49,0.05)] sm:p-9">
            <div className="flex justify-center gap-2 rounded-2xl bg-[#f4f7f2] p-1.5">
              <button
                onClick={() => handleModeChange("focus")}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition ${
                  mode === "focus"
                    ? "bg-[#355b43] text-white shadow-sm"
                    : "text-[#829185] hover:bg-white"
                }`}
              >
                <Target size={16} /> Focus
              </button>
              <button
                onClick={() => handleModeChange("break")}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition ${
                  mode === "break"
                    ? "bg-[#dce9dc] text-[#355b43] shadow-sm"
                    : "text-[#829185] hover:bg-white"
                }`}
              >
                <Coffee size={16} /> Short break
              </button>
            </div>

            <div className="py-8 text-center sm:py-10">
              <div className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#92a094]">
                {mode === "focus" ? "TIME TO FOCUS" : "TAKE A BREATH"}
              </div>

              <div className="relative mx-auto flex h-64 w-64 items-center justify-center sm:h-72 sm:w-72">
                <svg className="absolute inset-0 -rotate-90" viewBox="0 0 280 280">
                  <circle
                    cx="140"
                    cy="140"
                    r="124"
                    fill="none"
                    stroke="#edf2eb"
                    strokeWidth="8"
                  />
                  <circle
                    cx="140"
                    cy="140"
                    r="124"
                    fill="none"
                    stroke={mode === "focus" ? "#63846a" : "#a6bda6"}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 124}
                    strokeDashoffset={2 * Math.PI * 124 * (1 - progress / 100)}
                    className="transition-all duration-1000"
                  />
                </svg>

                <div className="relative text-center">
                  <div className="font-mono text-6xl font-semibold tracking-tight text-[#294436] sm:text-7xl">
                    {minutes}:{seconds}
                  </div>
                  <p className="mt-3 text-sm text-[#93a095]">
                    {isRunning
                      ? "Stay in your flow..."
                      : mode === "focus"
                        ? "Ready when you are"
                        : "Rest & recharge"}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-center gap-3">
                <button
                  onClick={resetTimer}
                  className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#e7ece5] text-[#78907c] transition hover:bg-[#f5f7f2]"
                  title="Reset timer"
                >
                  <RotateCcw size={18} />
                </button>

                <button
                  onClick={() => setIsRunning((prev) => !prev)}
                  className="flex min-w-[150px] items-center justify-center gap-2 rounded-2xl bg-[#355b43] px-7 py-3.5 font-semibold text-white shadow-lg shadow-[#355b43]/15 transition hover:bg-[#294936] active:scale-[0.98]"
                >
                  {isRunning ? <Pause size={18} /> : <Play size={18} />}
                  {isRunning
                    ? "Pause"
                    : timeLeft === totalTime
                      ? "Start focus"
                      : "Resume"}
                </button>

                <button
                  onClick={() => handleModeChange(mode === "focus" ? "break" : "focus")}
                  className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#e7ece5] text-[#78907c] transition hover:bg-[#f5f7f2]"
                  title="Switch mode"
                >
                  <Clock size={18} />
                </button>
              </div>
            </div>

            <div className="rounded-2xl bg-[#f6f8f4] px-5 py-4 text-center">
              <p className="text-sm font-medium text-[#617764]">
                {mode === "focus"
                  ? "“Almost everything will work again if you unplug it for a few minutes, including you.”"
                  : "Rest is productive, too. Give yourself a moment."}
              </p>
            </div>
          </section>

          {/* SIDE PANEL */}
          <div className="flex flex-col gap-6">
            <section className="rounded-[26px] border border-[#e7ece5] bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#edf4ec] text-[#66816a]">
                  <Target size={18} />
                </div>
                <div>
                  <h2 className="font-semibold text-[#294436]">Focus on a task</h2>
                  <p className="text-xs text-[#95a196">Choose what you're working on</p>
                </div>
              </div>

              <select
                value={selectedTask}
                onChange={(e) => setSelectedTask(e.target.value)}
                className="w-full rounded-xl border border-[#e7ece5] bg-[#fafbf9] px-4 py-3 text-sm text-[#47604d] outline-none transition focus:border-[#8ba48e]"
              >
                <option value="">Choose a task...</option>
                {availableTasks.map((task) => (
                  <option key={task.id} value={task.title}>
                    {task.title}
                  </option>
                ))}
              </select>

              {selectedTask && (
                <div className="mt-4 rounded-xl bg-[#edf4ec] p-4">
                  <p className="text-xs font-medium text-[#809582]">CURRENT FOCUS</p>
                  <p className="mt-1 font-semibold text-[#355b43]">{selectedTask}</p>
                </div>
              )}
            </section>

            <section className="rounded-[26px] border border-[#e7ece5] bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-2 text-[#66816a]">
                <Sparkles size={18} />
                <h2 className="font-semibold text-[#294436]">Your focus ritual</h2>
              </div>
              <div className="space-y-4">
                {[
                  "Silence notifications",
                  "Keep only one task open",
                  "Take a break when the timer ends",
                  "Be kind to yourself",
                ].map((tip, index) => (
                  <div key={tip} className="flex items-start gap-3">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#edf4ec] text-xs font-semibold text-[#6d896f]">
                      {index + 1}
                    </div>
                    <p className="pt-0.5 text-sm text-[#748578]">{tip}</p>
                  </div>
                ))}
              </div>
            </section>

            <div className="rounded-[26px] bg-[#355b43] p-6 text-white shadow-lg shadow-[#355b43]/10">
              <Leaf size={22} className="mb-3 text-[#c6dbc5]" />
              <p className="text-lg font-semibold">Progress, not perfection.</p>
              <p className="mt-2 text-sm leading-6 text-white/70">
                Every focused minute is a little promise you kept to yourself.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FocusRoom;
