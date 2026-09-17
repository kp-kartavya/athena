import { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import ThinkingIndicator from "../think/ThinkingIndicator";

const AUTO_SCROLL_THRESHOLD = 80;

const getDistanceFromBottom = (container) =>
  container.scrollHeight - container.scrollTop - container.clientHeight;

const scrollToBottom = (container) => {
  container.scrollTop = container.scrollHeight;
};

const isThinkingMessage = (message, isLoading) =>
  isLoading && message.role === "assistant" && !message.content?.trim();

const ChatMessages = ({
  messages,
  containerClassName,
  messageClassName,
  messageContentClassName,
  scrollRequestKey,
  isLoading,
}) => {
  const containerRef = useRef(null);
  const shouldAutoScrollRef = useRef(true);

  const handleScroll = () => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    shouldAutoScrollRef.current =
      getDistanceFromBottom(container) <= AUTO_SCROLL_THRESHOLD;
  };

  useEffect(() => {
    const container = containerRef.current;

    if (!container || !shouldAutoScrollRef.current) {
      return;
    }

    scrollToBottom(container);
  }, [messages]);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    shouldAutoScrollRef.current = true;
    scrollToBottom(container);
  }, [scrollRequestKey]);

  return (
    <div
      ref={containerRef}
      className={containerClassName}
      onScroll={handleScroll}
    >
      {messages.map((message) => {
        const isThinking = isThinkingMessage(message, isLoading);

        return (
          <div
            key={message.id}
            className={`${messageClassName} ${message.role}-message`}
          >
            <div className={messageContentClassName}>
              {isThinking ? (
                <ThinkingIndicator />
              ) : message.role === "assistant" ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {message.content}
                </ReactMarkdown>
              ) : (
                message.content
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ChatMessages;
