import { Link } from "react-router-dom";
import { Brand } from "@/components/Nav";

const LIBRARY = "https://github.com/lemomo-ai/lemo-opuscar";

export function Credit() {
  return <span>Styles and demo films by <a href={LIBRARY} target="_blank" rel="noopener">LemoLab</a>, CC BY 4.0.</span>;
}

export default function Footer({ slim = false }: { slim?: boolean }) {
  if (slim) {
    return (
      <footer className="footer footer-slim">
        <div className="wrap legal"><span>© 2026 ClaudeCodes · Not affiliated with Anthropic.</span><Credit /></div>
      </footer>
    );
  }
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer-grid">
          <div>
            <Brand />
            <p className="tagline">Video styles for faceless channels, made end to end by Claude.</p>
          </div>
          <div><h4>Product</h4><ul><li><a href="/#styles">Styles</a></li><li><a href="/#featured">Featured</a></li><li><a href="/#pricing">Pricing</a></li></ul></div>
          <div><h4>Resources</h4><ul><li><a href="/#how">How it works</a></li><li><a href="/#faq">FAQ</a></li><li><a href={LIBRARY} target="_blank" rel="noopener">Style library</a></li></ul></div>
          <div><h4>Account</h4><ul><li><Link to="/login">Log in</Link></li><li><Link to="/signup">Sign up</Link></li><li><Link to="/account">Your account</Link></li></ul></div>
        </div>
        <div className="legal"><span>© 2026 ClaudeCodes · Not affiliated with Anthropic.</span><Credit /></div>
      </div>
    </footer>
  );
}
