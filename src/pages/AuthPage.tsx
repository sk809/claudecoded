import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Brand } from "@/components/Nav";
import Footer from "@/components/Footer";
import SetupNotice from "@/components/SetupNotice";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Only same-site paths are allowed as a post-login destination.
function safeNext(raw: string | null) {
  return raw && raw.startsWith("/") && !raw.startsWith("//") && !raw.startsWith("/\\") ? raw : "/account";
}

export default function AuthPage({ mode }: { mode: "login" | "signup" }) {
  const signup = mode === "signup";
  const [params] = useSearchParams();
  const next = safeNext(params.get("next"));
  const navigate = useNavigate();
  const { user, configured } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<{ message: string; field?: string } | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (user) navigate(next, { replace: true }); }, [user, next, navigate]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (signup && !name.trim()) return setError({ message: "Enter your name.", field: "name" });
    if (!EMAIL_RE.test(email.trim())) return setError({ message: "Enter a valid email address.", field: "email" });
    if (signup && password.length < 8) return setError({ message: "Use at least 8 characters for your password.", field: "password" });
    if (!password) return setError({ message: "Enter your password.", field: "password" });
    if (!supabase) return;

    setBusy(true);
    if (signup) {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { data: { name: name.trim() }, emailRedirectTo: `${window.location.origin}${next}` },
      });
      if (error) setError({ message: error.message });
      else if (!data.session) setNotice(`We sent a confirmation link to ${email.trim()}. Open it to finish creating your account.`);
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) setError({ message: error.message === "Invalid login credentials" ? "That email and password don't match an account." : error.message });
    }
    setBusy(false);
  }

  const switchLink = (to: string) => (params.get("next") ? `${to}?next=${encodeURIComponent(params.get("next")!)}` : to);
  const invalid = (f: string) => (error?.field === f ? true : undefined);

  return (
    <div className="auth-page">
      <main className="auth-wrap">
        <Brand />
        <section className="auth-card" aria-labelledby="auth-title">
          <h1 id="auth-title">{signup ? "Create your account" : "Welcome back"}</h1>
          <p className="auth-sub">
            {signup ? "Browse every style free. Your account unlocks the full style guides and lets you save styles." : "Log in to open style guides and your saved styles."}
          </p>
          {!configured && <SetupNotice />}
          {notice ? (
            <p className="auth-sub" role="status">{notice}</p>
          ) : (
            <form id="auth-form" onSubmit={submit} noValidate>
              {signup && (
                <div className="field"><label htmlFor="name">Name</label>
                  <input id="name" type="text" autoComplete="name" maxLength={80} value={name} onChange={(e) => setName(e.target.value)} aria-invalid={invalid("name")} /></div>
              )}
              <div className="field"><label htmlFor="email">Email</label>
                <input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={invalid("email")} /></div>
              <div className="field"><label htmlFor="password">Password</label>
                <input id="password" type="password" autoComplete={signup ? "new-password" : "current-password"} value={password} onChange={(e) => setPassword(e.target.value)} aria-invalid={invalid("password")} />
                {signup && <span className="hint">At least 8 characters.</span>}</div>
              {error && <p className="form-error" role="alert">{error.message}</p>}
              <button className="btn btn-primary" type="submit" disabled={busy || !configured}>
                {busy ? (signup ? "Creating account…" : "Logging in…") : signup ? "Create account" : "Log in"}
              </button>
            </form>
          )}
          <p className="auth-switch">
            {signup ? <>Already have an account? <Link to={switchLink("/login")}>Log in</Link></> : <>New to ClaudeCodes? <Link to={switchLink("/signup")}>Create an account</Link></>}
          </p>
        </section>
      </main>
      <Footer slim />
    </div>
  );
}
