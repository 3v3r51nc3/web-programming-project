// Backend developer: Maksym DOLHOV
import { Router } from "express";
import db from "../db.js";

const router = Router();

// GET /api/events — list all events
router.get("/", (req, res) => {
  const events = db.prepare("SELECT * FROM events ORDER BY id").all();
  res.json(events);
});

// GET /api/events/:id — get one event
router.get("/:id", (req, res) => {
  const event = db.prepare("SELECT * FROM events WHERE id = ?").get(req.params.id);
  if (!event) {
    return res.status(404).json({ error: true, status_code: 404, details: "Event not found" });
  }
  res.json(event);
});

// POST /api/events — create event
router.post("/", (req, res) => {
  const { title, description, date, location, capacity } = req.body;

  if (!title || !date || !location || !capacity) {
    return res.status(400).json({ error: true, status_code: 400, details: "title, date, location, capacity are required" });
  }

  if (new Date(date) < new Date()) {
    return res.status(400).json({ error: true, status_code: 400, details: "Event date cannot be in the past" });
  }

  if (capacity < 1) {
    return res.status(400).json({ error: true, status_code: 400, details: "Capacity must be at least 1" });
  }

  const result = db
    .prepare("INSERT INTO events (title, description, date, location, capacity) VALUES (?, ?, ?, ?, ?)")
    .run(title, description || "", date, location, capacity);

  const created = db.prepare("SELECT * FROM events WHERE id = ?").get(result.lastInsertRowid);
  res.status(201).json(created);
});

// PUT /api/events/:id — full update
router.put("/:id", (req, res) => {
  const event = db.prepare("SELECT * FROM events WHERE id = ?").get(req.params.id);
  if (!event) {
    return res.status(404).json({ error: true, status_code: 404, details: "Event not found" });
  }

  const { title, description, date, location, capacity } = req.body;

  if (!title || !date || !location || !capacity) {
    return res.status(400).json({ error: true, status_code: 400, details: "title, date, location, capacity are required" });
  }

  db.prepare("UPDATE events SET title = ?, description = ?, date = ?, location = ?, capacity = ? WHERE id = ?")
    .run(title, description || "", date, location, capacity, req.params.id);

  const updated = db.prepare("SELECT * FROM events WHERE id = ?").get(req.params.id);
  res.json(updated);
});

// PATCH /api/events/:id — partial update
router.patch("/:id", (req, res) => {
  const event = db.prepare("SELECT * FROM events WHERE id = ?").get(req.params.id);
  if (!event) {
    return res.status(404).json({ error: true, status_code: 404, details: "Event not found" });
  }

  const fields = { ...event, ...req.body };
  db.prepare("UPDATE events SET title = ?, description = ?, date = ?, location = ?, capacity = ? WHERE id = ?")
    .run(fields.title, fields.description, fields.date, fields.location, fields.capacity, req.params.id);

  const updated = db.prepare("SELECT * FROM events WHERE id = ?").get(req.params.id);
  res.json(updated);
});

// DELETE /api/events/:id — delete event
router.delete("/:id", (req, res) => {
  const event = db.prepare("SELECT * FROM events WHERE id = ?").get(req.params.id);
  if (!event) {
    return res.status(404).json({ error: true, status_code: 404, details: "Event not found" });
  }

  db.prepare("DELETE FROM events WHERE id = ?").run(req.params.id);
  res.status(204).send();
});

export default router;
