import { Link } from "react-router-dom";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export default function NotFound() {
  return (
    <>
      <Nav />
      <main className="wrap page not-found">
        <span className="eyebrow">404</span>
        <h1>This page doesn't exist</h1>
        <p>The link may be old, or the style may have been renamed.</p>
        <Link className="btn btn-primary" to="/#styles">Browse styles</Link>
      </main>
      <Footer slim />
    </>
  );
}
