import "./themeToggle.css";

const ThemeToggle = ({ theme, onToggle }) => {
  return (
    <button
      type="button"
      className={`theme-switch ${theme}`}
      onClick={onToggle}
      aria-label="Toggle theme"
      title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
    >
      <span className="switch-track">
        <span className="switch-thumb">{theme === "dark" ? "☾" : "☀"}</span>
      </span>
    </button>
  );
};

export default ThemeToggle;
