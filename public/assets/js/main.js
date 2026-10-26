// Home page: styles gallery (one box per style), filters, search, ticker, pricing toggle.
(function () {
  "use strict";

  var el = CC.el;
  var grid = document.getElementById("style-grid");
  var filters = document.getElementById("style-filters");
  var search = document.getElementById("style-search");
  var countLabel = document.getElementById("style-count");

  var state = { styles: [], categories: [], active: "all", query: "", saved: {} };

  // window.CLAUDECODES_DATA lets a static preview run without the server.
  function loadCatalog() {
    if (window.CLAUDECODES_DATA) return Promise.resolve(window.CLAUDECODES_DATA);
    return CC.api("/api/styles");
  }

  function matches(s) {
    if (state.active !== "all" && s.category !== state.active) return false;
    if (!state.query) return true;
    var hay = [s.name, s.nameCn, s.film, s.line, s.categoryLabel].concat(s.uses || []).join(" ").toLowerCase();
    return hay.indexOf(state.query) > -1;
  }

  function styleCard(s) {
    var preview = el("button", { class: "thumb", type: "button", "aria-label": "Watch the " + s.name + " demo film" }, [
      el("img", { src: s.image, alt: "", loading: "lazy", decoding: "async", width: "640", height: "360" }),
      el("span", { class: "fmt", text: "No. " + s.number }),
      s.duration ? el("span", { class: "dur", text: CC.formatDuration(s.duration) }) : null,
      el("span", { class: "play-sm", "aria-hidden": "true", text: "▶" })
    ]);
    preview.addEventListener("click", function () { CC.openPreview(s); });

    return el("article", { class: "style-card", id: "style-" + s.slug }, [
      preview,
      el("div", { class: "style-body" }, [
        el("span", { class: "style-cat", text: s.categoryLabel }),
        el("h3", {}, [el("a", { href: "/styles/" + s.slug, text: s.name })]),
        s.film ? el("p", { class: "style-film", text: "Demo: " + s.film }) : null,
        el("p", { text: s.line }),
        el("div", { class: "style-meta" }, (s.uses || []).slice(0, 3).map(function (u) { return el("span", { class: "tag", text: u }); }))
      ])
    ]);
  }

  function renderFilters() {
    filters.innerHTML = "";
    [{ id: "all", label: "All" }].concat(state.categories).forEach(function (cat) {
      var count = cat.id === "all" ? state.styles.length : state.styles.filter(function (s) { return s.category === cat.id; }).length;
      var b = el("button", { class: "filter", type: "button", "aria-pressed": String(cat.id === state.active), id: "filter-" + cat.id }, [
        cat.label, el("span", { class: "count", text: String(count) })
      ]);
      b.addEventListener("click", function () { state.active = cat.id; renderFilters(); renderGrid(); });
      filters.appendChild(b);
    });
  }

  function renderGrid() {
    var list = state.styles.filter(matches);
    grid.innerHTML = "";
    list.forEach(function (s) { grid.appendChild(styleCard(s)); });
    if (!list.length) {
      grid.appendChild(el("p", { class: "empty", text: "No styles match “" + state.query + "”. Try a mood, a medium or a topic, like “news” or “paper”." }));
    }
    if (countLabel) countLabel.textContent = list.length + " of " + state.styles.length + " styles";
  }

  function renderTicker() {
    var track = document.getElementById("ticker-track");
    if (!track) return;
    var names = state.styles.map(function (s) { return s.name; });
    track.innerHTML = "";
    names.concat(names).forEach(function (n) { track.appendChild(el("span", { text: n })); });
  }

  if (grid && filters) {
    loadCatalog().then(function (data) {
      state.styles = data.styles;
      state.categories = data.categories;
      document.querySelectorAll("[data-style-total]").forEach(function (n) { n.textContent = String(data.styles.length); });
      renderFilters();
      renderGrid();
      renderTicker();
      if (location.hash.indexOf("#style-") === 0) {
        var target = document.getElementById(location.hash.slice(1));
        if (target) target.scrollIntoView();
      }
    }).catch(function (err) {
      grid.innerHTML = "";
      grid.appendChild(el("p", { class: "empty", text: "The styles didn't load. " + err.message }));
    });
  }

  if (search) {
    search.addEventListener("input", function () {
      state.query = search.value.trim().toLowerCase();
      renderGrid();
    });
  }

  // ----- Pricing toggle -----
  var billingBtns = document.querySelectorAll("[data-billing]");
  billingBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var mode = btn.getAttribute("data-billing");
      billingBtns.forEach(function (b) { b.setAttribute("aria-pressed", String(b === btn)); });
      document.querySelectorAll("[data-monthly]").forEach(function (p) {
        var m = Number(p.getAttribute("data-monthly"));
        p.textContent = "$" + (mode === "yearly" ? Math.round((m * 10) / 12) : m);
      });
      document.querySelectorAll("[data-per]").forEach(function (p) {
        p.textContent = mode === "yearly" ? "/mo, billed yearly" : "/mo";
      });
    });
  });
})();
