import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";
import { displayName, useAuth } from "@/hooks/useAuth";
import { useSavedStyles } from "@/hooks/useSavedStyles";
import { getStyle } from "@/lib/styles";

export default function Account() {
  const { user, loading } = useAuth();
  const saved = useSavedStyles();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate("/login?next=/account", { replace: true });
  }, [loading, user, navigate]);

  if (!user) return null;

  const since = new Date(user.created_at).toLocaleDateString(undefined, { month: "long", year: "numeric" });
  const styles = saved.slugs.map(getStyle).filter((s) => !!s);

  return (
    <>
      <Nav />
      <main className="wrap page">
        <section className="account-head">
          <div>
            <span className="eyebrow">Your account</span>
            <h1>Hi, {displayName(user).split(" ")[0]}</h1>
            <p className="muted">{user.email} · member since {since}</p>
          </div>
          <button className="btn btn-ghost btn-sm" type="button" onClick={() => supabase?.auth.signOut().then(() => navigate("/"))}>Log out</button>
        </section>

        <section className="account-section">
          <h2>Saved styles</h2>
          <div className="saved-grid">
            {saved.loading ? <p className="empty">Loading saved styles…</p>
              : saved.error ? <p className="empty">{saved.error}</p>
              : styles.length ? styles.map((s) => (
                <Link className="saved-card" to={`/styles/${s!.slug}`} key={s!.slug}>
                  {s!.image && <img src={s!.image} alt="" loading="lazy" />}
                  <span className="saved-name">{s!.name}</span>
                  <span className="saved-cat">{s!.categoryLabel}</span>
                </Link>
              )) : (
                <div className="empty-state">
                  <p>You haven't saved any styles yet. Open a style and press Save style to keep it here.</p>
                  <Link className="btn btn-primary btn-sm" to="/#styles">Browse styles</Link>
                </div>
              )}
          </div>
        </section>

        <section className="account-section">
          <h2>Make your first film</h2>
          <p className="muted">Install the style library in Claude Code, then name a style and your story.</p>
          <pre className="code-block"><code>{"claude plugin marketplace add lemomo-ai/lemo-opuscar\nclaude plugin install lemo-opuscar@lemolab"}</code></pre>
        </section>
      </main>
      <Footer slim />
    </>
  );
}
