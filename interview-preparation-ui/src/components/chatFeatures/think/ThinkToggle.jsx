import { Brain } from "lucide-react";
import "./thinkToggle.css";

const ThinkToggle = ({ enabled, onToggle, disabled }) => {
  return (
    <button
      type="button"
      className={`think-button ${enabled ? "active" : ""}`}
      onClick={onToggle}
      disabled={disabled}
      aria-pressed={enabled}
      title={enabled ? "Disable Think mode" : "Enable Think mode"}
    >
      <Brain size={17} />
      <span>Think</span>
    </button>
  );
};

export default ThinkToggle;
