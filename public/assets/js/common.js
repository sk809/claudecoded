// Shared by every page: session state in the nav, mobile menu, small helpers.
(function () {
  "use strict";

  var CC = (window.CC = window.CC || {});

  CC.api = function (url, opts) {
    opts = opts || {};
    var init = { method: opts.method || "GET", credentials: "same-origin", headers: {} };
    if (opts.body) {
      init.headers["Content-Type"] = "application/json";
      init.body = JSON.stringify(opts.body);
    }
    return fetch(url, init).then(function (res) {
      return res.json().catch(function () { return {}; }).then(function (data) {
        if (!res.ok) {
          var err = new Error(data.error || "Something went wrong. Try again.");
          err.status = res.status;
          err.field = data.field;
          throw err;
        }
        return data;
      });
    });
  };

  CC.el = function (tag, attrs, children) {
    var n = document.createElement(tag);
    for (var k in attrs || {}) {
      if (attrs[k] == null) continue;
      if (k === "text") n.textContent = attrs[k];
      else if (k === "class") n.className = attrs[k];
      else n.setAttribute(k, attrs[k]);
    }
    (children || []).forEach(function (c) {
      if (c == null) return;
      n.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    });
    return n;
  };

  CC.formatDuration = function (sec) {
    if (!sec) return "";
    var s = Math.round(sec);
    return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0");
  };

  // Resolves to the signed-in user, or null. Cached for the page's lifetime.
  var mePromise;
  CC.me = function () {
    if (!mePromise) {
      mePromise = CC.api("/api/auth/me").then(function (d) { return d.user; }).catch(function () { return null; });
    }
    return mePromise;
  };

  CC.logout = function () {
    return CC.api("/api/auth/logout", { method: "POST" }).then(function () { window.location.href = "/"; });
  };

  // ----- Demo film player (a dialog shared by the gallery and style pages) -----
  CC.openPreview = function (style) {
    var dlg = document.getElementById("preview-dialog");
    if (!dlg) {
      dlg = CC.el("dialog", { id: "preview-dialog", class: "preview-dialog", "aria-labelledby": "preview-title" });
      document.body.appendChild(dlg);
      dlg.addEventListener("click", function (e) { if (e.target === dlg) dlg.close(); });
      dlg.addEventListener("close", function () { var v = dlg.querySelector("video"); if (v) v.pause(); dlg.innerHTML = ""; });
    }
    // A static preview (no server) can't stream the film inline, so it links out instead.
    var video = window.CC_STATIC
      ? CC.el("a", { class: "preview-static", href: style.video, target: "_blank", rel: "noopener" }, [CC.el("img", { src: style.image, alt: "" }), CC.el("span", { class: "play", text: "\u25B6" })])
      : CC.el("video", { controls: "", autoplay: "", playsinline: "", preload: "metadata", poster: style.image, src: style.video });
    dlg.innerHTML = "";
    dlg.appendChild(CC.el("div", { class: "preview-head" }, [
      CC.el("div", {}, [
        CC.el("span", { class: "eyebrow", text: style.categoryLabel }),
        CC.el("h3", { id: "preview-title", text: style.name + (style.film ? " \u00b7 " + style.film : "") })
      ]),
      (function () { var b = CC.el("button", { class: "icon-btn", type: "button", "aria-label": "Close preview", text: "\u2715" }); b.addEventListener("click", function () { dlg.close(); }); return b; })()
    ]));
    dlg.appendChild(CC.el("div", { class: "preview-video" }, [video]));
    dlg.appendChild(CC.el("div", { class: "preview-foot" }, [
      CC.el("p", { text: style.line }),
      CC.el("a", { class: "btn btn-ghost btn-sm", href: "/styles/" + style.slug, text: "Open style" })
    ]));
    dlg.showModal();
  };

  // ----- Nav auth area -----
  function renderAuth(user) {
    var slot = document.querySelector("[data-auth-slot]");
    if (!slot) return;
    slot.innerHTML = "";
    if (user) {
      var initial = (user.name || user.email || "?").trim().charAt(0).toUpperCase();
      slot.appendChild(CC.el("a", { class: "account-chip", href: "/account", title: user.email }, [
        CC.el("span", { class: "avatar", text: initial, "aria-hidden": "true" }),
        CC.el("span", { class: "account-name", text: user.name.split(" ")[0] })
      ]));
    } else {
      var next = encodeURIComponent(location.pathname + location.hash);
      slot.appendChild(CC.el("a", { class: "login", href: "/login?next=" + next, text: "Log in" }));
      slot.appendChild(CC.el("a", { class: "btn btn-primary btn-sm", href: "/signup?next=" + next, text: "Get started" }));
    }
  }

  // ----- Mobile menu -----
  function initNav() {
    var nav = document.querySelector(".nav");
    var toggle = document.querySelector(".nav-toggle");
    if (!nav || !toggle) return;
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    nav.querySelectorAll(".nav-links a").forEach(function (a) {
      a.addEventListener("click", function () { nav.classList.remove("open"); toggle.setAttribute("aria-expanded", "false"); });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initNav();
    CC.me().then(renderAuth);
  });
})();
