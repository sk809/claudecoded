import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import StyleCard from "@/components/StyleCard";
import PreviewDialog from "@/components/PreviewDialog";
import { CATEGORIES, STYLES, getStyle, type Style } from "@/lib/styles";

const TOTAL = STYLES.length;

const FEATURED = [
  { slug: "watercolor", title: "Follow the Rain", dur: "1:54", note: "Watercolor Brush · from the red desert to the green coast in one painted walk" },
  { slug: "visual-investigation", title: "The Hindenburg: Four Minutes, 32 Seconds", dur: "1:00", note: "Visual Investigation · five sources on one clock" },
  { slug: "ukiyoe", title: "Toward the Mountain", dur: "0:44", note: "Ukiyo-e · a woodblock journey" },
];

const FAQ = [
  ["Is this AI video generation?", "No. Claude writes code that draws every frame on a canvas or in WebGL, composes the music from free sample libraries and narrates with text-to-speech. There is no video model and no stock footage."],
  ["What do I need to get started?", "A computer running Mac, Windows or Linux, and Claude Code with a Claude Pro or Max plan. Install the style library with the two commands in How it works."],
  ["Can I make a style my own?", "Yes. Ask Claude to change any library style, for example your own version of Ukiyo-e with your brand colours and characters, or start from a blank page. Your style is saved and reused for later films."],
  ["Can I use my own script, voice or music?", "Yes. Claude asks up front whether you have your own voice, music or other material, and builds the film around it."],
  ["Who owns the films I make?", "You do. Films you make with the library are yours with no credit needed. The demo films shown here are by LemoLab under CC BY 4.0."],
  ["How does billing work?", "Pay monthly or yearly. You can switch plans or cancel at any time from your account page."],
];

const PLANS = [
  { name: "Creator", for: "For your first channel", price: 49, featured: false, items: [`All ${TOTAL} styles and their guides`, "Local rendering, no credits", "Make 3 styles your own", "Community Discord"] },
  { name: "Pro", for: "For running several channels", price: 79, featured: true, items: ["Everything in Creator", "Make 15 styles your own", "3 films rendering at once", "Early access to new styles"] },
  { name: "Max", for: "For serious channel operators", price: 119, featured: false, items: ["Everything in Pro", "Unlimited custom styles", "Priority help", "Custom style requests"] },
];

export default function Home() {
  const [active, setActive] = useState("all");
  const [query, setQuery] = useState("");
  const [preview, setPreview] = useState<Style | null>(null);
  const [yearly, setYearly] = useState(false);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return STYLES.filter((s) => {
      if (active !== "all" && s.category !== active) return false;
      if (!q) return true;
      return [s.name, s.nameCn, s.film, s.line, s.categoryLabel, ...s.uses].join(" ").toLowerCase().includes(q);
    });
  }, [active, query]);

  useEffect(() => {
    if (location.hash) document.getElementById(location.hash.slice(1))?.scrollIntoView();
  }, []);

  const tickerNames = STYLES.map((s) => s.name);

  return (
    <>
      <div className="announce"><div className="wrap">Every film below was written, drawn, scored and cut in code by <strong>Claude</strong>. No stock footage.</div></div>
      <Nav />
      <main id="top">
        <section className="hero">
          <div className="wrap">
            <span className="pill"><span className="dot" />Runs on your own Claude account</span>
            <h1>Whole videos, <span className="gradient-text">written and cut by Claude</span></h1>
            <p className="lede">Type a topic. Claude researches it, writes the script, voices it, draws every frame, scores the music and mixes the film, in any of {TOTAL} styles: watercolor, ukiyo-e, newsreel, LiDAR survey, pixel RPG, brick toy and more.</p>
            <div className="hero-ctas">
              <Link className="btn btn-primary" to="/signup">Start making videos</Link>
              <a className="btn btn-ghost" href="#styles">See every style</a>
            </div>
            <div className="trust"><span>Canvas and WebGL, rendered frame by frame</span><span>Original music and narration</span><span>Mac, Windows and Linux</span></div>
            <div className="prompt-demo" aria-label="Example request">
              <div className="row"><span className="k">you</span><span className="v">Make a 45-second film in the watercolor style about the coffee farm my family runs. Warm female narrator.</span></div>
              <div className="row"><span className="k">claude</span><span className="v">Script and storyboard <span className="ok">done</span> · Narration 0:44 <span className="ok">done</span> · Score <span className="ok">done</span></span></div>
              <div className="row"><span className="k">claude</span><span className="v">Rendering 1,320 frames · films/coffee-farm/final.mp4</span></div>
            </div>
          </div>
          <div className="ticker" aria-hidden="true">
            <div className="ticker-track">{[...tickerNames, ...tickerNames].map((n, i) => <span key={i}>{n}</span>)}</div>
          </div>
        </section>

        <section className="band" id="styles">
          <div className="wrap">
            <div className="section-head">
              <span className="eyebrow">Styles</span>
              <h2>One Claude. {TOTAL} looks.</h2>
              <p>Every box is a complete style with its own demo film. Press a still to watch the film, or open the style to read how Claude builds it.</p>
            </div>
            <div className="gallery-tools">
              <label className="search" htmlFor="style-search">
                <span className="visually-hidden">Search styles</span>
                <input id="style-search" type="search" placeholder="Search styles, e.g. news, paper, anime" autoComplete="off" value={query} onChange={(e) => setQuery(e.target.value)} />
              </label>
              <span className="result-count" aria-live="polite">{visible.length} of {TOTAL} styles</span>
            </div>
            <div className="filters" role="toolbar" aria-label="Filter styles by category">
              {[{ id: "all", label: "All" }, ...CATEGORIES].map((c) => (
                <button key={c.id} id={`filter-${c.id}`} className="filter" type="button" aria-pressed={active === c.id} onClick={() => setActive(c.id)}>
                  {c.label}<span className="count">{c.id === "all" ? TOTAL : STYLES.filter((s) => s.category === c.id).length}</span>
                </button>
              ))}
            </div>
            <div className="style-grid">
              {visible.map((s) => <StyleCard key={s.slug} style={s} onPreview={setPreview} />)}
              {!visible.length && <p className="empty">No styles match “{query}”. Try a mood, a medium or a topic, like “news” or “paper”.</p>}
            </div>
            <p className="gallery-note">Styles and demo films by <a href="https://github.com/lemomo-ai/lemo-opuscar" target="_blank" rel="noopener">LemoLab / lemo-opuscar</a>, CC BY 4.0. Stills resized for this gallery.</p>
          </div>
        </section>

        <section className="band" id="featured">
          <div className="wrap">
            <div className="section-head">
              <span className="eyebrow">Featured</span>
              <h2>Watch whole films, with sound</h2>
              <p>Each began as one request typed into Claude Code.</p>
            </div>
            <div className="showcase">
              {FEATURED.map((f) => (
                <article className="video" key={f.slug}>
                  <Link className="screen" to={`/styles/${f.slug}`}>
                    <img src={getStyle(f.slug)?.image ?? undefined} alt={`${f.title} still`} />
                    <span className="play" aria-hidden="true">▶</span><span className="dur">{f.dur}</span>
                  </Link>
                  <div className="info"><h3>{f.title}</h3><p>{f.note}</p></div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="band" id="how">
          <div className="wrap">
            <div className="section-head">
              <span className="eyebrow">How it works</span>
              <h2>Three steps. One finished film.</h2>
            </div>
            <ol className="how">
              <li><span className="n">Step 1</span><h3>Install the styles</h3><p>In your terminal, add the style library to Claude Code:</p><code>claude plugin marketplace add lemomo-ai/lemo-opuscar</code><code>claude plugin install lemo-opuscar@lemolab</code></li>
              <li><span className="n">Step 2</span><h3>Pick a style</h3><p>Choose one of the {TOTAL} styles here, or change one into your own with your brand colours, characters and tone.</p></li>
              <li><span className="n">Step 3</span><h3>Say what you want</h3><p>Name the style and the story. Claude directs, draws, scores and mixes it, and can stop once to show you a storyboard first.</p></li>
            </ol>
            <p className="how-note">Rendering runs on your machine with your own Claude account, so there are no per-video credits.</p>
          </div>
        </section>

        <section className="band" id="pricing">
          <div className="wrap">
            <div className="section-head">
              <span className="eyebrow">Pricing</span>
              <h2>Every plan includes every style</h2>
              <p>Switch or cancel anytime.</p>
            </div>
            <div className="billing" role="group" aria-label="Billing period">
              <button type="button" aria-pressed={!yearly} onClick={() => setYearly(false)}>Monthly</button>
              <button type="button" aria-pressed={yearly} onClick={() => setYearly(true)}>Yearly <span className="save">2 months free</span></button>
            </div>
            <div className="plans">
              {PLANS.map((p) => (
                <article className={"plan" + (p.featured ? " featured" : "")} key={p.name}>
                  <div className="top"><h3>{p.name}</h3>{p.featured && <span className="badge">Most popular</span>}</div>
                  <p className="for">{p.for}</p>
                  <div className="price"><span className="amt">${yearly ? Math.round((p.price * 10) / 12) : p.price}</span><span className="per">{yearly ? "/mo, billed yearly" : "/mo"}</span></div>
                  <ul>{p.items.map((i) => <li key={i}>{i}</li>)}</ul>
                  <Link className={"btn " + (p.featured ? "btn-primary" : "btn-ghost")} to="/signup">Get started</Link>
                </article>
              ))}
            </div>
            <p className="price-note">You also need a Claude Pro or Max plan for Claude Code. Narration uses Kokoro by default, which runs free on your machine.</p>
          </div>
        </section>

        <section className="band" id="faq">
          <div className="wrap">
            <div className="section-head"><span className="eyebrow">FAQ</span><h2>Frequently asked</h2></div>
            <div className="faq">
              {FAQ.map(([q, a]) => <details key={q}><summary>{q}</summary><p>{a}</p></details>)}
            </div>
          </div>
        </section>

        <section className="band closing">
          <div className="wrap">
            <h2>Your channel, in any of these styles</h2>
            <Link className="btn btn-primary" to="/signup">Create your account</Link>
            <p>Free to browse · every style included on every plan</p>
            <div className="mosaic" aria-hidden="true">
              {["pixel-rpg", "stained-glass", "brick-toy", "ink-wash", "lidar-survey", "cel-anime-80s"].map((s) => <img key={s} src={getStyle(s)?.image ?? undefined} alt="" loading="lazy" />)}
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <PreviewDialog style={preview} onClose={() => setPreview(null)} />
    </>
  );
}
