import type { Config } from "tailwindcss";

// Colours mirror the CSS variables in src/index.css so Tailwind classes and the hand-written CSS stay in step.
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  corePlugins: { preflight: false },
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        surface: "var(--surface)",
        line: "var(--line)",
        fg: "var(--fg)",
        muted: "var(--fg-muted)",
        primary: "var(--primary)",
        secondary: "var(--secondary)",
      },
      fontFamily: {
        display: ["Sora", "Segoe UI", "system-ui", "sans-serif"],
        body: ["DM Sans", "Segoe UI", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
} satisfies Config;
