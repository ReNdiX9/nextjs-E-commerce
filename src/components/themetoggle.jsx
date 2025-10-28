"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme, systemTheme } = useTheme();

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <button
        className="p-2 rounded-md bg-card-bg border border-card-border text-text-primary"
        aria-label="Toggle theme"
      >
        <div className="w-6 h-6" />
      </button>
    );
  }

  const curr = theme === "system" ? systemTheme : theme;
  const isDark = curr === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="p-2 rounded-md bg-card-bg border border-card-border text-text-primary hover:opacity-70 transition-all duration-500 ease-in-out cursor-pointer"
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      aria-label="Toggle theme"
    >
      <div className={`transform transition-transform duration-500 ease-in-out ${isDark ? "rotate-240" : "rotate-0"}`}>
        {isDark ? (
          <Moon className="text-blue-500 transition-all duration-500" />
        ) : (
          <Sun className="text-yellow-500 transition-colors duration-500" />
        )}
      </div>
    </button>
  );
}
