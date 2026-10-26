import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { displayName, useAuth } from "@/hooks/useAuth";

const LINKS = [
  { href: "/#styles", label: "Styles" },
  { href: "/#featured", label: "Featured" },
  { href: "/#how", label: "How it works" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/#faq", label: "FAQ" },
];

export function Brand() {
  return (
    <Link className="brand" to="/">
      <span className="brand-mark">&lt;/&gt;</span>ClaudeCodes
    </Link>
  );
}

export default function Nav() {
  const { user, loading } = useAuth();
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const next = encodeURIComponent(location.pathname + location.hash);

  return (
    <header className={"nav" + (open ? " open" : "")}>
      <div className="wrap nav-inner">
        <Brand />
        <ul className="nav-links" id="nav-links">
          {LINKS.map((l) => (
            <li key={l.href}><a href={l.href} onClick={() => setOpen(false)}>{l.label}</a></li>
          ))}
        </ul>
        <div className="nav-actions">
          <span className="auth-slot">
            {loading ? null : user ? (
              <Link className="account-chip" to="/account" title={user.email ?? ""}>
                <span className="avatar" aria-hidden="true">{displayName(user).charAt(0).toUpperCase()}</span>
                <span className="account-name">{displayName(user).split(" ")[0]}</span>
              </Link>
            ) : (
              <>
                <Link className="login" to={`/login?next=${next}`}>Log in</Link>
                <Link className="btn btn-primary btn-sm" to={`/signup?next=${next}`}>Get started</Link>
              </>
            )}
          </span>
          <button className="nav-toggle" type="button" aria-label="Open menu" aria-expanded={open} aria-controls="nav-links" onClick={() => setOpen(!open)}>☰</button>
        </div>
      </div>
    </header>
  );
}
