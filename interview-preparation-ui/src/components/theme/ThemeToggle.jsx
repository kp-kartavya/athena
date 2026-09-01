import { useEffect, useState } from "react";
import "./themeToggle.css";

const STORAGE_KEY = "interview-bot-theme";

const getSystemTheme = () => {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

const getInitialTheme = () => {
  const savedTheme = localStorage.getItem(STORAGE_KEY);

  if (savedTheme === "dark" || savedTheme === "light") {
    return savedTheme;
  }

  return getSystemTheme();
};

const ThemeToggle = () => {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    const mediaQuery = window.matchMedia(
      "(prefers-color-scheme: dark)"
    );

    const handleSystemThemeChange = (event) => {
      const savedTheme = localStorage.getItem(STORAGE_KEY);

      if (savedTheme) {
        return;
      }

      setTheme(event.matches ? "dark" : "light");
    };

    mediaQuery.addEventListener(
      "change",
      handleSystemThemeChange
    );

    return () => {
      mediaQuery.removeEventListener(
        "change",
        handleSystemThemeChange
      );
    };
  }, []);

  const toggleTheme = () => {
    const newTheme =
      theme === "dark" ? "light" : "dark";

    setTheme(newTheme);

    localStorage.setItem(
      STORAGE_KEY,
      newTheme
    );
  };

  return (
    <button
      type="button"
      className={`theme-switch ${theme}`}
      onClick={toggleTheme}
      aria-label="Toggle theme"
    >
      <span className="switch-track">
        <span className="switch-thumb">
          {theme === "dark" ? "☾" : "☀"}
        </span>
      </span>
    </button>
  );
};

export default ThemeToggle;