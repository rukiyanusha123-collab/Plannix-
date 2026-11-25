
import { useEffect, useState } from "react";
import {
  UserRound,
  Bell,
  SlidersHorizontal,
  Palette,
  Database,
  ShieldCheck,
  Trash2,
  CalendarDays,
  ChevronRight,
  Clock3,
  Check,
  Leaf,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

type SettingsPageProps = {
  taskCount: number;
  onClearTasks: () => void;
};

type Settings = {
  name: string;
  workspace: string;
  email: string;
  notifications: boolean;
  taskReminders: boolean;
  completionAlerts: boolean;
  weeklySummary: boolean;
  defaultPriority: "Low" | "Medium" | "High";
  weekStartsOn: "Monday" | "Sunday";
  compactView: boolean;
};

const defaultSettings: Settings = {
  name: "Plannix User",
  workspace: "My Workspace",
  email: "",
  notifications: true,
  taskReminders: true,
  completionAlerts: true,
  weeklySummary: false,
  defaultPriority: "Medium",
  weekStartsOn: "Monday",
  compactView: false,
};

const loadSettings = (): Settings => {
  try {
    const saved = localStorage.getItem("plannix-settings");
    if (saved) return { ...defaultSettings, ...JSON.parse(saved) };
  } catch {
    // Use default settings
  }
  return defaultSettings;
};

type ToggleProps = {
  checked: boolean;
  onChange: (value: boolean) => void;
};

function Toggle({ checked, onChange }: ToggleProps) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      aria-checked={checked}
      role="switch"
      className={`relative h-6 w-11 shrink-0 rounded-full transition-all duration-300 ${
        checked ? "bg-[#58765D]" : "bg-[#D5DDD3]"
      }`}
    >
      <span
        className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-all duration-300 ${
          checked ? "left-6" : "left-1"
        }`}
      />
    </button>
  );
}

type ToggleRowProps = {
  title: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
};

function ToggleRow({ title, description, checked, onChange }: ToggleRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 py-4">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-[#45634B]">{title}</p>
        <p className="mt-1 text-xs leading-5 text-[#95A195]">{description}</p>
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  );
}

type SectionHeaderProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
};

function SectionHeader({ icon, title, description }: SectionHeaderProps) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EEF3EA] text-[#69816B]">
        {icon}
      </div>
      <div>
        <h2 className="text-sm font-bold text-[#45634B]">{title}</h2>
        <p className="mt-0.5 text-xs text-[#99A497]">{description}</p>
      </div>
    </div>
  );
}

export default function SettingsPage({
  taskCount,
  onClearTasks,
}: SettingsPageProps) {
  const [settings, setSettings] = useState<Settings>(loadSettings);

  useEffect(() => {
    try {
      localStorage.setItem("plannix-settings", JSON.stringify(settings));
    } catch {
      toast.error("Could not save your settings.");
    }
  }, [settings]);

  const update = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const inputClass =
    "mt-2 w-full rounded-xl border border-[#E6EBE2] bg-[#FAFBF8] px-4 py-3 text-sm text-[#45634B] outline-none transition focus:border-[#91A88E] focus:ring-2 focus:ring-[#91A88E]/15";

  const sectionClass =
    "rounded-2xl border border-[#E8EDE5] bg-white p-5 sm:p-6 shadow-[0_4px_20px_rgba(67,91,68,0.03)]";

  return (
    <div className="min-h-full bg-[#F5F7F2] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-[#385541] sm:text-3xl">
                Settings
              </h1>
              <Sparkles size={18} className="text-[#9EB29A]" />
            </div>
            <p className="mt-2 text-sm text-[#92A092]">
              Customize your workspace and make Plannix feel like yours.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-[#E2EADF] bg-white px-3 py-2 text-xs text-[#789079]">
            <span className="h-2 w-2 rounded-full bg-[#86A58A]" />
            Preferences saved locally
          </div>
        </div>

        {/* Profile */}
        <section className={`${sectionClass} mb-5`}>
          <SectionHeader
            icon={<UserRound size={19} />}
            title="Profile"
            description="Your personal workspace information"
          />
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="text-xs font-semibold text-[#809080]">
              Display name
              <input
                value={settings.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="Your name"
                className={inputClass}
              />
            </label>
            <label className="text-xs font-semibold text-[#809080]">
              Workspace name
              <input
                value={settings.workspace}
                onChange={(e) => update("workspace", e.target.value)}
                placeholder="My Workspace"
                className={inputClass}
              />
            </label>
            <label className="text-xs font-semibold text-[#809080] sm:col-span-2">
              Email address (optional)
              <input
                type="email"
                value={settings.email}
                onChange={(e) => update("email", e.target.value)}
                placeholder="you@example.com"
                className={inputClass}
              />
            </label>
          </div>
        </section>

        {/* Notifications */}
        <section className={`${sectionClass} mb-5`}>
          <SectionHeader
            icon={<Bell size={19} />}
            title="Notifications"
            description="Choose what you want to stay updated about"
          />
          <div className="divide-y divide-[#EDF1EA]">
            <ToggleRow
              title="Notifications"
              description="Master switch for your notification preferences"
              checked={settings.notifications}
              onChange={(value) => update("notifications", value)}
            />
            <div
              className={
                settings.notifications
                  ? ""
                  : "pointer-events-none opacity-40"
              }
            >
              <ToggleRow
                title="Task reminders"
                description="Reminders about tasks that are coming up"
                checked={settings.taskReminders}
                onChange={(value) => update("taskReminders", value)}
              />
              <ToggleRow
                title="Completion alerts"
                description="Celebrate when you complete a task"
                checked={settings.completionAlerts}
                onChange={(value) => update("completionAlerts", value)}
              />
              <ToggleRow
                title="Weekly summary"
                description="A weekly overview of your task progress"
                checked={settings.weeklySummary}
                onChange={(value) => update("weeklySummary", value)}
              />
            </div>
          </div>
          <div className="mt-3 rounded-xl bg-[#F5F8F2] p-3 text-xs leading-5 text-[#819481]">
            <Clock3 size={14} className="mr-1 inline" />
            Notification preferences are saved. Actual reminder scheduling will be
            connected later.
          </div>
        </section>

        {/* Preferences */}
        <section className={`${sectionClass} mb-5`}>
          <SectionHeader
            icon={<SlidersHorizontal size={19} />}
            title="Preferences"
            description="Set your default task management options"
          />
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="text-xs font-semibold text-[#809080]">
              Default task priority
              <select
                value={settings.defaultPriority}
                onChange={(e) =>
                  update(
                    "defaultPriority",
                    e.target.value as Settings["defaultPriority"]
                  )
                }
                className={inputClass}
              >
                <option value="Low">Low priority</option>
                <option value="Medium">Medium priority</option>
                <option value="High">High priority</option>
              </select>
            </label>
            <label className="text-xs font-semibold text-[#809080]">
              Week starts on
              <select
                value={settings.weekStartsOn}
                onChange={(e) =>
                  update(
                    "weekStartsOn",
                    e.target.value as Settings["weekStartsOn"]
                  )
                }
                className={inputClass}
              >
                <option value="Monday">Monday</option>
                <option value="Sunday">Sunday</option>
              </select>
            </label>
          </div>
          <div className="mt-4 border-t border-[#EDF1EA] pt-2">
            <ToggleRow
              title="Compact task view"
              description="Prefer a tighter layout when viewing task lists"
              checked={settings.compactView}
              onChange={(value) => update("compactView", value)}
            />
          </div>
        </section>

        {/* Appearance */}
        <section className={`${sectionClass} mb-5`}>
          <SectionHeader
            icon={<Palette size={19} />}
            title="Appearance"
            description="Your Plannix visual theme"
          />
          <div className="rounded-2xl border border-[#E6EBE2] bg-[#F8FAF6] p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#45634B] text-white">
                <Leaf size={22} />
              </div>
              <div>
                <p className="text-sm font-bold text-[#45634B]">
                  Forest & Sage
                </p>
                <p className="mt-1 text-xs text-[#94A194]">
                  Your current Plannix theme
                </p>
              </div>
              <div className="ml-auto flex items-center gap-1.5 rounded-full bg-[#EAF1E7] px-3 py-1.5 text-xs font-semibold text-[#638068]">
                <Check size={13} />
                Active
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              {["#45634B", "#789078", "#B6C8AE", "#E8EEE2", "#F5F7F2"].map(
                (color) => (
                  <div
                    key={color}
                    className="h-9 flex-1 rounded-lg border border-black/5"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                )
              )}
            </div>
          </div>
        </section>

        {/* Data */}
        <section className={`${sectionClass} mb-5`}>
          <SectionHeader
            icon={<Database size={19} />}
            title="Data & Storage"
            description="Manage your locally saved task data"
          />
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-[#F7F9F5] p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E8EFE4] text-[#6C876F]">
                <Database size={18} />
              </div>
              <div>
                <p className="text-sm font-bold text-[#45634B]">Your tasks</p>
                <p className="mt-1 text-xs text-[#95A195]">
                  {taskCount} task{taskCount !== 1 ? "s" : ""} currently saved
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                if (taskCount === 0) {
                  toast.info("There are no tasks to clear.");
                  return;
                }
                if (
                  window.confirm(
                    "Are you sure you want to delete all tasks? This action cannot be undone."
                  )
                ) {
                  onClearTasks();
                }
              }}
              className="flex items-center gap-2 rounded-xl border border-[#E8DAD4] bg-white px-4 py-2.5 text-xs font-semibold text-[#B47C70] transition hover:bg-[#FFF5F2] active:scale-[0.98]"
            >
              <Trash2 size={15} />
              Clear all tasks
            </button>
          </div>
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-[#E8EDE5] p-3">
            <ShieldCheck size={16} className="mt-0.5 shrink-0 text-[#789078]" />
            <p className="text-xs leading-5 text-[#91A091]">
              Your settings and tasks are currently stored in this browser using
              localStorage. Backend synchronization will be added later.
            </p>
          </div>
        </section>

        {/* About */}
        <section className={`${sectionClass} mb-5`}>
          <SectionHeader
            icon={<Leaf size={19} />}
            title="About Plannix"
            description="A calmer way to organize your day"
          />
          <div className="flex items-center justify-between rounded-xl bg-[#F7F9F5] p-4">
            <div>
              <p className="text-sm font-bold text-[#45634B]">
                Plannix Task Manager
              </p>
              <p className="mt-1 text-xs text-[#95A195]">
                Organize · Focus · Grow
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-[#E8EFE4] px-3 py-1.5 text-xs font-semibold text-[#708770]">
              <Sparkles size={13} />
              v1.0
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-[#EDF1EA] pt-4 text-xs text-[#95A195]">
            <span className="flex items-center gap-2">
              <CalendarDays size={14} />
              Made for mindful productivity
            </span>
            <ChevronRight size={15} />
          </div>
        </section>

        <p className="pb-6 text-center text-xs text-[#A4AEA2]">
          Made with love & a little bit of green <span>🌿</span>
        </p>
      </div>
    </div>
  );
}
