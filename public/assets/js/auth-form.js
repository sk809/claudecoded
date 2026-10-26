// Log in and sign up forms.
(function () {
  "use strict";

  var form = document.getElementById("auth-form");
  var errorBox = document.getElementById("form-error");
  var submit = document.getElementById("submit");
  var mode = form.getAttribute("data-mode");

  // Only same-site paths are allowed as a post-login destination.
  function nextUrl() {
    var next = new URLSearchParams(location.search).get("next") || "/account";
    return next.charAt(0) === "/" && next.charAt(1) !== "/" && next.charAt(1) !== "\\" ? next : "/account";
  }

  document.querySelectorAll("[data-keep-next]").forEach(function (a) {
    var next = new URLSearchParams(location.search).get("next");
    if (next) a.href = a.getAttribute("href") + "?next=" + encodeURIComponent(next);
  });

  // Already signed in: skip the form.
  CC.me().then(function (user) { if (user) location.replace(nextUrl()); });

  function showError(message, field) {
    errorBox.textContent = message;
    errorBox.hidden = false;
    form.querySelectorAll("[aria-invalid]").forEach(function (i) { i.removeAttribute("aria-invalid"); });
    var input = field && document.getElementById(field);
    if (input) { input.setAttribute("aria-invalid", "true"); input.focus(); }
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    errorBox.hidden = true;
    var body = {};
    new FormData(form).forEach(function (v, k) { body[k] = v; });

    if (mode === "signup" && !String(body.name || "").trim()) return showError("Enter your name.", "name");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(body.email || "").trim())) return showError("Enter a valid email address.", "email");
    if (mode === "signup" && String(body.password || "").length < 8) return showError("Use at least 8 characters for your password.", "password");
    if (!body.password) return showError("Enter your password.", "password");

    submit.disabled = true;
    submit.textContent = mode === "signup" ? "Creating account…" : "Logging in…";
    CC.api("/api/auth/" + mode, { method: "POST", body: body })
      .then(function () { location.href = nextUrl(); })
      .catch(function (err) {
        showError(err.message, err.field);
        submit.disabled = false;
        submit.textContent = mode === "signup" ? "Create account" : "Log in";
      });
  });
})();
