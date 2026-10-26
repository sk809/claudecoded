import catalog from "@/data/styles.json";

export type Style = {
  slug: string;
  number: string | null;
  name: string;
  nameCn: string | null;
  category: string;
  categoryLabel: string;
  film: string | null;
  line: string;
  summary: string;
  uses: string[];
  duration: number | null;
  image: string | null;
  video: string;
  source: string;
  status: string;
};

export type Category = { id: string; label: string };

export const STYLES = catalog.styles as Style[];
export const CATEGORIES = catalog.categories as Category[];
export const STYLE_SOURCE = catalog.source;
export const getStyle = (slug: string) => STYLES.find((s) => s.slug === slug);

// Style guides (STYLE.md from lemo-opuscar), loaded on demand.
const guides = import.meta.glob("../data/guides/*.md", { query: "?raw", import: "default" }) as Record<string, () => Promise<string>>;
export const loadGuide = (slug: string) => guides[`../data/guides/${slug}.md`]?.() ?? Promise.resolve(null);

export const formatDuration = (sec: number | null) => {
  if (!sec) return "";
  const s = Math.round(sec);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};
