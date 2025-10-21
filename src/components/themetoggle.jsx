// made the darkmode component manually but in order to implement it in the each file and component used AI  as we want to implement the colors should perfectly align with the theme

"use client";

import { Moon, Sun } from "lucide-react";
import { useState, useEffect } from "react";

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check if dark mode is already set
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    } else {
      setIsDark(false);
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);

    if (newTheme) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-md bg-card-bg border border-card-border text-text-primary hover:opacity-80 transition-all duration-500 ease-in-out"
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
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
