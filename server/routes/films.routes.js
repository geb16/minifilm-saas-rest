import express from "express";
import crypto from "crypto";
import { db } from "../db/memory.js";
import { authenticate } from "../middleware/oauth.js";
import { requireRole } from "../middleware/authz.js";
import { filmSchema } from "../validation/schemas.js";

const router = express.Router();

// Get films owned by the authenticated user
router.get("/", authenticate, (req, res) => {
  const userId = req.user.sub;
  const userFilms = db.films.filter(f => f.ownerUserId === userId);
  res.json(userFilms);
});

// Create a film (authenticated users only)
router.post("/", authenticate, (req, res) => {
  const parsed = filmSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.errors });
  }

  const film = {
    id: crypto.randomUUID(),
    title: parsed.data.title,
    ownerUserId: req.user.sub
  };

  db.films.push(film);
  res.status(201).json(film);
});

// Admin-only endpoint (authorization example)
router.delete("/:id", authenticate, requireRole("admin"), (req, res) => {
  db.films = db.films.filter(f => f.id !== req.params.id);
  res.status(204).send();
});

export default router;
