import { habitEntries, type HabitEntry, type InsertHabitEntry } from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  getEntriesForWeek(startDate: string, endDate: string): HabitEntry[];
  toggleEntry(date: string, habitKey: string): HabitEntry;
  getEntriesForDate(date: string): HabitEntry[];
}

export class DatabaseStorage implements IStorage {
  getEntriesForWeek(startDate: string, endDate: string): HabitEntry[] {
    return db
      .select()
      .from(habitEntries)
      .where(
        and(
          // SQLite string comparison works for YYYY-MM-DD format
        )
      )
      .all()
      .filter((e) => e.date >= startDate && e.date <= endDate);
  }

  getEntriesForDate(date: string): HabitEntry[] {
    return db
      .select()
      .from(habitEntries)
      .where(eq(habitEntries.date, date))
      .all();
  }

  toggleEntry(date: string, habitKey: string): HabitEntry {
    const existing = db
      .select()
      .from(habitEntries)
      .where(
        and(
          eq(habitEntries.date, date),
          eq(habitEntries.habitKey, habitKey)
        )
      )
      .get();

    if (existing) {
      const newCompleted = existing.completed ? 0 : 1;
      db.update(habitEntries)
        .set({ completed: newCompleted })
        .where(eq(habitEntries.id, existing.id))
        .run();
      return { ...existing, completed: newCompleted };
    } else {
      return db
        .insert(habitEntries)
        .values({ date, habitKey, completed: 1 })
        .returning()
        .get();
    }
  }
}

export const storage = new DatabaseStorage();
