import { Maximize2, Minimize2 } from "lucide-react";

const ComposerExpandToggle = ({
  expanded,
  onToggle,
}) => {
  return (
    <button
      type="button"
      className="composer-expand-button"
      onClick={onToggle}
      aria-label={
        expanded
          ? "Collapse composer"
          : "Expand composer"
      }
      title={
        expanded
          ? "Collapse"
          : "Expand"
      }
    >
      {expanded ? (
        <Minimize2 size={16} />
      ) : (
        <Maximize2 size={16} />
      )}
    </button>
  );
};

export default ComposerExpandToggle;