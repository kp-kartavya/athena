import { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Menu } from "lucide-react";

import Sidebar from "../sidebar/Sidebar";
import Feedback from "../feedback/Feedback";
import { getChat, createChat, sendMessage } from "../../api/recentChats";
import "./chat.css";
import ThinkToggle from "../think/ThinkToggle";
import ComposerExpandToggle from "../expand/ComposerExpandToggle";
import { QUICK_QUESTIONS } from "../../utils/constants";
import remarkGfm from "remark-gfm";

const Chat = ({ theme, onToggleTheme, currentUser }) => {
  const [question, setQuestion] = useState("");
  const [activeChatId, setActiveChatId] = useState(null);
  const [activeChat, setActiveChat] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [thinkMode, setThinkMode] = useState(false);
  const [isComposerExpanded, setIsComposerExpanded] = useState(false);
  const [showExpandButton, setShowExpandButton] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [showAllQuestions, setShowAllQuestions] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const messages = useMemo(
    () => activeChat?.messages ?? [],
    [activeChat?.messages],
  );

  const totalQuickQuestions = Object.values(QUICK_QUESTIONS).flat().length;

  const visibleCategories = showAllQuestions
    ? Object.entries(QUICK_QUESTIONS)
    : Object.entries(QUICK_QUESTIONS).slice(0, 3);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, isLoading]);

  useEffect(() => {
    const textarea = textareaRef.current;

    if (!textarea) {
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
  }, [question]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 640) {
        setIsMobileSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleNewChat = () => {
    if (isLoading) {
      return;
    }

    setActiveChatId(null);
    setActiveChat(null);
    setQuestion("");
    setShowAllQuestions(false);
    setIsMobileSidebarOpen(false);
  };

  const handleSelectChat = async (chatId) => {
    if (isLoading) {
      return;
    }

    try {
      const chat = await getChat(chatId);

      setActiveChatId(chat.id);
      setActiveChat(chat);
      setQuestion("");
      setShowAllQuestions(false);
      setIsMobileSidebarOpen(false);
    } catch (error) {
      console.error("Failed to load chat:", error);
    }
  };

  const handleQuickQuestion = (selectedQuestion) => {
    if (isLoading) {
      return;
    }

    setQuestion(selectedQuestion);

    setTimeout(() => {
      textareaRef.current?.focus();
    }, 0);
  };

  const handleSend = async () => {
    const trimmedQuestion = question.trim();

    if (!trimmedQuestion || isLoading) {
      return;
    }

    setQuestion("");
    setIsLoading(true);

    try {
      let chatId = activeChatId;

      if (!chatId) {
        const newChat = await createChat(trimmedQuestion);

        chatId = newChat.id;

        setActiveChatId(chatId);
        setActiveChat(newChat);
      }

      const userMessage = {
        id: `temp-${Date.now()}`,
        role: "user",
        content: trimmedQuestion,
        timestamp: new Date().toISOString(),
      };

      setActiveChat((prev) => ({
        ...prev,
        messages: [...(prev?.messages ?? []), userMessage],
      }));

      const updatedChat = await sendMessage(chatId, trimmedQuestion, thinkMode);

      setActiveChat(updatedChat);
      setRefreshKey((prev) => prev + 1);
    } catch (error) {
      console.error("Error sending message:", error);

      const errorMessage = {
        id: `error-${Date.now()}`,
        role: "assistant",
        content: "Sorry, I couldn't get a response. Please try again.",
        timestamp: new Date().toISOString(),
      };

      setActiveChat((prev) => ({
        ...prev,
        messages: [...(prev?.messages ?? []), errorMessage],
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleFeedback = () => {
    if (isLoading) {
      return;
    }

    setIsMobileSidebarOpen(false);
    setShowFeedback(true);
  };

  return (
    <div className="app">
      {isMobileSidebarOpen && (
        <button
          type="button"
          className="sidebar-overlay"
          onClick={() => setIsMobileSidebarOpen(false)}
          aria-label="Close sidebar"
        />
      )}

      <Sidebar
        activeChatId={activeChatId}
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
        onFeedback={handleFeedback}
        disabled={isLoading}
        refreshKey={refreshKey}
        theme={theme}
        onToggleTheme={onToggleTheme}
        currentUser={currentUser}
        mobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
      />

      <main className="main">
        <button
          type="button"
          className="mobile-sidebar-toggle"
          onClick={() => setIsMobileSidebarOpen(true)}
          aria-label="Open sidebar"
          title="Open sidebar"
        >
          <Menu size={20} />
        </button>

        <div className="messages">
          {messages.length === 0 ? (
            <div className="welcome">
              <div className="welcome-header">
                <h2>How can I help you?</h2>

                <p>
                  {thinkMode
                    ? "Think Mode is enabled. Ask broader technical questions or get a deeper explanation."
                    : "Choose a question from your interview preparation set or ask it directly below."}
                </p>
              </div>

              {!thinkMode && (
                <div className="quick-questions">
                  <div className="quick-questions-header">
                    <div>
                      <h3>Quick Questions</h3>

                      <p>
                        Practice questions from your interview preparation set
                      </p>
                    </div>

                    <span className="question-count">
                      {totalQuickQuestions} questions
                    </span>
                  </div>

                  <div className="question-categories">
                    {visibleCategories.map(([category, questions]) => (
                      <div className="question-category" key={category}>
                        <h4>{category}</h4>

                        <div className="question-list">
                          {(showAllQuestions
                            ? questions
                            : questions.slice(0, 4)
                          ).map((item) => (
                            <button
                              type="button"
                              className="quick-question"
                              key={item}
                              onClick={() => handleQuickQuestion(item)}
                              disabled={isLoading}
                            >
                              <span>{item}</span>

                              <span className="question-arrow">→</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    className="explore-questions-button"
                    onClick={() => setShowAllQuestions((previous) => !previous)}
                  >
                    {showAllQuestions
                      ? "Show fewer questions ↑"
                      : "Explore more questions ↓"}
                  </button>

                  <div className="think-mode-info">
                    <span className="think-mode-icon">✦</span>

                    <div>
                      <strong>Need a deeper answer?</strong>

                      <p>
                        Turn on <b>Think Mode</b> to ask other technical
                        questions and explore topics in more detail.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {thinkMode && (
                <div className="think-mode-welcome">
                  <div className="think-mode-icon-large">✦</div>

                  <h3>Think Mode is ON</h3>

                  <p>
                    Ask broader technical questions, explore concepts outside
                    the quick-question set, or get a more detailed explanation.
                  </p>
                </div>
              )}
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`message ${message.role}-message`}
              >
                <div className="message-content">
                  {message.role === "assistant" ? (
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {message.content}
                    </ReactMarkdown>
                  ) : (
                    message.content
                  )}
                </div>
              </div>
            ))
          )}

          {isLoading && (
            <div className="message assistant-message">
              <div className="thinking">
                <span>Thinking</span>

                <span className="thinking-dots">
                  <span>.</span>
                  <span>.</span>
                  <span>.</span>
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="input-area">
          <div
            className={`input-wrapper ${isLoading ? "input-disabled" : ""} ${
              isComposerExpanded ? "composer-expanded" : ""
            }`}
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
              rows="1"
              disabled={isLoading}
              onChange={(event) => setQuestion(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey && !isLoading) {
                  event.preventDefault();
                  handleSend();
                }
              }}
            />

            <ThinkToggle
              enabled={thinkMode}
              onToggle={() => setThinkMode((previous) => !previous)}
              disabled={isLoading}
            />

            <button
              type="button"
              className="send-button"
              onClick={handleSend}
              disabled={isLoading || !question.trim()}
              aria-label="Send question"
              title="Send question"
            >
              ↑
            </button>
          </div>

          <div className="input-hint">
            {isLoading
              ? "Please wait for the response..."
              : "Enter to send · Shift + Enter for new line"}
          </div>
        </div>
      </main>

      {showFeedback && (
        <Feedback
          theme={theme}
          currentUser={currentUser}
          onClose={() => setShowFeedback(false)}
        />
      )}
    </div>
  );
};

export default Chat;
