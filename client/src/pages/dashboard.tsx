import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { HABITS, type HabitEntry } from "@shared/schema";
import { format, startOfWeek, addDays, isToday, isBefore, startOfDay } from "date-fns";
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
  Check,
  X,
  Moon,
  Sun,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
};

const CATEGORY_COLORS: Record<string, string> = {
  exercise: "text-emerald-500 dark:text-emerald-400",
  nutrition: "text-amber-500 dark:text-amber-400",
  hydration: "text-sky-500 dark:text-sky-400",
  mindfulness: "text-violet-500 dark:text-violet-400",
};

const CATEGORY_BG: Record<string, string> = {
  exercise: "bg-emerald-500/10 dark:bg-emerald-400/10",
  nutrition: "bg-amber-500/10 dark:bg-amber-400/10",
  hydration: "bg-sky-500/10 dark:bg-sky-400/10",
  mindfulness: "bg-violet-500/10 dark:bg-violet-400/10",
};

const CATEGORY_CHECK: Record<string, string> = {
  exercise: "bg-emerald-500 dark:bg-emerald-400",
  nutrition: "bg-amber-500 dark:bg-amber-400",
  hydration: "bg-sky-500 dark:bg-sky-400",
  mindfulness: "bg-violet-500 dark:bg-violet-400",
};

function getWeekDates(weekStart: Date) {
  return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
}

export default function Dashboard() {
  const [weekOffset, setWeekOffset] = useState(0);
  const [darkMode, setDarkMode] = useState(() =>
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );

  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle("dark", next);
      return next;
    });
  };

  // Initialize dark mode on mount
  useMemo(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, []);

  const weekStart = useMemo(
    () => addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), weekOffset * 7),
    [weekOffset]
  );
  const weekDates = useMemo(() => getWeekDates(weekStart), [weekStart]);
  const startStr = format(weekStart, "yyyy-MM-dd");
  const endStr = format(addDays(weekStart, 6), "yyyy-MM-dd");

  const { data: entries = [] } = useQuery<HabitEntry[]>({
    queryKey: ["/api/entries", startStr, endStr],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/entries?start=${startStr}&end=${endStr}`);
      return res.json();
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ date, habitKey }: { date: string; habitKey: string }) => {
      const res = await apiRequest("POST", "/api/entries/toggle", { date, habitKey });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/entries", startStr, endStr] });
    },
  });

  const entryMap = useMemo(() => {
    const map = new Map<string, boolean>();
    entries.forEach((e) => {
      if (e.completed) map.set(`${e.date}:${e.habitKey}`, true);
    });
    return map;
  }, [entries]);

  const isCompleted = (date: string, habitKey: string) =>
    entryMap.has(`${date}:${habitKey}`);

  // Weekly stats
  const totalPossible = 7 * HABITS.length;
  const totalCompleted = entries.filter((e) => e.completed).length;
  const completionRate = totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0;

  // Today's stats
  const todayStr = format(new Date(), "yyyy-MM-dd");
  const todayCompleted = entries.filter(
    (e) => e.date === todayStr && e.completed
  ).length;

  // Current streak (consecutive days with all habits completed)
  const streakCount = useMemo(() => {
    let streak = 0;
    const today = startOfDay(new Date());
    for (let i = 0; i < 365; i++) {
      const d = addDays(today, -i);
      const dateStr = format(d, "yyyy-MM-dd");
      const dayEntries = entries.filter((e) => e.date === dateStr && e.completed);
      if (dayEntries.length === HABITS.length) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }
    return streak;
  }, [entries]);

  // Day completion counts for the progress row
  const dayCompletionCounts = useMemo(() => {
    return weekDates.map((d) => {
      const dateStr = format(d, "yyyy-MM-dd");
      return entries.filter((e) => e.date === dateStr && e.completed).length;
    });
  }, [entries, weekDates]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border sticky top-0 z-20 bg-background/95 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* SVG Logo */}
            <svg
              width="28"
              height="28"
              viewBox="0 0 32 32"
              fill="none"
              aria-label="Habit Tracker"
              className="text-primary shrink-0"
            >
              <rect
                x="3"
                y="3"
                width="26"
                height="26"
                rx="6"
                stroke="currentColor"
                strokeWidth="2.5"
              />
              <path
                d="M10 16.5L14 20.5L22 12"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <h1 className="text-base font-semibold tracking-tight">
              Habit Tracker
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setWeekOffset(0)}
              className="h-8 w-8"
              data-testid="button-today"
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <RotateCcw className="h-4 w-4" />
                </TooltipTrigger>
                <TooltipContent>Current week</TooltipContent>
              </Tooltip>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleDarkMode}
              className="h-8 w-8"
              data-testid="button-theme"
            >
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card className="p-4" data-testid="card-today">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Today
            </p>
            <p className="text-2xl font-bold tabular-nums mt-1">
              {todayCompleted}
              <span className="text-sm font-normal text-muted-foreground">
                /{HABITS.length}
              </span>
            </p>
          </Card>
          <Card className="p-4" data-testid="card-week">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              This Week
            </p>
            <p className="text-2xl font-bold tabular-nums mt-1">
              {completionRate}
              <span className="text-sm font-normal text-muted-foreground">%</span>
            </p>
          </Card>
          <Card className="p-4" data-testid="card-completed">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Completed
            </p>
            <p className="text-2xl font-bold tabular-nums mt-1">
              {totalCompleted}
              <span className="text-sm font-normal text-muted-foreground">
                /{totalPossible}
              </span>
            </p>
          </Card>
          <Card className="p-4" data-testid="card-streak">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Streak
            </p>
            <p className="text-2xl font-bold tabular-nums mt-1">
              {streakCount}
              <span className="text-sm font-normal text-muted-foreground"> day{streakCount !== 1 ? "s" : ""}</span>
            </p>
          </Card>
        </div>

        {/* Week Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setWeekOffset((o) => o - 1)}
            className="h-8 w-8"
            data-testid="button-prev-week"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <p className="text-sm font-medium text-muted-foreground">
            {format(weekStart, "MMM d")} — {format(addDays(weekStart, 6), "MMM d, yyyy")}
          </p>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setWeekOffset((o) => o + 1)}
            className="h-8 w-8"
            data-testid="button-next-week"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Habit Grid */}
        <Card className="overflow-hidden" data-testid="card-habit-grid">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wide py-3 px-4 w-[160px] min-w-[140px]">
                    Habit
                  </th>
                  {weekDates.map((d) => {
                    const today = isToday(d);
                    return (
                      <th
                        key={d.toISOString()}
                        className={`text-center py-3 px-2 min-w-[60px] ${
                          today ? "bg-primary/5" : ""
                        }`}
                      >
                        <p
                          className={`text-[10px] font-medium uppercase tracking-wider ${
                            today
                              ? "text-primary"
                              : "text-muted-foreground"
                          }`}
                        >
                          {format(d, "EEE")}
                        </p>
                        <p
                          className={`text-sm font-semibold tabular-nums mt-0.5 ${
                            today ? "text-primary" : "text-foreground"
                          }`}
                        >
                          {format(d, "d")}
                        </p>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {HABITS.map((habit, idx) => {
                  const Icon = ICON_MAP[habit.icon];
                  const isLast = idx === HABITS.length - 1;
                  const isDoomScroll = habit.key === "doom_scroll";

                  return (
                    <tr
                      key={habit.key}
                      className={`${!isLast ? "border-b border-border/50" : ""} group`}
                      data-testid={`row-habit-${habit.key}`}
                    >
                      <td className="py-2.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${CATEGORY_BG[habit.category]}`}
                          >
                            {Icon && (
                              <Icon
                                className={`h-3.5 w-3.5 ${CATEGORY_COLORS[habit.category]}`}
                              />
                            )}
                          </div>
                          <span className="text-sm font-medium whitespace-nowrap">
                            {habit.label}
                          </span>
                        </div>
                      </td>
                      {weekDates.map((d) => {
                        const dateStr = format(d, "yyyy-MM-dd");
                        const done = isCompleted(dateStr, habit.key);
                        const today = isToday(d);
                        const past = isBefore(d, startOfDay(new Date()));

                        // For doom scroll: completed = bad (red X), not completed = good (green check)
                        // Wait, the user wants to track "1 session of doom scrolling" — so checking it means they kept it to 1 session
                        // Let's keep it consistent: checked = did it / met the goal

                        return (
                          <td
                            key={d.toISOString()}
                            className={`text-center py-2.5 px-2 ${
                              today ? "bg-primary/5" : ""
                            }`}
                          >
                            <button
                              onClick={() =>
                                toggleMutation.mutate({
                                  date: dateStr,
                                  habitKey: habit.key,
                                })
                              }
                              disabled={toggleMutation.isPending}
                              className={`w-8 h-8 rounded-lg mx-auto flex items-center justify-center transition-all duration-150 ${
                                done
                                  ? isDoomScroll
                                    ? "bg-violet-500/15 dark:bg-violet-400/15 text-violet-600 dark:text-violet-400"
                                    : `${CATEGORY_CHECK[habit.category]} text-white`
                                  : "bg-muted/50 hover:bg-muted text-transparent hover:text-muted-foreground/30"
                              }`}
                              data-testid={`toggle-${habit.key}-${dateStr}`}
                            >
                              {done ? (
                                isDoomScroll ? (
                                  <Smartphone className="h-3.5 w-3.5" />
                                ) : (
                                  <Check className="h-3.5 w-3.5" />
                                )
                              ) : (
                                <Check className="h-3.5 w-3.5" />
                              )}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
                {/* Progress row */}
                <tr className="border-t border-border bg-muted/30">
                  <td className="py-3 px-4">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Daily Total
                    </span>
                  </td>
                  {weekDates.map((d, i) => {
                    const today = isToday(d);
                    const count = dayCompletionCounts[i];
                    const pct = Math.round((count / HABITS.length) * 100);
                    return (
                      <td
                        key={d.toISOString()}
                        className={`text-center py-3 px-2 ${
                          today ? "bg-primary/5" : ""
                        }`}
                      >
                        <div className="flex flex-col items-center gap-1">
                          <span
                            className={`text-xs font-bold tabular-nums ${
                              count === HABITS.length
                                ? "text-primary"
                                : count > 0
                                ? "text-foreground"
                                : "text-muted-foreground"
                            }`}
                          >
                            {count}/{HABITS.length}
                          </span>
                          <div className="w-8 h-1 rounded-full bg-muted overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                count === HABITS.length
                                  ? "bg-primary"
                                  : count > 0
                                  ? "bg-primary/50"
                                  : "bg-transparent"
                              }`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        </Card>

        {/* Category Legend */}
        <div className="flex flex-wrap gap-4 justify-center">
          {[
            { label: "Exercise", color: "bg-emerald-500" },
            { label: "Nutrition", color: "bg-amber-500" },
            { label: "Hydration", color: "bg-sky-500" },
            { label: "Mindfulness", color: "bg-violet-500" },
          ].map((cat) => (
            <div key={cat.label} className="flex items-center gap-1.5">
              <div className={`w-2.5 h-2.5 rounded-full ${cat.color}`} />
              <span className="text-xs text-muted-foreground font-medium">
                {cat.label}
              </span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <footer className="text-center py-4 border-t border-border mt-8">
          <PerplexityAttribution />
        </footer>
      </main>
    </div>
  );
}
