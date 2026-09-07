import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Send, X } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import "./guestChat.css";
import "./authModal.css";
import logo from "../../assets/athena-logo.png";
import ThemeToggle from "../theme/ThemeToggle";
import ThinkToggle from "../think/ThinkToggle";
import ComposerExpandToggle from "../expand/ComposerExpandToggle";
import Login from "../login/Login";
import Signup from "../signup/Signup";
import { getCsrfHeaders } from "../../api/csrf";

function GuestChat({ theme, onToggleTheme, onVerificationRequired }) {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [thinkMode, setThinkMode] = useState(false);
  const [isComposerExpanded, setIsComposerExpanded] = useState(false);
  const [showExpandButton, setShowExpandButton] = useState(false);
  const [error, setError] = useState("");

  const [searchParams, setSearchParams] = useSearchParams();

  const textareaRef = useRef(null);
  const messagesEndRef = useRef(null);

  const authModal = searchParams.get("auth");

  const isLoginModal = authModal === "login";
  const isSignupModal = authModal === "signup";

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

  return (
    <div className="guest-app">
      <header className="guest-header">
        <div className="guest-brand">
          <img src={logo} alt="Athena" className="guest-logo" />

          <div className="guest-brand-text">
            <h1>ATHENA</h1>
            <span>Technical Interview Assistant</span>
          </div>

          <div className="guest-badge">Guest</div>
        </div>

        <div className="guest-header-actions">
          <button
            type="button"
            className="guest-login-header-button"
            onClick={openLoginModal}
          >
            Log in
          </button>

          <button
            type="button"
            className="guest-login-header-button"
            onClick={openSignupModal}
          >
            Sign up for free
          </button>

          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        </div>
      </header>

      <main className="guest-main">
        <div className="guest-messages">
          {messages.length === 0 ? (
            <div className="guest-welcome">
              <img src={logo} alt="Athena" className="guest-welcome-logo" />

              <h2>How can I help you?</h2>

              <p>Ask me anything about your interview preparation.</p>

              <span className="guest-welcome-note">
                You're using Athena as a guest. Your conversation won't be
                saved.
              </span>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`guest-message ${message.role}-message`}
              >
                <div className="guest-message-content">
                  {message.role === "assistant" ? (
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  ) : (
                    message.content
                  )}
                </div>
              </div>
            ))
          )}

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
            Enter to send · Shift + Enter for new line · Guest conversations are
            not saved
          </div>
        </div>
      </main>

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
