import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { DEFAULT_HABITS, CATEGORIES, AVAILABLE_ICONS, type HabitDef } from "@shared/schema";
import { format, startOfWeek, addDays, isToday, startOfDay } from "date-fns";
import {
  HeartPulse,
  Dumbbell,
  Sunrise,
  Sunset,
  Flame,
  Timer,
  Droplets,
  Smartphone,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Check,
  Moon,
  Sun,
  RotateCcw,
  Settings,
  Plus,
  Trash2,
  GripVertical,
  X,
  Apple,
  Brain,
  BookOpen,
  Music,
  Bed,
  Coffee,
  Pill,
  Footprints,
  Eye,
  Pencil,
  Target,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { PerplexityAttribution } from "@/components/PerplexityAttribution";

const ICON_MAP: Record<string, React.ElementType> = {
  "heart-pulse": HeartPulse,
  dumbbell: Dumbbell,
  sunrise: Sunrise,
  sunset: Sunset,
  flame: Flame,
  timer: Timer,
  droplets: Droplets,
  smartphone: Smartphone,
  apple: Apple,
  brain: Brain,
  "book-open": BookOpen,
  music: Music,
  bed: Bed,
  coffee: Coffee,
  pill: Pill,
  footprints: Footprints,
  eye: Eye,
  pencil: Pencil,
  target: Target,
  zap: Zap,
};

const CATEGORY_COLORS: Record<string, string> = {
  exercise: "text-emerald-500 dark:text-emerald-400",
  nutrition: "text-amber-500 dark:text-amber-400",
  hydration: "text-sky-500 dark:text-sky-400",
  mindfulness: "text-violet-500 dark:text-violet-400",
  health: "text-rose-500 dark:text-rose-400",
  productivity: "text-blue-500 dark:text-blue-400",
};

const CATEGORY_BG: Record<string, string> = {
  exercise: "bg-emerald-500/10 dark:bg-emerald-400/10",
  nutrition: "bg-amber-500/10 dark:bg-amber-400/10",
  hydration: "bg-sky-500/10 dark:bg-sky-400/10",
  mindfulness: "bg-violet-500/10 dark:bg-violet-400/10",
  health: "bg-rose-500/10 dark:bg-rose-400/10",
  productivity: "bg-blue-500/10 dark:bg-blue-400/10",
};

const CATEGORY_CHECK: Record<string, string> = {
  exercise: "bg-emerald-500 dark:bg-emerald-400",
  nutrition: "bg-amber-500 dark:bg-amber-400",
  hydration: "bg-sky-500 dark:bg-sky-400",
  mindfulness: "bg-violet-500 dark:bg-violet-400",
  health: "bg-rose-500 dark:bg-rose-400",
  productivity: "bg-blue-500 dark:bg-blue-400",
};

const CATEGORY_DOT: Record<string, string> = {
  exercise: "bg-emerald-500",
  nutrition: "bg-amber-500",
  hydration: "bg-sky-500",
  mindfulness: "bg-violet-500",
  health: "bg-rose-500",
  productivity: "bg-blue-500",
};

// --- Storage ---
type HabitData = Record<string, boolean>;
const DATA_KEY = "habit-tracker-data";
const HABITS_KEY = "habit-tracker-habits";

function loadData(): HabitData {
  try {
    const raw = window["localStorage"]?.getItem(DATA_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {};
}
function saveData(data: HabitData) {
  try { window["localStorage"]?.setItem(DATA_KEY, JSON.stringify(data)); } catch {}
}
function loadHabits(): HabitDef[] {
  try {
    const raw = window["localStorage"]?.getItem(HABITS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return DEFAULT_HABITS;
}
function saveHabits(habits: HabitDef[]) {
  try { window["localStorage"]?.setItem(HABITS_KEY, JSON.stringify(habits)); } catch {}
}

function getWeekDates(weekStart: Date) {
  return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
}

// --- Add Habit Form ---
function AddHabitForm({ onAdd, onCancel }: { onAdd: (h: HabitDef) => void; onCancel: () => void }) {
  const [label, setLabel] = useState("");
  const [icon, setIcon] = useState("target");
  const [category, setCategory] = useState("exercise");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = () => {
    const trimmed = label.trim();
    if (!trimmed) return;
    const key = trimmed.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
    onAdd({ key: key || `habit_${Date.now()}`, label: trimmed, icon, category });
    setLabel("");
  };

  return (
    <div className="border border-border rounded-lg p-4 space-y-3 bg-card">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">New Habit</p>
        <button onClick={onCancel} className="text-muted-foreground hover:text-foreground" data-testid="button-cancel-add">
          <X className="h-4 w-4" />
        </button>
      </div>

      <Input
        ref={inputRef}
        placeholder="Habit name..."
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        className="h-9"
        data-testid="input-habit-name"
      />

      {/* Category picker */}
      <div>
        <p className="text-xs font-medium text-muted-foreground mb-1.5">Category</p>
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map((c) => (
            <button
              key={c.key}
              onClick={() => setCategory(c.key)}
              className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                category === c.key
                  ? "border-primary bg-primary/10 text-primary font-medium"
                  : "border-border text-muted-foreground hover:border-primary/50"
              }`}
              data-testid={`category-${c.key}`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Icon picker */}
      <div>
        <p className="text-xs font-medium text-muted-foreground mb-1.5">Icon</p>
        <div className="flex flex-wrap gap-1.5">
          {AVAILABLE_ICONS.map((iconKey) => {
            const IconComp = ICON_MAP[iconKey];
            if (!IconComp) return null;
            return (
              <button
                key={iconKey}
                onClick={() => setIcon(iconKey)}
                className={`w-8 h-8 rounded-md flex items-center justify-center transition-colors ${
                  icon === iconKey
                    ? "bg-primary/15 text-primary border border-primary/30"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent"
                }`}
                data-testid={`icon-${iconKey}`}
              >
                <IconComp className="h-3.5 w-3.5" />
              </button>
            );
          })}
        </div>
      </div>

      <Button
        onClick={handleSubmit}
        disabled={!label.trim()}
        className="w-full h-9"
        data-testid="button-add-habit-confirm"
      >
        <Plus className="h-3.5 w-3.5 mr-1.5" />
        Add Habit
      </Button>
    </div>
  );
}

// --- Main Dashboard ---
export default function Dashboard() {
  const [weekOffset, setWeekOffset] = useState(0);
  const [darkMode, setDarkMode] = useState(() =>
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );
  const [habitData, setHabitData] = useState<HabitData>(loadData);
  const [habits, setHabits] = useState<HabitDef[]>(loadHabits);
  const [editMode, setEditMode] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle("dark", next);
      return next;
    });
  };

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, []);

  useEffect(() => { saveData(habitData); }, [habitData]);
  useEffect(() => { saveHabits(habits); }, [habits]);

  const toggleHabit = useCallback((date: string, habitKey: string) => {
    const key = `${date}:${habitKey}`;
    setHabitData((prev) => {
      const next = { ...prev };
      if (next[key]) { delete next[key]; } else { next[key] = true; }
      return next;
    });
  }, []);

  const isCompleted = useCallback(
    (date: string, habitKey: string) => !!habitData[`${date}:${habitKey}`],
    [habitData]
  );

  // Habit management
  const addHabit = useCallback((h: HabitDef) => {
    setHabits((prev) => {
      if (prev.some((p) => p.key === h.key)) {
        // Ensure unique key
        return [...prev, { ...h, key: `${h.key}_${Date.now()}` }];
      }
      return [...prev, h];
    });
    setShowAddForm(false);
  }, []);

  const removeHabit = useCallback((key: string) => {
    setHabits((prev) => prev.filter((h) => h.key !== key));
  }, []);

  const moveHabit = useCallback((index: number, direction: "up" | "down") => {
    setHabits((prev) => {
      const next = [...prev];
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= next.length) return prev;
      [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
      return next;
    });
  }, []);

  const weekStart = useMemo(
    () => addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), weekOffset * 7),
    [weekOffset]
  );
  const weekDates = useMemo(() => getWeekDates(weekStart), [weekStart]);

  // Stats
  const totalPossible = 7 * habits.length;
  const totalCompleted = useMemo(() => {
    let count = 0;
    weekDates.forEach((d) => {
      const dateStr = format(d, "yyyy-MM-dd");
      habits.forEach((h) => { if (habitData[`${dateStr}:${h.key}`]) count++; });
    });
    return count;
  }, [habitData, weekDates, habits]);
  const completionRate = totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0;

  const todayStr = format(new Date(), "yyyy-MM-dd");
  const todayCompleted = useMemo(() => {
    return habits.filter((h) => habitData[`${todayStr}:${h.key}`]).length;
  }, [habitData, todayStr, habits]);

  const streakCount = useMemo(() => {
    if (habits.length === 0) return 0;
    let streak = 0;
    const today = startOfDay(new Date());
    for (let i = 0; i < 365; i++) {
      const d = addDays(today, -i);
      const dateStr = format(d, "yyyy-MM-dd");
      const dayDone = habits.every((h) => habitData[`${dateStr}:${h.key}`]);
      if (dayDone) { streak++; } else if (i > 0) { break; }
    }
    return streak;
  }, [habitData, habits]);

  const dayCompletionCounts = useMemo(() => {
    return weekDates.map((d) => {
      const dateStr = format(d, "yyyy-MM-dd");
      return habits.filter((h) => habitData[`${dateStr}:${h.key}`]).length;
    });
  }, [habitData, weekDates, habits]);

  // Unique categories in current habit list
  const activeCategories = useMemo(() => {
    const cats = new Set(habits.map((h) => h.category));
    return CATEGORIES.filter((c) => cats.has(c.key));
  }, [habits]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border sticky top-0 z-20 bg-background/95 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none" aria-label="Habit Tracker" className="text-primary shrink-0">
              <rect x="3" y="3" width="26" height="26" rx="6" stroke="currentColor" strokeWidth="2.5" />
              <path d="M10 16.5L14 20.5L22 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <h1 className="text-base font-semibold tracking-tight">Habit Tracker</h1>
          </div>
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={() => setWeekOffset(0)} className="h-8 w-8" data-testid="button-today">
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Current week</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={editMode ? "default" : "ghost"}
                  size="icon"
                  onClick={() => { setEditMode((p) => !p); setShowAddForm(false); }}
                  className="h-8 w-8"
                  data-testid="button-edit-mode"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{editMode ? "Done editing" : "Edit habits"}</TooltipContent>
            </Tooltip>
            <Button variant="ghost" size="icon" onClick={toggleDarkMode} className="h-8 w-8" data-testid="button-theme">
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Edit Mode Banner */}
        {editMode && (
          <div className="flex items-center justify-between bg-primary/5 border border-primary/20 rounded-lg px-4 py-3">
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4 text-primary" />
              <p className="text-sm font-medium text-primary">Editing habits</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAddForm((p) => !p)}
                className="h-7 text-xs"
                data-testid="button-add-habit"
              >
                <Plus className="h-3 w-3 mr-1" />
                Add
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => { setEditMode(false); setShowAddForm(false); }}
                className="h-7 text-xs"
                data-testid="button-done-editing"
              >
                Done
              </Button>
            </div>
          </div>
        )}

        {/* Add Habit Form */}
        {editMode && showAddForm && (
          <AddHabitForm onAdd={addHabit} onCancel={() => setShowAddForm(false)} />
        )}

        {/* KPI Cards */}
        {!editMode && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Card className="p-4" data-testid="card-today">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Today</p>
              <p className="text-2xl font-bold tabular-nums mt-1">
                {todayCompleted}<span className="text-sm font-normal text-muted-foreground">/{habits.length}</span>
              </p>
            </Card>
            <Card className="p-4" data-testid="card-week">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">This Week</p>
              <p className="text-2xl font-bold tabular-nums mt-1">
                {completionRate}<span className="text-sm font-normal text-muted-foreground">%</span>
              </p>
            </Card>
            <Card className="p-4" data-testid="card-completed">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Completed</p>
              <p className="text-2xl font-bold tabular-nums mt-1">
                {totalCompleted}<span className="text-sm font-normal text-muted-foreground">/{totalPossible}</span>
              </p>
            </Card>
            <Card className="p-4" data-testid="card-streak">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Streak</p>
              <p className="text-2xl font-bold tabular-nums mt-1">
                {streakCount}<span className="text-sm font-normal text-muted-foreground"> day{streakCount !== 1 ? "s" : ""}</span>
              </p>
            </Card>
          </div>
        )}

        {/* Week Navigation */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => setWeekOffset((o) => o - 1)} className="h-8 w-8" data-testid="button-prev-week">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <p className="text-sm font-medium text-muted-foreground">
            {format(weekStart, "MMM d")} — {format(addDays(weekStart, 6), "MMM d, yyyy")}
          </p>
          <Button variant="ghost" size="icon" onClick={() => setWeekOffset((o) => o + 1)} className="h-8 w-8" data-testid="button-next-week">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Habit Grid */}
        <Card className="overflow-hidden" data-testid="card-habit-grid">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className={`text-left text-xs font-medium text-muted-foreground uppercase tracking-wide py-3 px-4 ${editMode ? "w-[220px] min-w-[200px]" : "w-[160px] min-w-[140px]"}`}>
                    Habit
                  </th>
                  {!editMode && weekDates.map((d) => {
                    const today = isToday(d);
                    return (
                      <th key={d.toISOString()} className={`text-center py-3 px-2 min-w-[60px] ${today ? "bg-primary/5" : ""}`}>
                        <p className={`text-[10px] font-medium uppercase tracking-wider ${today ? "text-primary" : "text-muted-foreground"}`}>
                          {format(d, "EEE")}
                        </p>
                        <p className={`text-sm font-semibold tabular-nums mt-0.5 ${today ? "text-primary" : "text-foreground"}`}>
                          {format(d, "d")}
                        </p>
                      </th>
                    );
                  })}
                  {editMode && (
                    <th className="text-center text-xs font-medium text-muted-foreground uppercase tracking-wide py-3 px-4">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {habits.map((habit, idx) => {
                  const Icon = ICON_MAP[habit.icon];
                  const isLast = idx === habits.length - 1;
                  const catColor = CATEGORY_COLORS[habit.category] || "text-gray-500";
                  const catBg = CATEGORY_BG[habit.category] || "bg-gray-500/10";
                  const catCheck = CATEGORY_CHECK[habit.category] || "bg-gray-500";

                  return (
                    <tr
                      key={habit.key}
                      className={`${!isLast ? "border-b border-border/50" : ""} group`}
                      data-testid={`row-habit-${habit.key}`}
                    >
                      <td className="py-2.5 px-4">
                        <div className="flex items-center gap-2.5">
                          {editMode && (
                            <div className="flex flex-col gap-0.5 shrink-0">
                              <button
                                onClick={() => moveHabit(idx, "up")}
                                disabled={idx === 0}
                                className="text-muted-foreground hover:text-foreground disabled:opacity-20 disabled:cursor-not-allowed p-0.5"
                                data-testid={`move-up-${habit.key}`}
                              >
                                <ChevronUp className="h-3 w-3" />
                              </button>
                              <button
                                onClick={() => moveHabit(idx, "down")}
                                disabled={idx === habits.length - 1}
                                className="text-muted-foreground hover:text-foreground disabled:opacity-20 disabled:cursor-not-allowed p-0.5"
                                data-testid={`move-down-${habit.key}`}
                              >
                                <ChevronDown className="h-3 w-3" />
                              </button>
                            </div>
                          )}
                          <div className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${catBg}`}>
                            {Icon && <Icon className={`h-3.5 w-3.5 ${catColor}`} />}
                          </div>
                          <span className="text-sm font-medium whitespace-nowrap">{habit.label}</span>
                        </div>
                      </td>

                      {!editMode && weekDates.map((d) => {
                        const dateStr = format(d, "yyyy-MM-dd");
                        const done = isCompleted(dateStr, habit.key);
                        const today = isToday(d);
                        const isDoomScroll = habit.key === "doom_scroll";

                        return (
                          <td key={d.toISOString()} className={`text-center py-2.5 px-2 ${today ? "bg-primary/5" : ""}`}>
                            <button
                              onClick={() => toggleHabit(dateStr, habit.key)}
                              className={`w-8 h-8 rounded-lg mx-auto flex items-center justify-center transition-all duration-150 ${
                                done
                                  ? isDoomScroll
                                    ? "bg-violet-500/15 dark:bg-violet-400/15 text-violet-600 dark:text-violet-400"
                                    : `${catCheck} text-white`
                                  : "bg-muted/50 hover:bg-muted text-transparent hover:text-muted-foreground/30"
                              }`}
                              data-testid={`toggle-${habit.key}-${dateStr}`}
                            >
                              {done ? (
                                isDoomScroll ? <Smartphone className="h-3.5 w-3.5" /> : <Check className="h-3.5 w-3.5" />
                              ) : (
                                <Check className="h-3.5 w-3.5" />
                              )}
                            </button>
                          </td>
                        );
                      })}

                      {editMode && (
                        <td className="text-center py-2.5 px-4">
                          <button
                            onClick={() => removeHabit(habit.key)}
                            className="text-muted-foreground hover:text-destructive transition-colors p-1.5 rounded-md hover:bg-destructive/10"
                            data-testid={`remove-${habit.key}`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}

                {/* Empty state */}
                {habits.length === 0 && (
                  <tr>
                    <td colSpan={editMode ? 2 : 8} className="text-center py-12">
                      <p className="text-sm text-muted-foreground">No habits yet</p>
                      {editMode && (
                        <Button variant="outline" size="sm" onClick={() => setShowAddForm(true)} className="mt-3" data-testid="button-add-first">
                          <Plus className="h-3.5 w-3.5 mr-1.5" />
                          Add your first habit
                        </Button>
                      )}
                    </td>
                  </tr>
                )}

                {/* Progress row (non-edit mode only) */}
                {!editMode && habits.length > 0 && (
                  <tr className="border-t border-border bg-muted/30">
                    <td className="py-3 px-4">
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Daily Total</span>
                    </td>
                    {weekDates.map((d, i) => {
                      const today = isToday(d);
                      const count = dayCompletionCounts[i];
                      const pct = habits.length > 0 ? Math.round((count / habits.length) * 100) : 0;
                      return (
                        <td key={d.toISOString()} className={`text-center py-3 px-2 ${today ? "bg-primary/5" : ""}`}>
                          <div className="flex flex-col items-center gap-1">
                            <span className={`text-xs font-bold tabular-nums ${
                              count === habits.length ? "text-primary" : count > 0 ? "text-foreground" : "text-muted-foreground"
                            }`}>
                              {count}/{habits.length}
                            </span>
                            <div className="w-8 h-1 rounded-full bg-muted overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-300 ${
                                  count === habits.length ? "bg-primary" : count > 0 ? "bg-primary/50" : "bg-transparent"
                                }`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Category Legend */}
        {!editMode && activeCategories.length > 0 && (
          <div className="flex flex-wrap gap-4 justify-center">
            {activeCategories.map((cat) => (
              <div key={cat.key} className="flex items-center gap-1.5">
                <div className={`w-2.5 h-2.5 rounded-full ${CATEGORY_DOT[cat.key] || "bg-gray-500"}`} />
                <span className="text-xs text-muted-foreground font-medium">{cat.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <footer className="text-center py-4 border-t border-border mt-8">
          <PerplexityAttribution />
        </footer>
      </main>
    </div>
  );
}
