import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Get entries for a date range (week view)
  app.get("/api/entries", (req, res) => {
    const { start, end } = req.query;
    if (!start || !end) {
      return res.status(400).json({ error: "start and end query params required" });
    }
    const entries = storage.getEntriesForWeek(start as string, end as string);
    res.json(entries);
  });

  // Toggle a habit entry
  app.post("/api/entries/toggle", (req, res) => {
    const { date, habitKey } = req.body;
    if (!date || !habitKey) {
      return res.status(400).json({ error: "date and habitKey required" });
    }
    const entry = storage.toggleEntry(date, habitKey);
    res.json(entry);
  });

  return httpServer;
}
