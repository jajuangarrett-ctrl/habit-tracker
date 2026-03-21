import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const habitEntries = sqliteTable("habit_entries", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  date: text("date").notNull(),
  habitKey: text("habit_key").notNull(),
  completed: integer("completed").notNull().default(0),
});

export const insertHabitEntrySchema = createInsertSchema(habitEntries).omit({ id: true });
export type InsertHabitEntry = z.infer<typeof insertHabitEntrySchema>;
export type HabitEntry = typeof habitEntries.$inferSelect;

export interface HabitDef {
  key: string;
  label: string;
  icon: string;
  category: string;
}

// Available icons for habit creation
export const AVAILABLE_ICONS = [
  "heart-pulse", "dumbbell", "sunrise", "sunset", "flame", "timer",
  "droplets", "smartphone", "apple", "brain", "book-open", "music",
  "bed", "coffee", "pill", "footprints", "eye", "pencil", "target", "zap",
] as const;

// Available categories
export const CATEGORIES = [
  { key: "exercise", label: "Exercise" },
  { key: "nutrition", label: "Nutrition" },
  { key: "hydration", label: "Hydration" },
  { key: "mindfulness", label: "Mindfulness" },
  { key: "health", label: "Health" },
  { key: "productivity", label: "Productivity" },
] as const;

// Default habit list
export const DEFAULT_HABITS: HabitDef[] = [
  { key: "cardio", label: "Cardio", icon: "heart-pulse", category: "exercise" },
  { key: "weights", label: "Weights", icon: "dumbbell", category: "exercise" },
  { key: "stretch_am", label: "Stretch (AM)", icon: "sunrise", category: "exercise" },
  { key: "stretch_pm", label: "Stretch (PM)", icon: "sunset", category: "exercise" },
  { key: "calorie_goal", label: "Calorie Goal", icon: "flame", category: "nutrition" },
  { key: "fasting_16h", label: "16h Fast", icon: "timer", category: "nutrition" },
  { key: "water_am", label: "Water (AM)", icon: "droplets", category: "hydration" },
  { key: "water_pm", label: "Water (PM)", icon: "droplets", category: "hydration" },
  { key: "doom_scroll", label: "Doom Scroll", icon: "smartphone", category: "mindfulness" },
];

// Keep HABITS as alias for backward compat
export const HABITS = DEFAULT_HABITS;
