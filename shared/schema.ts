import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const habitEntries = sqliteTable("habit_entries", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  date: text("date").notNull(), // YYYY-MM-DD
  habitKey: text("habit_key").notNull(), // e.g. "cardio", "weights", "stretch_am", etc.
  completed: integer("completed").notNull().default(0), // 0 or 1
});

export const insertHabitEntrySchema = createInsertSchema(habitEntries).omit({ id: true });
export type InsertHabitEntry = z.infer<typeof insertHabitEntrySchema>;
export type HabitEntry = typeof habitEntries.$inferSelect;

// Habit definitions (static, not stored in DB)
export const HABITS = [
  { key: "cardio", label: "Cardio", icon: "heart-pulse", category: "exercise" },
  { key: "weights", label: "Weights", icon: "dumbbell", category: "exercise" },
  { key: "stretch_am", label: "Stretch (AM)", icon: "sunrise", category: "exercise" },
  { key: "stretch_pm", label: "Stretch (PM)", icon: "sunset", category: "exercise" },
  { key: "calorie_goal", label: "Calorie Goal", icon: "flame", category: "nutrition" },
  { key: "fasting_16h", label: "16h Fast", icon: "timer", category: "nutrition" },
  { key: "water_am", label: "Water (AM)", icon: "droplets", category: "hydration" },
  { key: "water_pm", label: "Water (PM)", icon: "droplets", category: "hydration" },
  { key: "doom_scroll", label: "Doom Scroll", icon: "smartphone", category: "mindfulness" },
] as const;

export type HabitKey = typeof HABITS[number]["key"];
