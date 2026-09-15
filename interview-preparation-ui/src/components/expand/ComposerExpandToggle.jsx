import { Maximize2, Minimize2 } from "lucide-react";

const ComposerExpandToggle = ({ isExpanded, onToggle }) => {
  return (
    <button
      type="button"
      className="composer-expand-button"
      onClick={onToggle}
      aria-label={isExpanded ? "Collapse composer" : "Expand composer"}
      title={isExpanded ? "Collapse" : "Expand"}
    >
      {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
    </button>
  );
};

export default ComposerExpandToggle;
