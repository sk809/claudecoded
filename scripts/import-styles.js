#!/usr/bin/env node
// Imports the style library from a local checkout of lemomo-ai/lemo-opuscar.
//
//   node scripts/import-styles.js /path/to/lemo-opuscar
//
// Writes data/styles.json, copies each style guide to data/guides/<slug>.md and
// a preview still to public/styles-img/<slug>.jpg (resized to 640px when ffmpeg
// is available). Demo films stay on the source repo's GitHub release.
"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const SOURCE_REPO = "lemomo-ai/lemo-opuscar";
const FILMS_URL = `https://github.com/${SOURCE_REPO}/releases/download/films`;
const ROOT = path.resolve(__dirname, "..");

const src = path.resolve(process.argv[2] || path.join(ROOT, "..", "lemo-opuscar"));
const catalogPath = path.join(src, "styleboard", "catalog.json");
if (!fs.existsSync(catalogPath)) {
  console.error(`No styleboard/catalog.json under ${src}. Pass the path to a lemo-opuscar checkout.`);
  process.exit(1);
}

const slugify = (s) => s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const hasFfmpeg = spawnSync("ffmpeg", ["-version"]).status === 0;

const guidesDir = path.join(ROOT, "data", "guides");
const imgDir = path.join(ROOT, "public", "styles-img");
fs.mkdirSync(guidesDir, { recursive: true });
fs.mkdirSync(imgDir, { recursive: true });

const catalog = JSON.parse(fs.readFileSync(catalogPath, "utf8"));
const categories = [];
const styles = [];

for (const entry of catalog) {
  const dir = path.join(src, "styles", entry.slug);
  const meta = fs.existsSync(path.join(dir, "style.json"))
    ? JSON.parse(fs.readFileSync(path.join(dir, "style.json"), "utf8"))
    : {};

  const category = entry.cat_en || meta.category_en || "Other";
  const categoryId = slugify(category);
  if (!categories.find((c) => c.id === categoryId)) categories.push({ id: categoryId, label: category });

  // Style guide: the STYLE.md prompt. Its first blockquote line is the one-line look.
  let summary = "";
  const guideSrc = path.join(dir, "STYLE.md");
  if (fs.existsSync(guideSrc)) {
    const md = fs.readFileSync(guideSrc, "utf8");
    fs.writeFileSync(path.join(guidesDir, `${entry.slug}.md`), md);
    const quote = md.split("\n").find((l) => l.startsWith("> "));
    if (quote) summary = quote.slice(2).trim();
  }

  // Preview still: the gallery frame, falling back to the poster.
  const stillSrc = [path.join(src, "styleboard", "img", `${entry.slug}_0.jpg`), path.join(dir, "poster.jpg")].find((p) => fs.existsSync(p));
  let image = null;
  if (stillSrc) {
    const out = path.join(imgDir, `${entry.slug}.jpg`);
    const resized = hasFfmpeg && spawnSync("ffmpeg", ["-y", "-loglevel", "error", "-i", stillSrc, "-vf", "scale=640:-2", "-q:v", "4", out]).status === 0;
    if (!resized) fs.copyFileSync(stillSrc, out);
    image = `/styles-img/${entry.slug}.jpg`;
  }

  styles.push({
    slug: entry.slug,
    number: entry.num || meta.num || null,
    name: entry.en || meta.en,
    nameCn: entry.cn || meta.cn || null,
    category: categoryId,
    categoryLabel: category,
    film: entry.film || meta.film || null,
    line: entry.line || meta.line || "",
    summary,
    uses: entry.uses || meta.uses || [],
    duration: entry.dur || meta.dur || null,
    image,
    video: `${FILMS_URL}/${entry.slug}.mp4`,
    source: `https://github.com/${SOURCE_REPO}/tree/main/styles/${entry.slug}`,
    status: "live"
  });
}

const out = {
  source: { repo: SOURCE_REPO, url: `https://github.com/${SOURCE_REPO}`, licence: "Code MIT; demo films and stills CC BY 4.0 by LemoLab", importedAt: new Date().toISOString() },
  categories,
  styles
};
fs.writeFileSync(path.join(ROOT, "data", "styles.json"), JSON.stringify(out, null, 2) + "\n");
console.log(`Imported ${styles.length} styles in ${categories.length} categories${hasFfmpeg ? "" : " (ffmpeg not found, stills copied at full size)"}.`);
