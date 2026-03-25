// Backend developer: Maksym DOLHOV
import { Router } from "express";
import db from "../db.js";

const router = Router();

// GET /api/participants — list all participants
router.get("/", (req, res) => {
  const participants = db.prepare("SELECT * FROM participants ORDER BY id").all();
  res.json(participants);
});

// GET /api/participants/:id — get one participant
router.get("/:id", (req, res) => {
  const participant = db.prepare("SELECT * FROM participants WHERE id = ?").get(req.params.id);
  if (!participant) {
    return res.status(404).json({ error: true, status_code: 404, details: "Participant not found" });
  }
  res.json(participant);
});

// POST /api/participants — create participant
router.post("/", (req, res) => {
  const { first_name, last_name, email } = req.body;

  if (!first_name || !last_name || !email) {
    return res.status(400).json({ error: true, status_code: 400, details: "first_name, last_name, email are required" });
  }

  const existing = db.prepare("SELECT id FROM participants WHERE email = ?").get(email);
  if (existing) {
    return res.status(400).json({ error: true, status_code: 400, details: "A participant with this email already exists" });
  }

  const result = db
    .prepare("INSERT INTO participants (first_name, last_name, email) VALUES (?, ?, ?)")
    .run(first_name, last_name, email);

  const created = db.prepare("SELECT * FROM participants WHERE id = ?").get(result.lastInsertRowid);
  res.status(201).json(created);
});

// PUT /api/participants/:id — full update
router.put("/:id", (req, res) => {
  const participant = db.prepare("SELECT * FROM participants WHERE id = ?").get(req.params.id);
  if (!participant) {
    return res.status(404).json({ error: true, status_code: 404, details: "Participant not found" });
  }

  const { first_name, last_name, email } = req.body;

  if (!first_name || !last_name || !email) {
    return res.status(400).json({ error: true, status_code: 400, details: "first_name, last_name, email are required" });
  }

  const existing = db.prepare("SELECT id FROM participants WHERE email = ? AND id != ?").get(email, req.params.id);
  if (existing) {
    return res.status(400).json({ error: true, status_code: 400, details: "A participant with this email already exists" });
  }

  db.prepare("UPDATE participants SET first_name = ?, last_name = ?, email = ? WHERE id = ?")
    .run(first_name, last_name, email, req.params.id);

  const updated = db.prepare("SELECT * FROM participants WHERE id = ?").get(req.params.id);
  res.json(updated);
});

// PATCH /api/participants/:id — partial update
router.patch("/:id", (req, res) => {
  const participant = db.prepare("SELECT * FROM participants WHERE id = ?").get(req.params.id);
  if (!participant) {
    return res.status(404).json({ error: true, status_code: 404, details: "Participant not found" });
  }

  if (req.body.email && req.body.email !== participant.email) {
    const existing = db.prepare("SELECT id FROM participants WHERE email = ? AND id != ?").get(req.body.email, req.params.id);
    if (existing) {
      return res.status(400).json({ error: true, status_code: 400, details: "A participant with this email already exists" });
    }
  }

  const fields = { ...participant, ...req.body };
  db.prepare("UPDATE participants SET first_name = ?, last_name = ?, email = ? WHERE id = ?")
    .run(fields.first_name, fields.last_name, fields.email, req.params.id);

  const updated = db.prepare("SELECT * FROM participants WHERE id = ?").get(req.params.id);
  res.json(updated);
});

// DELETE /api/participants/:id — delete participant
router.delete("/:id", (req, res) => {
  const participant = db.prepare("SELECT * FROM participants WHERE id = ?").get(req.params.id);
  if (!participant) {
    return res.status(404).json({ error: true, status_code: 404, details: "Participant not found" });
  }

  db.prepare("DELETE FROM participants WHERE id = ?").run(req.params.id);
  res.status(204).send();
});

export default router;
