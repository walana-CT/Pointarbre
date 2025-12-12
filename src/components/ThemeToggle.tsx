"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<string>("light");

  useEffect(() => {
    const m = document.cookie.match(/(?:^|; )theme=([^;]+)/);
    const initial = m ? decodeURIComponent(m[1]) : "light";
    setTheme(initial);
    applyTheme(initial);
  }, []);

  function applyTheme(t: string) {
    const html = document.documentElement;
    Array.from(html.classList)
      .filter((c) => c.startsWith("theme-"))
      .forEach((c) => html.classList.remove(c));
    html.classList.add(`theme-${t}`);
  }

  function toggleTheme() {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    applyTheme(newTheme);
    document.cookie = `theme=${encodeURIComponent(newTheme)}; path=/; max-age=${
      60 * 60 * 24 * 365
    }`;
  }

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg transition-colors hover:bg-[var(--color-surface)]"
      aria-label={`Passer au thème ${theme === "light" ? "sombre" : "clair"}`}
      title={`Thème ${theme === "light" ? "sombre" : "clair"}`}
    >
      {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
    </button>
  );
}
