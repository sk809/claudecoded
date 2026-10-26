"use strict";

const fs = require("node:fs");
const path = require("node:path");
const express = require("express");
const { marked } = require("marked");
const db = require("./db");
const auth = require("./auth");

const ROOT = path.join(__dirname, "..");
const PUBLIC = path.join(ROOT, "public");
const catalog = JSON.parse(fs.readFileSync(path.join(ROOT, "data", "styles.json"), "utf8"));
const bySlug = new Map(catalog.styles.map((s) => [s.slug, s]));

// Style guides come from a third-party repo: render Markdown, but show any raw HTML as text.
const escapeHtml = (s) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
marked.use({ renderer: { html: (token) => escapeHtml(typeof token === "string" ? token : token.text) } });

const app = express();
app.disable("x-powered-by");
app.set("trust proxy", 1);
app.use(express.json({ limit: "20kb" }));

// Reject cross-site writes: browsers send Origin on POST/DELETE.
app.use((req, res, next) => {
  if (req.method === "GET" || req.method === "HEAD") return next();
  const origin = req.headers.origin;
  if (origin && new URL(origin).host !== req.headers.host) return res.status(403).json({ error: "Cross-site request blocked." });
  next();
});

app.use(auth.loadUser);
app.use("/api/auth", auth.router);

// ----- Styles -----
app.get("/api/styles", (_req, res) => {
  res.json({ source: catalog.source, categories: catalog.categories, styles: catalog.styles });
});

app.get("/api/styles/:slug", (req, res) => {
  const style = bySlug.get(req.params.slug);
  if (!style) return res.status(404).json({ error: "No style with that name." });
  const body = { style, locked: !req.user };
  if (req.user) {
    const file = path.join(ROOT, "data", "guides", `${style.slug}.md`);
    body.guideHtml = fs.existsSync(file) ? marked.parse(fs.readFileSync(file, "utf8")) : null;
    body.saved = !!db.prepare("SELECT 1 FROM favorites WHERE user_id = ? AND slug = ?").get(req.user.id, style.slug);
  }
  res.json(body);
});

// ----- Saved styles -----
app.get("/api/me/favorites", auth.requireUser, (req, res) => {
  const rows = db.prepare("SELECT slug FROM favorites WHERE user_id = ? ORDER BY created_at DESC").all(req.user.id);
  res.json({ styles: rows.map((r) => bySlug.get(r.slug)).filter(Boolean) });
});

app.post("/api/me/favorites/:slug", auth.requireUser, (req, res) => {
  if (!bySlug.has(req.params.slug)) return res.status(404).json({ error: "No style with that name." });
  db.prepare("INSERT OR IGNORE INTO favorites (user_id, slug) VALUES (?, ?)").run(req.user.id, req.params.slug);
  res.json({ saved: true });
});

app.delete("/api/me/favorites/:slug", auth.requireUser, (req, res) => {
  db.prepare("DELETE FROM favorites WHERE user_id = ? AND slug = ?").run(req.user.id, req.params.slug);
  res.json({ saved: false });
});

app.use("/api", (_req, res) => res.status(404).json({ error: "Not found." }));

// ----- Pages -----
const page = (file) => (_req, res) => res.sendFile(path.join(PUBLIC, file));
app.get("/login", page("login.html"));
app.get("/signup", page("signup.html"));
app.get("/account", page("account.html"));
app.get("/styles/:slug", (req, res, next) => (bySlug.has(req.params.slug) ? page("style.html")(req, res) : next()));
app.use(express.static(PUBLIC, { extensions: ["html"], maxAge: "1h" }));
app.use((_req, res) => res.status(404).sendFile(path.join(PUBLIC, "404.html")));

const PORT = Number(process.env.PORT) || 3000;
if (require.main === module) {
  app.listen(PORT, () => console.log(`ClaudeCodes running at http://localhost:${PORT}`));
}

module.exports = app;
