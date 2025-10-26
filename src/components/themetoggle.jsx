"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

const THEME_KEY = "theme";

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(null);

  // Initialize theme safely
  useEffect(() => {
    try {
      const saved = localStorage.getItem(THEME_KEY);
      const hasDarkClass = document.documentElement.classList.contains("dark");
      const systemPrefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;

      let nextIsDark;

      if (saved === "dark") nextIsDark = true;
      else if (saved === "light") nextIsDark = false;
      else if (hasDarkClass) nextIsDark = true;
      else nextIsDark = systemPrefersDark;

      setIsDark(nextIsDark);

      if (nextIsDark && !hasDarkClass) document.documentElement.classList.add("dark");
      if (!nextIsDark && hasDarkClass) document.documentElement.classList.remove("dark");
    } catch (err) {
      setIsDark(document.documentElement.classList.contains("dark"));
    }
  }, []);

  // Sync between tabs/pages
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === THEME_KEY) {
        const value = e.newValue;
        const shouldBeDark = value === "dark";
        setIsDark(shouldBeDark);
        document.documentElement.classList.toggle("dark", shouldBeDark);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const toggleTheme = () => {
    if (isDark === null) return;

    const nextIsDark = !isDark;
    setIsDark(nextIsDark);
    document.documentElement.classList.toggle("dark", nextIsDark);
    localStorage.setItem(THEME_KEY, nextIsDark ? "dark" : "light");
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-md bg-card-bg border border-card-border text-text-primary hover:opacity-80 transition-all duration-500 ease-in-out"
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      aria-label="Toggle theme"
    >
      <div className={`transform transition-transform duration-500 ease-in-out ${isDark ? "rotate-240" : "rotate-0"}`}>
        {isDark ? (
          <Moon className="text-blue-500 transition-colors duration-500" />
        ) : (
          <Sun className="text-yellow-500 transition-colors duration-500" />
        )}
      </div>
    </button>
  );
}
