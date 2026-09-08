import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Menu, Send, X } from "lucide-react";
import { useSearchParams } from "react-router-dom";

import "./guestChat.css";
import "./authModal.css";

import ThemeToggle from "../theme/ThemeToggle";
import ThinkToggle from "../think/ThinkToggle";
import ComposerExpandToggle from "../expand/ComposerExpandToggle";
import Sidebar from "../sidebar/Sidebar";
import Login from "../login/Login";
import Signup from "../signup/Signup";

import { getCsrfHeaders } from "../../api/csrf";
import { QUICK_QUESTIONS } from "../../utils/constants";
import remarkGfm from "remark-gfm";

function GuestChat({ theme, onToggleTheme, onVerificationRequired }) {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [thinkMode, setThinkMode] = useState(false);
  const [isComposerExpanded, setIsComposerExpanded] = useState(false);
  const [showExpandButton, setShowExpandButton] = useState(false);
  const [error, setError] = useState("");
  const [showAllQuestions, setShowAllQuestions] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [searchParams, setSearchParams] = useSearchParams();

  const textareaRef = useRef(null);
  const messagesEndRef = useRef(null);

  const authModal = searchParams.get("auth");

  const isLoginModal = authModal === "login";
  const isSignupModal = authModal === "signup";

  /*
   * =========================================================
   * Auto scroll
   * =========================================================
   */

  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({
        behavior: "smooth",
      });
    }
  }, [messages, isLoading]);

  /*
   * =========================================================
   * Textarea auto resize
   * =========================================================
   */

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

  /*
   * =========================================================
   * Resize
   * =========================================================
   */

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  /*
   * =========================================================
   * Authentication modal
   * =========================================================
   */

  const openLoginModal = () => {
    setSearchParams({ auth: "login" }, { replace: false });
  };

  const openSignupModal = () => {
    setSearchParams({ auth: "signup" }, { replace: false });
  };

  const closeAuthModal = () => {
    setSearchParams({}, { replace: true });
  };

  const switchToLogin = () => {
    setSearchParams({ auth: "login" }, { replace: true });
  };

  const switchToSignup = () => {
    setSearchParams({ auth: "signup" }, { replace: true });
  };

  /*
   * =========================================================
   * New guest chat
   * =========================================================
   */

  const handleNewChat = () => {
    if (isLoading) {
      return;
    }

    setMessages([]);
    setQuestion("");
    setError("");
    setThinkMode(false);
    setShowAllQuestions(false);
    setIsComposerExpanded(false);
    setIsSidebarOpen(false);
  };

  /*
   * =========================================================
   * Quick question
   * =========================================================
   */

  const handleQuickQuestion = (selectedQuestion) => {
    if (isLoading) {
      return;
    }

    setQuestion(selectedQuestion);

    requestAnimationFrame(() => {
      textareaRef.current?.focus();
    });
  };

  /*
   * =========================================================
   * Send guest question
   * =========================================================
   */

  const handleSend = async () => {
    const trimmedQuestion = question.trim();

    if (!trimmedQuestion || isLoading) {
      return;
    }

    setQuestion("");
    setError("");
    setIsLoading(true);

    const userMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: trimmedQuestion,
      timestamp: new Date().toISOString(),
    };

    setMessages((previousMessages) => [...previousMessages, userMessage]);

    try {
      const response = await fetch("/api/guest/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getCsrfHeaders(),
        },
        credentials: "include",
        body: JSON.stringify({
          question: trimmedQuestion,
          think: thinkMode,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message || data.error || "Unable to get a response from Athena.",
        );
      }

      const assistantMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: data.answer || data.message || "",
        timestamp: new Date().toISOString(),
      };

      setMessages((previousMessages) => [
        ...previousMessages,
        assistantMessage,
      ]);
    } catch (requestError) {
      console.error("Guest chat error:", requestError);

      setError(requestError.message || "Unable to connect to Athena.");

      const errorMessage = {
        id: `error-${Date.now()}`,
        role: "assistant",
        content: "Sorry, I couldn't get a response. Please try again.",
        timestamp: new Date().toISOString(),
      };

      setMessages((previousMessages) => [...previousMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  /*
   * =========================================================
   * Questions
   * =========================================================
   *
   * Initial:
   *   - 3 categories
   *   - 4 questions/category
   *
   * Explore:
   *   - all categories
   *   - all questions
   */

  const questionCategories = Object.entries(QUICK_QUESTIONS);

  const visibleCategories = showAllQuestions
    ? questionCategories
    : questionCategories.slice(0, 3);

  const totalQuestions = questionCategories.reduce(
    (total, [, questions]) => total + questions.length,
    0,
  );

  return (
    <div className="guest-app">
      <div className="guest-body">
        {/* Mobile overlay */}

        {isSidebarOpen && (
          <button
            type="button"
            className="guest-sidebar-overlay"
            onClick={() => setIsSidebarOpen(false)}
            aria-label="Close sidebar"
          />
        )}

        {/* Sidebar */}

        <Sidebar
          activeChatId={null}
          onSelectChat={undefined}
          onNewChat={handleNewChat}
          mobileOpen={isSidebarOpen}
          onMobileClose={() => setIsSidebarOpen(false)}
          theme={theme}
          onToggleTheme={onToggleTheme}
          currentUser={null}
          isGuest={true}
          onLogin={openLoginModal}
          onSignup={openSignupModal}
        />

        <main className="guest-main">
          {/* Top-right actions — no separate header bar */}
          <div className="guest-main-actions">
            <button
              type="button"
              className="guest-login-header-button"
              onClick={openLoginModal}
            >
              Log in
            </button>

            <button
              type="button"
              className="guest-signup-header-button"
              onClick={openSignupModal}
            >
              Sign up for free
            </button>

            <ThemeToggle theme={theme} onToggle={onToggleTheme} />
          </div>

          {/* Mobile menu */}

          <button
            type="button"
            className="guest-mobile-menu-button"
            onClick={() => setIsSidebarOpen(true)}
            aria-label="Open sidebar"
            title="Open sidebar"
          >
            <Menu size={20} />
          </button>

          <div className="guest-messages">
            {messages.length === 0 ? (
              <div className="guest-welcome">
                {/* Welcome heading */}

                <div className="guest-welcome-heading">
                  <h2>How can I help you?</h2>

                  <p>
                    Choose a question from your interview preparation set or ask
                    it directly below.
                  </p>

                  <span className="guest-welcome-note">
                    You're using Athena as a guest. Your conversation won't be
                    saved.
                  </span>
                </div>

                {/* Quick Questions */}

                {!thinkMode && (
                  <section className="quick-questions">
                    <div className="quick-questions-header">
                      <div>
                        <h3>Quick Questions</h3>

                        <p>
                          Practice questions from your interview preparation set
                        </p>
                      </div>

                      <span className="quick-question-count">
                        {totalQuestions} questions
                      </span>
                    </div>

                    <div className="quick-question-categories">
                      {visibleCategories.map(([categoryName, questions]) => (
                        <div
                          className="quick-question-category"
                          key={categoryName}
                        >
                          <h4>{categoryName}</h4>

                          <div className="quick-question-grid">
                            {(showAllQuestions
                              ? questions
                              : questions.slice(0, 4)
                            ).map((quickQuestion) => (
                              <button
                                type="button"
                                className="quick-question-button"
                                key={quickQuestion}
                                onClick={() =>
                                  handleQuickQuestion(quickQuestion)
                                }
                                disabled={isLoading}
                              >
                                <span>{quickQuestion}</span>

                                <span className="quick-question-arrow">→</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    {questionCategories.length > 3 && (
                      <button
                        type="button"
                        className="explore-questions-button"
                        onClick={() =>
                          setShowAllQuestions((previous) => !previous)
                        }
                      >
                        {showAllQuestions
                          ? "Show fewer questions ↑"
                          : "Explore more questions ↓"}
                      </button>
                    )}

                    {/* Think Mode explanation */}

                    <div className="think-mode-hint">
                      <span className="think-mode-hint-icon">✦</span>

                      <div>
                        <strong>Need a deeper answer?</strong>

                        <p>
                          Turn on Think Mode to ask other technical questions
                          and explore topics in more detail.
                        </p>
                      </div>
                    </div>
                  </section>
                )}

                {/* Think Mode welcome */}

                {thinkMode && (
                  <div className="think-mode-welcome">
                    <div className="think-mode-icon-large">✦</div>

                    <h3>Think Mode is on</h3>

                    <p>
                      Ask any technical question and Athena will provide a more
                      detailed answer.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`guest-message ${message.role}-message`}
                >
                  <div className="guest-message-content">
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

            {/* Thinking */}

            {isLoading && (
              <div className="guest-message assistant-message">
                <div className="guest-thinking">
                  <span>Thinking</span>

                  <span className="guest-thinking-dots">
                    <span>.</span>
                    <span>.</span>
                    <span>.</span>
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="guest-input-area">
            {error && <div className="guest-error">{error}</div>}

            <div
              className={`guest-input-wrapper ${
                isLoading ? "input-disabled" : ""
              } ${isComposerExpanded ? "composer-expanded" : ""}`}
            >
              {showExpandButton && (
                <ComposerExpandToggle
                  isExpanded={isComposerExpanded}
                  onToggle={() =>
                    setIsComposerExpanded((previous) => !previous)
                  }
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
                className="guest-send-button"
                onClick={handleSend}
                disabled={isLoading || !question.trim()}
                aria-label="Send question"
                title="Send question"
              >
                <Send size={17} />
              </button>
            </div>

            <div className="guest-input-hint">
              Enter to send · Shift + Enter for new line · Guest conversations
              are not saved
            </div>
          </div>
        </main>
      </div>

      {(isLoginModal || isSignupModal) && (
        <div className="auth-modal-overlay" onMouseDown={closeAuthModal}>
          <div
            className="auth-modal"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="auth-modal-close"
              onClick={closeAuthModal}
              aria-label="Close"
              title="Close"
            >
              <X size={20} />
            </button>

            {isLoginModal ? (
              <Login
                theme={theme}
                onToggleTheme={onToggleTheme}
                onSignup={switchToSignup}
                onForgotPassword={undefined}
                onGuest={closeAuthModal}
                modal
              />
            ) : (
              <Signup
                theme={theme}
                onToggleTheme={onToggleTheme}
                onBackToLogin={switchToLogin}
                onVerificationRequired={onVerificationRequired}
                modal
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default GuestChat;
