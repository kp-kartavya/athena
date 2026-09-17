import "./themeToggle.css";

const ThemeToggle = ({ theme, onToggle }) => {
  const handleToggle = (event) => {
    event.preventDefault();
    event.stopPropagation();

    onToggle?.();
  };

  return (
    <button
      type="button"
      className={`theme-switch ${theme}`}
      onClick={handleToggle}
      aria-label={
        theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
      }
      title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
    >
      <span className="switch-track">
        <span className="switch-thumb">{theme === "dark" ? "☾" : "☀"}</span>
      </span>
    </button>
  );
};

export default ThemeToggle;
