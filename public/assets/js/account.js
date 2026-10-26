// Account page: profile, saved styles, log out. Signed-out visitors go to log in.
(function () {
  "use strict";

  var el = CC.el;
  var root = document.getElementById("account-root");

  function savedCard(s) {
    return el("a", { class: "saved-card", href: "/styles/" + s.slug }, [
      el("img", { src: s.image, alt: "", loading: "lazy" }),
      el("span", { class: "saved-name", text: s.name }),
      el("span", { class: "saved-cat", text: s.categoryLabel })
    ]);
  }

  CC.me().then(function (user) {
    if (!user) { location.replace("/login?next=/account"); return; }

    var since = new Date(user.createdAt.replace(" ", "T") + "Z");
    var logout = el("button", { class: "btn btn-ghost btn-sm", type: "button", text: "Log out" });
    logout.addEventListener("click", function () { logout.disabled = true; CC.logout(); });

    var savedGrid = el("div", { class: "saved-grid" }, [el("p", { class: "empty", text: "Loading saved styles…" })]);

    root.innerHTML = "";
    root.appendChild(el("section", { class: "account-head" }, [
      el("div", {}, [
        el("span", { class: "eyebrow", text: "Your account" }),
        el("h1", { text: "Hi, " + user.name.split(" ")[0] }),
        el("p", { class: "muted", text: user.email + " · member since " + since.toLocaleDateString(undefined, { month: "long", year: "numeric" }) })
      ]),
      logout
    ]));
    root.appendChild(el("section", { class: "account-section" }, [
      el("h2", { text: "Saved styles" }),
      savedGrid
    ]));
    root.appendChild(el("section", { class: "account-section" }, [
      el("h2", { text: "Make your first film" }),
      el("p", { class: "muted", text: "Install the style library in Claude Code, then name a style and your story." }),
      el("pre", { class: "code-block" }, [el("code", { text: "claude plugin marketplace add lemomo-ai/lemo-opuscar\nclaude plugin install lemo-opuscar@lemolab" })])
    ]));

    CC.api("/api/me/favorites").then(function (d) {
      savedGrid.innerHTML = "";
      if (!d.styles.length) {
        savedGrid.appendChild(el("div", { class: "empty-state" }, [
          el("p", { text: "You haven't saved any styles yet. Open a style and press Save style to keep it here." }),
          el("a", { class: "btn btn-primary btn-sm", href: "/#styles", text: "Browse styles" })
        ]));
        return;
      }
      d.styles.forEach(function (s) { savedGrid.appendChild(savedCard(s)); });
    }).catch(function (err) {
      savedGrid.innerHTML = "";
      savedGrid.appendChild(el("p", { class: "empty", text: err.message }));
    });
  });
})();
