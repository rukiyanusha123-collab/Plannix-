import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, MouseEvent } from "react";
import { Check, Sprout, Trash2, Flower2, ChevronLeft, ChevronRight, Undo2 } from "lucide-react";
import "./FocusGarden.css";

export type GardenTask = {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: "High" | "Medium" | "Low";
  status: "todo" | "in-progress" | "completed";
  due: string;
};

type Props = {
  tasks: GardenTask[];
  onAddTask: (task: Omit<GardenTask, "id">) => Promise<GardenTask | null>;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => Promise<void>;
};

type Achievement = { id: string; title: string };

type Petal = {
  x: number;
  y: number;
  angle: number;
  size: number;
  opacity: number;
  landed: boolean;
  color: string;
};

const FLOWER_COLORS = [
  "#FFC1D4",
  "#FFB3CB",
  "#FFD6E3",
  "#FFA8C2",
  "#FFE3EC",
  "#FFCADB",
];

const BRANCHES = [
  "M100 185 Q72 143 39 108",
  "M100 164 Q130 132 164 89",
  "M100 143 Q79 111 62 74",
  "M100 126 Q124 101 139 62",
  "M100 110 Q96 76 98 48",
];

const TWIGS = [
  "M40 108 Q25 102 20 82",
  "M52 116 Q36 114 30 100",
  "M162 90 Q176 78 180 62",
  "M148 102 Q164 108 170 120",
  "M62 74 Q48 60 44 42",
  "M138 64 Q152 50 154 36",
  "M78 112 Q70 92 66 82",
  "M122 102 Q132 86 136 78",
];

function seedFromString(value: string) {
  let seed = 0;
  for (let i = 0; i < value.length; i++) {
    seed = (seed * 31 + value.charCodeAt(i)) >>> 0;
  }
  return seed || 1;
}

function seeded(seed: number) {
  let value = seed >>> 0;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

function getTimeOfDay() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 8) return "sunrise";
  if (hour >= 8 && hour < 16) return "day";
  if (hour >= 16 && hour < 19) return "golden";
  return "night";
}

function Blossom({
  color,
  scale = 1,
  rotate = 0,
}: {
  color: string;
  scale?: number;
  rotate?: number;
}) {
  const petalPath =
    "M0 0C-5 -3 -6 -9 -2.6 -11L0 -9.2L2.6 -11C6 -9 5 -3 0 0Z";

  return (
    <g transform={`rotate(${rotate}) scale(${scale})`}>
      {[0, 72, 144, 216, 288].map((angle) => (
        <path
          key={angle}
          d={petalPath}
          transform={`rotate(${angle})`}
          fill={color}
        />
      ))}
      <circle r="2.5" fill="#E8588A" opacity=".75" />
      {[0, 72, 144, 216, 288].map((angle) => (
        <circle
          key={angle}
          cx={Math.cos((angle * Math.PI) / 180) * 4}
          cy={Math.sin((angle * Math.PI) / 180) * 4}
          r=".8"
          fill="#FFD27A"
        />
      ))}
    </g>
  );
}

function createPetals(treeId: string): Petal[] {
  const random = seeded(seedFromString(treeId + "-petals"));
  return Array.from({ length: 16 }, (_, i) => ({
    x: random() * 160 - 80,
    y: random() * 70 - 35,
    angle: random() * 360,
    size: 0.65 + random() * 0.5,
    opacity: 0,
    landed: false,
    color: FLOWER_COLORS[i % FLOWER_COLORS.length],
  }));
}

function PetalFall({ treeId }: { treeId: string }) {
  const [reducedMotion] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  const [petals, setPetals] = useState<Petal[]>(() => {
    const initial = createPetals(treeId);
    if (!reducedMotion) return initial;
    return initial.map((p) => ({
      ...p,
      opacity: 0.75,
      landed: true,
      y: 82,
      size: 0.7,
    }));
  });

  const raf = useRef<number | null>(null);

  useEffect(() => {
    if (reducedMotion) return;

    const start = performance.now();

    const tick = (now: number) => {
      const elapsed = (now - start) / 1000;

      setPetals((prev) =>
        prev.map((p, i) => {
          const delay = 0.8 + i * 0.08;
          if (elapsed < delay) return p;

          const orbit = elapsed - delay;
          const orbitDuration = 7.2;
          const fallDuration = 3.2;

          if (orbit < orbitDuration) {
            const theta = (orbit / 2.4) * Math.PI * 2;
            const phase = i * 0.55;
            const front = Math.sin(theta + phase) > 0;

            return {
              ...p,
              x: Math.cos(theta + phase) * (50 + (i % 5) * 9),
              y: Math.sin(theta + phase) * (20 + (i % 4) * 5) - 22,
              angle: (theta * 180) / Math.PI + i * 22,
              opacity: front ? 0.95 : 0.45,
              size: front ? 0.95 : 0.58,
              landed: false,
            };
          }

          const fall = orbit - orbitDuration;

          if (fall >= fallDuration) {
            return {
              ...p,
              x: Math.sin(i * 2.3) * (18 + (i % 4) * 5),
              y: 81 + (i % 3) * 2,
              angle: 80 + (i % 5) * 22,
              opacity: 0.8,
              size: 0.7,
              landed: true,
            };
          }

          return {
            ...p,
            x: Math.sin(fall * 2 + i) * 26,
            y: Math.min(82, -12 + (fall / fallDuration) * 96),
            angle: fall * 190 + i * 25,
            opacity: 0.85,
            size: 0.75,
            landed: false,
          };
        }),
      );

      if (elapsed < 12.5) {
        raf.current = requestAnimationFrame(tick);
      }
    };

    raf.current = requestAnimationFrame(tick);

    return () => {
      if (raf.current !== null) cancelAnimationFrame(raf.current);
    };
  }, [treeId, reducedMotion]);

  return (
    <div className="fg-petal-layer" aria-hidden="true">
      {petals.map((p, i) => (
        <span
          key={i}
          className={`fg-petal ${p.landed ? "fg-petal-landed" : ""}`}
          style={{
            background: p.color,
            transform: `translate(${p.x}px,${p.y}px) rotate(${p.angle}deg) scale(${p.size},${p.landed ? 0.32 : 1})`,
            opacity: p.opacity,
          }}
        />
      ))}
    </div>
  );
}

function Tree({
  id,
  done,
  focus,
  wilt,
}: {
  id: string;
  done: boolean;
  focus: boolean;
  wilt?: boolean;
}) {
  const safeId = id.replace(/\W/g, "");
  const maskId = `fg-mask-${safeId}`;
  const barkId = `fg-bark-${safeId}`;
  const canopyId = `fg-canopy-${safeId}`;

  const blossoms = useMemo(() => {
    const random = seeded(seedFromString(id));
    return Array.from({ length: 68 }, (_, i) => ({
      x: 25 + random() * 150,
      y: 30 + random() * 92,
      color: FLOWER_COLORS[Math.floor(random() * FLOWER_COLORS.length)],
      rotation: random() * 360,
      scale: 0.65 + random() * 0.55,
      delay: 1.5 + random() * 3,
      tone: i % 4,
    }));
  }, [id]);

  return (
    <div
      className={`fg-plant ${done ? "fg-grown" : "fg-sapling"} ${focus ? "fg-focus-plant" : ""} ${wilt ? "fg-withered" : ""}`}
    >
      <div className="fg-plant-shadow" aria-hidden="true" />

      <svg className="fg-tree-svg" viewBox="0 0 200 220" aria-hidden="true">
        <defs>
          <linearGradient id={barkId} x1="0" x2="1">
            <stop offset="0" stopColor="var(--fg-bark)" />
            <stop offset=".45" stopColor="var(--fg-bark-light)" />
            <stop offset="1" stopColor="var(--fg-bark)" />
          </linearGradient>

          <radialGradient id={canopyId}>
            <stop offset="0" stopColor="#FFC9DA" stopOpacity=".85" />
            <stop offset="1" stopColor="#FFC9DA" stopOpacity="0" />
          </radialGradient>

          <mask id={maskId}>
            <rect width="200" height="220" fill="black" />
            <path
              d="M100 205 L100 45"
              stroke="white"
              strokeWidth="40"
              strokeLinecap="round"
            />
          </mask>
        </defs>

        {/* Trunk and root flare */}
        <path
          className="fg-trunk"
          d="M91 205 Q95 176 96 145 Q98 112 98 76 Q100 54 101 48 Q105 80 105 116 Q106 168 113 205 Q105 202 100 207Z"
          fill={`url(#${barkId})`}
          mask={`url(#${maskId})`}
        />

        <path
          className="fg-bark-line"
          d="M97 190 Q101 167 99 145 M105 180 Q102 158 105 136 M94 202 Q85 207 82 211 M108 202 Q118 206 121 211"
        />

        {/* Branches */}
        {BRANCHES.map((path, i) => (
          <path
            key={i}
            className="fg-branch"
            style={{ "--branch-delay": `${i * 0.13}s` } as CSSProperties}
            d={path}
          />
        ))}

        {TWIGS.map((path, i) => (
          <path key={i} className="fg-twig" d={path} />
        ))}

        {/* Soft blossom canopy */}
        {blossoms.map((b, i) => (
          <g key={i} transform={`translate(${b.x} ${b.y})`}>
            <circle
              r={26 + b.tone * 2}
              fill={`url(#${canopyId})`}
              className="fg-blossom-glow"
            />
            <g
              className="fg-flower"
              style={{ "--flower-delay": `${b.delay}s` } as CSSProperties}
            >
              <Blossom color={b.color} scale={b.scale} rotate={b.rotation} />
            </g>
          </g>
        ))}

        {/* Sapling for unfinished tasks */}
        <g className="fg-sapling-art">
          <path className="fg-sapling-stem" d="M100 204 Q98 185 101 165 Q103 152 102 143" />
          <path className="fg-leaf" d="M101 181 Q81 164 73 175 Q83 190 101 184Z" />
          <path className="fg-leaf" d="M101 169 Q117 150 129 159 Q120 174 102 174Z" />
          <path className="fg-leaf" d="M102 157 Q91 146 84 151 Q90 161 102 160Z" />
          <circle className="fg-bud" cx="103" cy="141" r="6" />
          <circle className="fg-dew" cx="85" cy="174" r="2" />
          <circle className="fg-dew" cx="121" cy="163" r="2" />
        </g>

        {/* Small grass around roots */}
        <g className="fg-root-grass">
          <path d="M77 207 Q69 191 65 199 M85 208 Q81 190 81 197 M119 208 Q130 190 130 198 M128 208 Q139 194 137 202" />
        </g>
      </svg>

      {done && <PetalFall treeId={id} />}

      {!done && wilt && (
        <div className="fg-dry-leaves" aria-hidden="true">
          <i />
          <i />
          <i />
        </div>
      )}
    </div>
  );
}

function AmbientScene({ time }: { time: string }) {
  return (
    <div className="fg-ambient" aria-hidden="true">
      <div className="fg-sky" />
      <div className="fg-sky-glow" />
      <div className="fg-sun-moon">
        <span className="fg-rays" />
      </div>

      {time === "night" && (
        <div className="fg-stars">
          {Array.from({ length: 24 }, (_, i) => (
            <i
              key={i}
              style={{
                left: `${(i * 37) % 100}%`,
                top: `${(i * 19) % 43}%`,
                animationDelay: `${(i % 7) * 0.4}s`,
              }}
            />
          ))}
        </div>
      )}

      <div className="fg-clouds fg-clouds-back">
        <i />
        <i />
        <i />
      </div>

      <div className="fg-mountains" />
      <div className="fg-hill fg-hill-back" />
      <div className="fg-hill fg-hill-mid" />
      <div className="fg-distant-tree-line" />

      <div className="fg-clouds fg-clouds-front">
        <i />
        <i />
      </div>

      <div className="fg-light-rays" />
      <div className="fg-ground" />
      <div className="fg-ground-texture" />

      <div className="fg-foreground-grass">
        <i /><i /><i /><i /><i /><i /><i />
      </div>

      <div className="fg-fireflies">
        {Array.from({ length: 10 }, (_, i) => (
          <i
            key={i}
            style={{
              left: `${(i * 17 + 7) % 100}%`,
              top: `${40 + (i * 13) % 35}%`,
              animationDelay: `${i * 0.7}s`,
            }}
          />
        ))}
      </div>

      <div className="fg-butterflies">
        <i /><i /><i />
      </div>

      <div className="fg-birds">
        <i /><i />
      </div>

      <div className="fg-horizon-haze" />
      <div className="fg-vignette" />
    </div>
  );
}

export default function FocusGarden({
  tasks,
  onAddTask,
  onToggleTask,
  onDeleteTask,
}: Props) {
  const [text, setText] = useState("");
  const [message, setMessage] = useState("Plant a seed and watch your garden grow.");
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [wilted, setWilted] = useState<string[]>([]);
  const [fading, setFading] = useState<string[]>([]);
  const [focus, setFocus] = useState<string | null>(null);
  const [edges, setEdges] = useState({ left: true, right: true });
  const [time, setTime] = useState(getTimeOfDay);
  const [undoTask, setUndoTask] = useState<GardenTask | null>(null);

  // Scene progress is stored in state; refs are never accessed during render.
  const [viewportProgress, setViewportProgress] = useState(100);

  const scene = useRef<HTMLDivElement>(null);
  const slots = useRef<Map<string, HTMLDivElement>>(new Map());
  const timers = useRef<number[]>([]);
  const deleteTimer = useRef<number | null>(null);

  const drag = useRef({
    active: false,
    startX: 0,
    scrollStart: 0,
    lastX: 0,
    lastTime: 0,
    velocity: 0,
  });

  const momentum = useRef<number | null>(null);

  const [reduced] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  useEffect(() => {
    const update = () => setTime(getTimeOfDay());
    update();
    const interval = window.setInterval(update, 60000);
    return () => clearInterval(interval);
  }, []);

  // FIXED: Copy timers.current inside the effect before cleanup.
  useEffect(() => {
    const activeTimers = timers.current;

    return () => {
      activeTimers.forEach((timer) => window.clearTimeout(timer));

      if (deleteTimer.current !== null) {
        window.clearTimeout(deleteTimer.current);
      }

      if (momentum.current !== null) {
        cancelAnimationFrame(momentum.current);
      }
    };
  }, []);

  // Measure the scene outside render to avoid accessing scene.current in JSX.
  useEffect(() => {
    const el = scene.current;
    if (!el) return;

    const update = () => {
      const maxScroll = Math.max(0, el.scrollWidth - el.clientWidth);
      const progress = el.scrollWidth > 0
        ? Math.min(100, (el.clientWidth / el.scrollWidth) * 100)
        : 100;

      setViewportProgress(progress);

      setEdges({
        left: el.scrollLeft <= 2,
        right: el.scrollLeft >= maxScroll - 2,
      });
    };

    const initialFrame = requestAnimationFrame(update);

    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);

    return () => {
      cancelAnimationFrame(initialFrame);
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [tasks.length, achievements.length]);

  const scrollToPlant = (id: string) => {
    const sc = scene.current;
    const el = slots.current.get(id);

    if (!sc || !el) return;

    sc.scrollTo({
      left: el.offsetLeft - sc.clientWidth / 2 + el.clientWidth / 2,
      behavior: reduced ? "auto" : "smooth",
    });

    setFocus(id);

    timers.current.push(
      window.setTimeout(() => setFocus(null), 1800),
    );
  };

  const plant = async () => {
    if (!text.trim()) {
      setMessage("Give your seed a name first 🌱");
      return;
    }

    const created = await onAddTask({
      title: text.trim(),
      description: "",
      category: "Personal",
      priority: "Medium",
      status: "todo",
      due: "Today",
    });

    if (created) {
      setText("");
      setMessage("A new seed has been planted 🌱");

      timers.current.push(
        window.setTimeout(() => scrollToPlant(created.id), 120),
      );
    }
  };

  const complete = (task: GardenTask) => {
    if (task.status === "completed") return;

    setMessage("Your tree has bloomed 🌸");
    onToggleTask(task.id);
    scrollToPlant(task.id);
  };

  const del = async (task: GardenTask) => {
    if (task.status === "completed") {
      setAchievements((prev) =>
        prev.some((a) => a.id === task.id)
          ? prev
          : [...prev, { id: task.id, title: task.title }],
      );

      setMessage("The tree stays in your garden 🌸");
      await onDeleteTask(task.id);
      return;
    }

    if (deleteTimer.current !== null) {
      window.clearTimeout(deleteTimer.current);
    }

    setWilted((prev) =>
      prev.includes(task.id) ? prev : [...prev, task.id],
    );

    setUndoTask(task);
    setMessage("The little plant is withering…");

    timers.current.push(
      window.setTimeout(
        () => setFading((prev) => [...prev, task.id]),
        2500,
      ),
    );

    deleteTimer.current = window.setTimeout(() => {
      void onDeleteTask(task.id);
      setUndoTask(null);
      deleteTimer.current = null;
    }, 5000);
  };

  const undoDelete = () => {
    if (!undoTask) return;

    if (deleteTimer.current !== null) {
      window.clearTimeout(deleteTimer.current);
      deleteTimer.current = null;
    }

    setWilted((prev) => prev.filter((id) => id !== undoTask.id));
    setFading((prev) => prev.filter((id) => id !== undoTask.id));
    setMessage("Your plant is safe again 🌱");
    setUndoTask(null);
  };

  const onDragStart = (e: MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest("button")) return;

    const el = scene.current;
    if (!el) return;

    if (momentum.current !== null) {
      cancelAnimationFrame(momentum.current);
      momentum.current = null;
    }

    drag.current = {
      active: true,
      startX: e.pageX,
      scrollStart: el.scrollLeft,
      lastX: e.pageX,
      lastTime: performance.now(),
      velocity: 0,
    };

    el.classList.add("fg-dragging");
  };

  const onDragMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = scene.current;
    if (!el || !drag.current.active) return;

    const now = performance.now();
    const dx = e.pageX - drag.current.lastX;
    const dt = Math.max(1, now - drag.current.lastTime);

    drag.current.velocity = dx / dt;
    drag.current.lastX = e.pageX;
    drag.current.lastTime = now;

    el.scrollLeft =
      drag.current.scrollStart - (e.pageX - drag.current.startX);
  };

  const onDragEnd = () => {
    const el = scene.current;
    if (!el || !drag.current.active) return;

    drag.current.active = false;
    el.classList.remove("fg-dragging");

    if (reduced) return;

    let velocity = -drag.current.velocity * 16;

    const glide = () => {
      const currentScene = scene.current;
      if (!currentScene || Math.abs(velocity) < 0.4) {
        momentum.current = null;
        return;
      }

      currentScene.scrollLeft += velocity;
      velocity *= 0.92;
      momentum.current = requestAnimationFrame(glide);
    };

    momentum.current = requestAnimationFrame(glide);
  };

  const bloomedCount =
    tasks.filter((t) => t.status === "completed").length + achievements.length;

  const plantCount = tasks.length + achievements.length;
  const sceneWidth = Math.max(100, plantCount * 200 + 200);

  return (
    <section className="focus-garden">
      <div className={`fg-world fg-${time}`}>
        <AmbientScene time={time} />

        <div className="fg-world-content">
          <header className="fg-world-header">
            <div className="fg-world-title">
              <Flower2 size={19} />
              <div>
                <h2>Focus Garden</h2>
                <p>Grow gently. One task at a time.</p>
              </div>
            </div>

            <div className="fg-world-count">
              <Sprout size={14} />
              <span>
                {plantCount} plants · {bloomedCount} bloomed
              </span>
            </div>
          </header>

          <div className="fg-world-scene-wrap">
            <div className="fg-edge-fade fg-edge-left" />
            <div className="fg-edge-fade fg-edge-right" />

            <button
              className="fg-world-arrow fg-arrow-left"
              aria-label="Scroll garden left"
              disabled={edges.left}
              onClick={() =>
                scene.current?.scrollBy({ left: -300, behavior: "smooth" })
              }
            >
              <ChevronLeft size={17} />
            </button>

            <div
              className="fg-world-scene"
              ref={scene}
              tabIndex={0}
              onMouseDown={onDragStart}
              onMouseMove={onDragMove}
              onMouseUp={onDragEnd}
              onMouseLeave={onDragEnd}
              onKeyDown={(e) => {
                if (e.key === "ArrowLeft") {
                  scene.current?.scrollBy({ left: -300, behavior: "smooth" });
                }
                if (e.key === "ArrowRight") {
                  scene.current?.scrollBy({ left: 300, behavior: "smooth" });
                }
              }}
            >
              <div
                className="fg-world-plant-track"
                style={{ width: `${sceneWidth}px` }}
              >
                {tasks.map((task, index) => {
                  const depth = index % 3;
                  const scale =
                    depth === 0 ? 0.92 : depth === 1 ? 1.05 : 0.82;
                  const top = depth === 0 ? 10 : depth === 1 ? -2 : 18;

                  return (
                    <div
                      className={`fg-world-plant-slot ${wilted.includes(task.id) ? "fg-wilt-slot" : fading.includes(task.id) ? "fg-fade-slot" : ""}`}
                      key={task.id}
                      style={{
                        transform: `translateY(${top}px) scale(${scale})`,
                        zIndex: 3 - depth,
                      }}
                      ref={(el) => {
                        if (el) slots.current.set(task.id, el);
                        else slots.current.delete(task.id);
                      }}
                    >
                      <Tree
                        id={task.id}
                        done={task.status === "completed"}
                        focus={focus === task.id}
                        wilt={wilted.includes(task.id)}
                      />

                      <button
                        className={`fg-wood-sign ${task.status === "completed" ? "fg-sign-done" : ""}`}
                        title={task.title}
                        onClick={() => scrollToPlant(task.id)}
                      >
                        <span className="fg-sign-text">{task.title}</span>
                        {task.status === "completed" && (
                          <span className="fg-sign-check">
                            <Check size={10} />
                          </span>
                        )}
                      </button>
                    </div>
                  );
                })}

                {achievements.map((a, index) => (
                  <div
                    className="fg-world-plant-slot fg-achievement-slot"
                    key={`achievement-${a.id}`}
                    style={{
                      transform: `translateY(${index % 2 ? 0 : 14}px)`,
                    }}
                  >
                    <Tree id={`achievement-${a.id}`} done focus={focus === a.id} />

                    <div className="fg-wood-sign fg-sign-done" title={a.title}>
                      <span className="fg-sign-text">{a.title}</span>
                      <span className="fg-sign-check">
                        <Check size={10} />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              className="fg-world-arrow fg-arrow-right"
              aria-label="Scroll garden right"
              disabled={edges.right}
              onClick={() =>
                scene.current?.scrollBy({ left: 300, behavior: "smooth" })
              }
            >
              <ChevronRight size={17} />
            </button>
          </div>

          {/* Position indicator - no ref access during render */}
          <div className="fg-position-bar" aria-hidden="true">
            <div className="fg-position-track">
              <span style={{ width: `${viewportProgress}%` }} />
            </div>
            <span className="fg-position-count">{plantCount} seeds</span>
          </div>

          <form
            className="fg-seed-dock"
            onSubmit={(e) => {
              e.preventDefault();
              void plant();
            }}
          >
            <Sprout size={17} />
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={60}
              placeholder="Plant a new task in your garden…"
              aria-label="New task title"
            />
            <button type="submit">
              <Sprout size={15} />
              <span>Plant seed</span>
            </button>
          </form>
        </div>
      </div>

      <div className="fg-task-area">
        <div className="fg-task-area-heading">
          <div>
            <h3>Your plants</h3>
            <p>Little steps make a beautiful garden.</p>
          </div>
          <span>{tasks.length} growing</span>
        </div>

        {tasks.length === 0 ? (
          <div className="fg-empty-garden">
            <Sprout size={24} />
            <p>Your garden is waiting for its first seed.</p>
          </div>
        ) : (
          <div className="fg-task-list">
            {tasks.map((task) => (
              <div
                className={`fg-task-item ${task.status === "completed" ? "fg-task-completed" : ""} ${wilted.includes(task.id) ? "fg-task-wilting" : ""}`}
                key={task.id}
              >
                <button
                  className="fg-task-name"
                  onClick={() => scrollToPlant(task.id)}
                  title={task.title}
                >
                  <span className="fg-task-status-dot" />
                  <span className="fg-task-name-text">{task.title}</span>
                  {task.status === "completed" && (
                    <Check size={15} className="fg-task-check" />
                  )}
                </button>

                <div className="fg-task-actions">
                  <button
                    className="fg-task-done-button"
                    disabled={task.status === "completed" || wilted.includes(task.id)}
                    onClick={() => complete(task)}
                  >
                    <Check size={14} /> Done
                  </button>

                  <button
                    className="fg-task-delete-button"
                    disabled={wilted.includes(task.id)}
                    onClick={() => void del(task)}
                    aria-label={`Delete ${task.title}`}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {undoTask && (
          <div className="fg-undo-toast" role="status">
            <span>{undoTask.title} is withering…</span>
            <button onClick={undoDelete}>
              <Undo2 size={14} /> Undo
            </button>
          </div>
        )}

        <div className="fg-garden-message" aria-live="polite">
          {message}
        </div>
      </div>
    </section>
  );
}