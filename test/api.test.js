"use strict";
const test = require("node:test");
const assert = require("node:assert");
const os = require("node:os");
const path = require("node:path");
const fs = require("node:fs");

process.env.DB_PATH = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "cc-")), "test.db");
const app = require("../server/index.js");

let server, base;
test.before(() => new Promise((r) => { server = app.listen(0, () => { base = `http://127.0.0.1:${server.address().port}`; r(); }); }));
test.after(() => server.close());

const post = (p, body, cookie) => fetch(base + p, { method: "POST", headers: { "Content-Type": "application/json", ...(cookie ? { cookie } : {}) }, body: JSON.stringify(body || {}) });
const get = (p, cookie) => fetch(base + p, { headers: cookie ? { cookie } : {} });
const cookieOf = (res) => (res.headers.get("set-cookie") || "").split(";")[0];

test("lists all imported styles", async () => {
  const d = await (await get("/api/styles")).json();
  assert.ok(d.styles.length >= 59);
  assert.ok(d.styles.every((s) => s.image && s.video && s.name));
});

test("style guide is locked until logged in", async () => {
  const d = await (await get("/api/styles/watercolor")).json();
  assert.equal(d.locked, true);
  assert.equal(d.guideHtml, undefined);
});

test("sign up, me, save style, log out, log in", async () => {
  let res = await post("/api/auth/signup", { name: "Test User", email: "Test@Example.com", password: "short" });
  assert.equal(res.status, 400);

  res = await post("/api/auth/signup", { name: "Test User", email: "Test@Example.com", password: "correct horse" });
  assert.equal(res.status, 201);
  const cookie = cookieOf(res);
  assert.match(res.headers.get("set-cookie"), /HttpOnly/i);

  assert.equal((await post("/api/auth/signup", { name: "X", email: "test@example.com", password: "correct horse" })).status, 409);

  const me = await (await get("/api/auth/me", cookie)).json();
  assert.equal(me.user.email, "test@example.com");

  const style = await (await get("/api/styles/watercolor", cookie)).json();
  assert.equal(style.locked, false);
  assert.match(style.guideHtml, /<h2/);

  assert.equal((await post("/api/me/favorites/watercolor", {}, cookie)).status, 200);
  const favs = await (await get("/api/me/favorites", cookie)).json();
  assert.deepEqual(favs.styles.map((s) => s.slug), ["watercolor"]);

  await post("/api/auth/logout", {}, cookie);
  assert.equal((await (await get("/api/auth/me", cookie)).json()).user, null);
  assert.equal((await get("/api/me/favorites", cookie)).status, 401);

  assert.equal((await post("/api/auth/login", { email: "test@example.com", password: "wrong password" })).status, 401);
  res = await post("/api/auth/login", { email: "TEST@example.com", password: "correct horse" });
  assert.equal(res.status, 200);
  assert.ok(cookieOf(res).startsWith("cc_session="));
});

test("blocks cross-site writes", async () => {
  const res = await fetch(base + "/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json", Origin: "https://evil.example" }, body: "{}" });
  assert.equal(res.status, 403);
});

test("serves pages", async () => {
  for (const p of ["/", "/login", "/signup", "/account", "/styles/ukiyoe"]) assert.equal((await get(p)).status, 200, p);
  assert.equal((await get("/styles/nope")).status, 404);
});
