import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { marked } from "marked";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import PreviewDialog from "@/components/PreviewDialog";
import NotFound from "@/pages/NotFound";
import { formatDuration, getStyle, loadGuide } from "@/lib/styles";
import { useAuth } from "@/hooks/useAuth";
import { useSavedStyles } from "@/hooks/useSavedStyles";

// Guides come from a third-party repo: render Markdown, but show any raw HTML as text.
const escapeHtml = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
marked.use({ renderer: { html: (html: string) => escapeHtml(html) } });

export default function StylePage() {
  const { slug = "" } = useParams();
  const style = getStyle(slug);
  const { user, loading } = useAuth();
  const saved = useSavedStyles();
  const [guide, setGuide] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (style) document.title = `${style.name} · ClaudeCodes`;
    window.scrollTo(0, 0);
  }, [style]);

  useEffect(() => {
    setGuide(null);
    if (user && style) loadGuide(style.slug).then((md) => setGuide(md ? (marked.parse(md) as string) : null));
  }, [user, style]);

  if (!style) return <NotFound />;

  const here = encodeURIComponent(`/styles/${style.slug}`);
  const prompt = `Make a 45-second film in the ${style.name} style about `;
  const isSaved = saved.isSaved(style.slug);

  return (
    <>
      <Nav />
      <main className="wrap page">
        <Link className="back-link" to="/#styles">← All styles</Link>
        <section className="style-hero">
          <button className="style-hero-media" type="button" aria-label={`Watch the ${style.name} demo film`} onClick={() => setPlaying(true)}>
            {style.image && <img src={style.image} alt={`${style.name} still from ${style.film ?? "the demo film"}`} />}
            <span className="play" aria-hidden="true">▶</span>
            {style.duration ? <span className="dur">{formatDuration(style.duration)}</span> : null}
          </button>
          <div className="style-hero-text">
            <span className="eyebrow">No. {style.number} · {style.categoryLabel}</span>
            <h1>{style.name}</h1>
            {style.nameCn && <p className="muted cn">{style.nameCn}</p>}
            <p className="lead">{style.summary || style.line}</p>
            {style.film && <p className="muted">Demo film: {style.film}. {style.line}</p>}
            <div className="style-meta">{style.uses.map((u) => <span className="tag" key={u}>{u}</span>)}</div>
            <div className="style-actions">
              {loading ? null : user ? (
                <button className="btn btn-ghost" type="button" aria-pressed={isSaved} onClick={() => saved.toggle(style.slug).then(() => setSaveError(null)).catch((e: Error) => setSaveError(e.message))}>
                  {isSaved ? "✓ Saved" : "Save style"}
                </button>
              ) : (
                <Link className="btn btn-primary" to={`/login?next=${here}`}>Log in to use this style</Link>
              )}
              <a className="btn btn-ghost" href={style.source} target="_blank" rel="noopener">Source on GitHub ↗</a>
            </div>
            {saveError && <p className="form-error" role="alert">{saveError}</p>}
          </div>
        </section>

        <section className="style-try">
          <h2>Try it in Claude Code</h2>
          <div className="prompt-line">
            <code>{prompt}…</code>
            <button className="btn btn-ghost btn-sm" type="button" onClick={() => navigator.clipboard?.writeText(prompt).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1600); }).catch(() => {})}>
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        </section>

        <section className="style-guide" aria-labelledby="guide-title">
          <h2 id="guide-title">Style guide</h2>
          {!user && !loading ? (
            <div className="locked">
              <p>The full guide covers materials, colour logic, type, camera, sound and the checks Claude runs on every frame. Create a free account to read it.</p>
              <div className="locked-actions">
                <Link className="btn btn-primary btn-sm" to={`/signup?next=${here}`}>Create free account</Link>
                <Link className="btn btn-ghost btn-sm" to={`/login?next=${here}`}>Log in</Link>
              </div>
            </div>
          ) : guide ? (
            <div className="prose" dangerouslySetInnerHTML={{ __html: guide }} />
          ) : (
            <p className="empty">Loading the guide…</p>
          )}
        </section>
      </main>
      <Footer slim />
      <PreviewDialog style={playing ? style : null} onClose={() => setPlaying(false)} />
    </>
  );
}
