import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { Send } from "lucide-react";
import ThinkToggle from "../think/ThinkToggle";
import ComposerExpandToggle from "../../common/expand/ComposerExpandToggle";

const Composer = forwardRef(
  (
    {
      question,
      onQuestionChange,
      onSend,
      isLoading,
      thinkMode,
      onToggleThinkMode,
      variant = "chat",
      canSend = true,
    },
    ref,
  ) => {
    const textareaRef = useRef(null);

    const [isComposerExpanded, setIsComposerExpanded] = useState(false);
    const [showExpandButton, setShowExpandButton] = useState(false);

    const isGuest = variant === "guest";

    useImperativeHandle(ref, () => ({
      focus: () => {
        textareaRef.current?.focus();
      },
    }));

    useEffect(() => {
      const textarea = textareaRef.current;

      if (!textarea || isComposerExpanded) {
        return;
      }

      textarea.style.height = "auto";

      const lineHeight = parseInt(
        window.getComputedStyle(textarea).lineHeight,
        10,
      );

      const maxHeight = lineHeight * 3;

      textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`;

      setShowExpandButton(textarea.scrollHeight > maxHeight);
    }, [question, isComposerExpanded]);

    const handleKeyDown = (event) => {
      if (event.key === "Enter" && !event.shiftKey && !isLoading && canSend) {
        event.preventDefault();
        onSend();
      }
    };

    const inputAreaClass = isGuest ? "guest-input-area" : "input-area";
    const inputWrapperClass = isGuest ? "guest-input-wrapper" : "input-wrapper";
    const sendButtonClass = isGuest ? "guest-send-button" : "send-button";
    const inputHintClass = isGuest ? "guest-input-hint" : "input-hint";

    const inputDisabledClass = isLoading ? "input-disabled" : "";
    const expandedClass = isComposerExpanded ? "composer-expanded" : "";

    return (
      <div className={inputAreaClass}>
        <div
          className={`${inputWrapperClass} ${inputDisabledClass} ${expandedClass}`}
        >
          {showExpandButton && (
            <ComposerExpandToggle
              isExpanded={isComposerExpanded}
              onToggle={() => setIsComposerExpanded((previous) => !previous)}
            />
          )}

          <textarea
            ref={textareaRef}
            placeholder={
              isLoading
                ? "Waiting for response..."
                : "Ask an interview question..."
            }
            value={question}
            rows={1}
            disabled={isLoading}
            onChange={(event) => onQuestionChange(event.target.value)}
            onKeyDown={handleKeyDown}
          />

          <ThinkToggle
            enabled={thinkMode}
            onToggle={onToggleThinkMode}
            disabled={isLoading}
          />

          <button
            type="button"
            className={sendButtonClass}
            onClick={onSend}
            disabled={isLoading || !question.trim() || !canSend}
            aria-label="Send question"
            title="Send question"
          >
            {isGuest ? <Send size={17} /> : "↑"}
          </button>
        </div>

        <div className={inputHintClass}>
          {isGuest
            ? "Enter to send · Shift + Enter for new line · Guest chats are saved on this browser"
            : isLoading
              ? "Please wait for the response..."
              : "Enter to send · Shift + Enter for new line"}
        </div>
      </div>
    );
  },
);

Composer.displayName = "Composer";

export default Composer;
