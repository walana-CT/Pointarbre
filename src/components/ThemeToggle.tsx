"use client";

import { useEffect, useState } from "react";

const THEMES = ["light", "dark", "accessible"] as const;

export default function ThemeToggle() {
  const [theme, setTheme] = useState<string>("light");

  useEffect(() => {
    const m = document.cookie.match(/(?:^|; )theme=([^;]+)/);
    const initial = m ? decodeURIComponent(m[1]) : "light";
    setTheme(initial);
    applyTheme(initial);
  }, []);

  useEffect(() => {
    applyTheme(theme);
    // persist
    try {
      document.cookie = `theme=${encodeURIComponent(theme)}; path=/; max-age=${60 * 60 * 24 * 365}`;
    } catch (e) {
      // ignore
    }
  }, [theme]);

  function applyTheme(t: string) {
    const html = document.documentElement;
    // remove existing theme- classes
    Array.from(html.classList)
      .filter((c) => c.startsWith("theme-"))
      .forEach((c) => html.classList.remove(c));
    html.classList.add(`theme-${t}`);
  }

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="theme-select" className="sr-only">
        Thème
      </label>
      <select
        id="theme-select"
        value={theme}
        onChange={(e) => setTheme(e.target.value)}
        className="rounded-md border border-gray-300 px-2 py-1 text-sm"
        aria-label="Choisir le thème"
      >
        {THEMES.map((t) => (
          <option key={t} value={t}>
            {t[0].toUpperCase() + t.slice(1)}
          </option>
        ))}
      </select>
    </div>
  );
}
