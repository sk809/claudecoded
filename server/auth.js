"use strict";

const crypto = require("node:crypto");
const express = require("express");
const db = require("./db");

const COOKIE = "cc_session";
const SESSION_DAYS = 30;
const SECURE_COOKIE = process.env.NODE_ENV === "production";

// ----- Passwords: scrypt with a per-user salt -----
const SCRYPT = { N: 16384, r: 8, p: 1, keylen: 64 };

function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  const key = crypto.scryptSync(password, salt, SCRYPT.keylen, { N: SCRYPT.N, r: SCRYPT.r, p: SCRYPT.p });
  return `scrypt$${SCRYPT.N}$${SCRYPT.r}$${SCRYPT.p}$${salt.toString("base64")}$${key.toString("base64")}`;
}

function verifyPassword(password, stored) {
  const [scheme, N, r, p, saltB64, keyB64] = String(stored).split("$");
  if (scheme !== "scrypt") return false;
  const expected = Buffer.from(keyB64, "base64");
  const key = crypto.scryptSync(password, Buffer.from(saltB64, "base64"), expected.length, { N: +N, r: +r, p: +p });
  return crypto.timingSafeEqual(key, expected);
}

// A fixed hash so unknown emails cost the same time as wrong passwords.
const DUMMY_HASH = hashPassword(crypto.randomBytes(16).toString("hex"));

// ----- Sessions: random token in an httpOnly cookie, only its hash stored -----
const sha256 = (s) => crypto.createHash("sha256").update(s).digest("hex");

function createSession(res, userId) {
  const token = crypto.randomBytes(32).toString("base64url");
  const expires = Date.now() + SESSION_DAYS * 864e5;
  db.prepare("INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)").run(sha256(token), userId, expires);
  res.cookie(COOKIE, token, { httpOnly: true, sameSite: "lax", secure: SECURE_COOKIE, expires: new Date(expires), path: "/" });
}

function readCookie(req, name) {
  const header = req.headers.cookie || "";
  for (const part of header.split(";")) {
    const i = part.indexOf("=");
    if (i > -1 && part.slice(0, i).trim() === name) return decodeURIComponent(part.slice(i + 1).trim());
  }
  return null;
}

// Attaches req.user when the session cookie is valid.
function loadUser(req, _res, next) {
  const token = readCookie(req, COOKIE);
  if (token) {
    const row = db.prepare(`
      SELECT u.id, u.email, u.name, u.created_at, s.expires_at
      FROM sessions s JOIN users u ON u.id = s.user_id
      WHERE s.token_hash = ?`).get(sha256(token));
    if (row && row.expires_at > Date.now()) {
      req.user = { id: row.id, email: row.email, name: row.name, createdAt: row.created_at };
      req.sessionTokenHash = sha256(token);
    } else if (row) {
      db.prepare("DELETE FROM sessions WHERE token_hash = ?").run(sha256(token));
    }
  }
  next();
}

function requireUser(req, res, next) {
  if (!req.user) return res.status(401).json({ error: "Log in to continue." });
  next();
}

// ----- Simple in-memory rate limit for auth attempts (per IP) -----
const attempts = new Map();
function rateLimit(req, res, next) {
  const key = req.ip;
  const now = Date.now();
  const windowMs = 15 * 60 * 1000;
  const list = (attempts.get(key) || []).filter((t) => now - t < windowMs);
  if (list.length >= 20) return res.status(429).json({ error: "Too many attempts. Wait a few minutes and try again." });
  list.push(now);
  attempts.set(key, list);
  next();
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const publicUser = (u) => ({ id: u.id, email: u.email, name: u.name, createdAt: u.createdAt || u.created_at });

const router = express.Router();

router.post("/signup", rateLimit, (req, res) => {
  const name = String(req.body?.name || "").trim();
  const email = String(req.body?.email || "").trim().toLowerCase();
  const password = String(req.body?.password || "");
  if (!name || name.length > 80) return res.status(400).json({ error: "Enter your name.", field: "name" });
  if (!EMAIL_RE.test(email) || email.length > 254) return res.status(400).json({ error: "Enter a valid email address.", field: "email" });
  if (password.length < 8) return res.status(400).json({ error: "Use at least 8 characters for your password.", field: "password" });
  if (password.length > 200) return res.status(400).json({ error: "That password is too long.", field: "password" });
  if (db.prepare("SELECT 1 FROM users WHERE email = ?").get(email)) {
    return res.status(409).json({ error: "An account with this email already exists. Log in instead.", field: "email" });
  }
  const info = db.prepare("INSERT INTO users (email, name, password_hash) VALUES (?, ?, ?)").run(email, name, hashPassword(password));
  const user = db.prepare("SELECT id, email, name, created_at FROM users WHERE id = ?").get(info.lastInsertRowid);
  createSession(res, user.id);
  res.status(201).json({ user: publicUser(user) });
});

router.post("/login", rateLimit, (req, res) => {
  const email = String(req.body?.email || "").trim().toLowerCase();
  const password = String(req.body?.password || "");
  const user = db.prepare("SELECT id, email, name, created_at, password_hash FROM users WHERE email = ?").get(email);
  const ok = verifyPassword(password, user ? user.password_hash : DUMMY_HASH) && !!user;
  if (!ok) return res.status(401).json({ error: "That email and password don't match an account." });
  createSession(res, user.id);
  res.json({ user: publicUser(user) });
});

router.post("/logout", (req, res) => {
  if (req.sessionTokenHash) db.prepare("DELETE FROM sessions WHERE token_hash = ?").run(req.sessionTokenHash);
  res.clearCookie(COOKIE, { path: "/" });
  res.json({ ok: true });
});

router.get("/me", (req, res) => {
  res.json({ user: req.user ? publicUser(req.user) : null });
});

module.exports = { router, loadUser, requireUser, hashPassword, verifyPassword };
