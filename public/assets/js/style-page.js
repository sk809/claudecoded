// One style: preview film, summary, and the full style guide for signed-in users.
(function () {
  "use strict";

  var el = CC.el;
  var root = document.getElementById("style-root");
  var slug = decodeURIComponent(location.pathname.split("/").filter(Boolean).pop() || "");

  function render(data) {
    var s = data.style;
    document.title = s.name + " · ClaudeCodes";

    var player = el("button", { class: "style-hero-media", type: "button", "aria-label": "Watch the " + s.name + " demo film" }, [
      el("img", { src: s.image, alt: s.name + " still from " + (s.film || "the demo film") }),
      el("span", { class: "play", "aria-hidden": "true", text: "▶" }),
      s.duration ? el("span", { class: "dur", text: CC.formatDuration(s.duration) }) : null
    ]);
    player.addEventListener("click", function () { CC.openPreview(s); });

    var actions = el("div", { class: "style-actions" });
    if (data.locked) {
      actions.appendChild(el("a", { class: "btn btn-primary", href: "/login?next=" + encodeURIComponent(location.pathname), text: "Log in to use this style" }));
    } else {
      var saveBtn = el("button", { class: "btn btn-ghost", type: "button", "aria-pressed": String(!!data.saved) });
      var setLabel = function (saved) { saveBtn.textContent = saved ? "✓ Saved" : "Save style"; saveBtn.setAttribute("aria-pressed", String(saved)); };
      setLabel(data.saved);
      saveBtn.addEventListener("click", function () {
        var saved = saveBtn.getAttribute("aria-pressed") === "true";
        saveBtn.disabled = true;
        CC.api("/api/me/favorites/" + s.slug, { method: saved ? "DELETE" : "POST" })
          .then(function (r) { setLabel(r.saved); })
          .catch(function (err) { saveBtn.textContent = err.message; })
          .finally(function () { saveBtn.disabled = false; });
      });
      actions.appendChild(saveBtn);
    }
    actions.appendChild(el("a", { class: "btn btn-ghost", href: s.source, target: "_blank", rel: "noopener", text: "Source on GitHub ↗" }));

    var prompt = "Make a 45-second film in the " + s.name + " style about ";
    var copyBtn = el("button", { class: "btn btn-ghost btn-sm", type: "button", text: "Copy" });
    var promptText = el("code", { text: prompt + "…" });
    copyBtn.addEventListener("click", function () {
      var done = function () { copyBtn.textContent = "Copied"; setTimeout(function () { copyBtn.textContent = "Copy"; }, 1600); };
      (navigator.clipboard ? navigator.clipboard.writeText(prompt) : Promise.reject()).then(done).catch(function () {
        var r = document.createRange(); r.selectNodeContents(promptText);
        var sel = getSelection(); sel.removeAllRanges(); sel.addRange(r);
      });
    });

    root.innerHTML = "";
    root.appendChild(el("section", { class: "style-hero" }, [
      player,
      el("div", { class: "style-hero-text" }, [
        el("span", { class: "eyebrow", text: "No. " + s.number + " · " + s.categoryLabel }),
        el("h1", { text: s.name }),
        s.nameCn ? el("p", { class: "muted cn", text: s.nameCn }) : null,
        el("p", { class: "lead", text: s.summary || s.line }),
        s.film ? el("p", { class: "muted", text: "Demo film: " + s.film + ". " + s.line }) : null,
        el("div", { class: "style-meta" }, (s.uses || []).map(function (u) { return el("span", { class: "tag", text: u }); })),
        actions
      ])
    ]));

    root.appendChild(el("section", { class: "style-try" }, [
      el("h2", { text: "Try it in Claude Code" }),
      el("div", { class: "prompt-line" }, [promptText, copyBtn])
    ]));

    var guide = el("section", { class: "style-guide", "aria-labelledby": "guide-title" }, [el("h2", { id: "guide-title", text: "Style guide" })]);
    if (data.locked) {
      guide.appendChild(el("div", { class: "locked" }, [
        el("p", { text: "The full guide covers materials, colour logic, type, camera, sound and the checks Claude runs on every frame. Create a free account to read it." }),
        el("div", { class: "locked-actions" }, [
          el("a", { class: "btn btn-primary btn-sm", href: "/signup?next=" + encodeURIComponent(location.pathname), text: "Create free account" }),
          el("a", { class: "btn btn-ghost btn-sm", href: "/login?next=" + encodeURIComponent(location.pathname), text: "Log in" })
        ])
      ]));
    } else if (data.guideHtml) {
      var body = el("div", { class: "prose" });
      body.innerHTML = data.guideHtml; // rendered server-side from the imported STYLE.md, raw HTML escaped
      guide.appendChild(body);
    }
    root.appendChild(guide);
  }

  CC.api("/api/styles/" + encodeURIComponent(slug)).then(render).catch(function (err) {
    root.innerHTML = "";
    root.appendChild(el("p", { class: "empty", text: err.status === 404 ? "There's no style at this address." : err.message }));
  });
})();
