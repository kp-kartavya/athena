import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Menu, Send, X } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import remarkGfm from "remark-gfm";
import "./guestChat.css";
import "./authModal.css";
import ThinkToggle from "../think/ThinkToggle";
import ComposerExpandToggle from "../expand/ComposerExpandToggle";
import Sidebar from "../sidebar/Sidebar";
import Feedback from "../feedback/Feedback";
import Login from "../login/Login";
import Signup from "../signup/Signup";
import {
  getGuestChats,
  getGuestChat,
  createGuestChat,
  sendGuestMessage,
} from "../../api/recentChats";
import { getGuestSessionId } from "../../api/guestSession";
import { QUICK_QUESTIONS } from "../../utils/constants";

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
  const [showFeedback, setShowFeedback] = useState(false);

  const [guestSessionId, setGuestSessionId] = useState(null);
  const [guestChats, setGuestChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [activeChat, setActiveChat] = useState(null);
  const [isChatsLoading, setIsChatsLoading] = useState(true);

  const [searchParams, setSearchParams] = useSearchParams();

  const textareaRef = useRef(null);
  const messagesEndRef = useRef(null);

  const authModal = searchParams.get("auth");

  const isLoginModal = authModal === "login";
  const isSignupModal = authModal === "signup";

  // =========================================================
  // INITIALIZE GUEST SESSION + LOAD GUEST CHATS
  // =========================================================

  useEffect(() => {
    let mounted = true;

    const initializeGuestSession = async () => {
      try {
        const sessionId = getGuestSessionId();

        if (!mounted) {
          return;
        }

        setGuestSessionId(sessionId);

        const chats = await getGuestChats(sessionId);

        if (!mounted) {
          return;
        }

        setGuestChats(Array.isArray(chats) ? chats : []);
      } catch (requestError) {
        console.error("Failed to load guest chats:", requestError);

        if (mounted) {
          setError("Unable to load your guest conversations.");
        }
      } finally {
        if (mounted) {
          setIsChatsLoading(false);
        }
      }
    };

    initializeGuestSession();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const handleGuestChatDeleted = (event) => {
      const deletedChatId = event.detail?.chatId;

      if (!deletedChatId) {
        return;
      }

      setGuestChats((previousChats) =>
        previousChats.filter((chat) => chat.id !== deletedChatId),
      );

      if (activeChatId === deletedChatId) {
        setActiveChatId(null);
        setActiveChat(null);
        setMessages([]);
      }
    };

    window.addEventListener(
      "athena-guest-chat-deleted",
      handleGuestChatDeleted,
    );

    return () => {
      window.removeEventListener(
        "athena-guest-chat-deleted",
        handleGuestChatDeleted,
      );
    };
  }, [activeChatId]);

  // =========================================================
  // AUTO-SCROLL
  // =========================================================

  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({
        behavior: "smooth",
      });
    }
  }, [messages, isLoading]);

  // =========================================================
  // TEXTAREA RESIZE
  // =========================================================

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

  // =========================================================
  // RESPONSIVE SIDEBAR
  // =========================================================

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 640) {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // =========================================================
  // AUTH MODALS
  // =========================================================

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

  // =========================================================
  // REFRESH GUEST CHAT LIST
  // =========================================================

  const refreshGuestChats = async (sessionId = guestSessionId) => {
    if (!sessionId) {
      return [];
    }

    const chats = await getGuestChats(sessionId);

    const normalizedChats = Array.isArray(chats) ? chats : [];

    setGuestChats(normalizedChats);

    return normalizedChats;
  };

  // =========================================================
  // SELECT GUEST CHAT
  // =========================================================

  const handleSelectChat = async (chatId) => {
    if (!chatId || isLoading || !guestSessionId) {
      return;
    }

    try {
      setError("");
      setIsSidebarOpen(false);
      setIsLoading(true);

      const chat = await getGuestChat(chatId, guestSessionId);

      setActiveChatId(chat.id);
      setActiveChat(chat);
      setMessages(Array.isArray(chat.messages) ? chat.messages : []);
      setQuestion("");
      setThinkMode(false);
      setShowAllQuestions(false);
      setIsComposerExpanded(false);

      await refreshGuestChats(guestSessionId);
    } catch (requestError) {
      console.error("Failed to load guest chat:", requestError);

      setError("Unable to load this conversation.");
    } finally {
      setIsLoading(false);
    }
  };

  // =========================================================
  // NEW CHAT
  // =========================================================

  const handleNewChat = () => {
    if (isLoading) {
      return;
    }

    setActiveChatId(null);
    setActiveChat(null);
    setMessages([]);
    setQuestion("");
    setError("");
    setThinkMode(false);
    setShowAllQuestions(false);
    setIsComposerExpanded(false);
    setIsSidebarOpen(false);
  };

  // =========================================================
  // QUICK QUESTIONS
  // =========================================================

  const handleQuickQuestion = (selectedQuestion) => {
    if (isLoading) {
      return;
    }

    setQuestion(selectedQuestion);

    requestAnimationFrame(() => {
      textareaRef.current?.focus();
    });
  };

  // =========================================================
  // SEND MESSAGE
  // =========================================================

  const handleSend = async () => {
    const trimmedQuestion = question.trim();

    if (!trimmedQuestion || isLoading || !guestSessionId) {
      return;
    }

    setQuestion("");
    setError("");
    setIsLoading(true);

    try {
      let chatId = activeChatId;

      // Create a persistent guest chat on the first message.
      if (!chatId) {
        const newChat = await createGuestChat(
          trimmedQuestion.slice(0, 80),
          guestSessionId,
        );

        chatId = newChat.id;

        setActiveChatId(chatId);
        setActiveChat(newChat);
      }

      const updatedChat = await sendGuestMessage(
        chatId,
        guestSessionId,
        trimmedQuestion,
        thinkMode,
      );

      setActiveChat(updatedChat);
      setMessages(
        Array.isArray(updatedChat.messages) ? updatedChat.messages : [],
      );

      await refreshGuestChats(guestSessionId);
    } catch (requestError) {
      console.error("Guest chat error:", requestError);

      setError(requestError.message || "Unable to connect to Athena.");
    } finally {
      setIsLoading(false);
    }
  };

  // =========================================================
  // FEEDBACK
  // =========================================================

  const handleFeedback = () => {
    if (isLoading) {
      return;
    }

    setIsSidebarOpen(false);
    setShowFeedback(true);
  };

  // =========================================================
  // QUICK QUESTION DATA
  // =========================================================

  const questionCategories = Object.entries(QUICK_QUESTIONS);

  const visibleCategories = showAllQuestions
    ? questionCategories
    : questionCategories.slice(0, 3);

  const totalQuestions = questionCategories.reduce(
    (total, [, questions]) => total + questions.length,
    0,
  );

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="guest-app">
      <div className="guest-body">
        {isSidebarOpen && (
          <button
            type="button"
            className="guest-sidebar-overlay"
            onClick={() => setIsSidebarOpen(false)}
            aria-label="Close sidebar"
          />
        )}

        <Sidebar
          activeChatId={activeChatId}
          onSelectChat={handleSelectChat}
          onNewChat={handleNewChat}
          onFeedback={handleFeedback}
          mobileOpen={isSidebarOpen}
          onMobileClose={() => setIsSidebarOpen(false)}
          theme={theme}
          onToggleTheme={onToggleTheme}
          currentUser={null}
          isGuest={true}
          onLogin={openLoginModal}
          onSignup={openSignupModal}
          guestChats={guestChats}
          isGuestChatsLoading={isChatsLoading}
          guestSessionId={guestSessionId}
        />

        <main className="guest-main">
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

            <button
              type="button"
              className="guest-mobile-menu-button"
              onClick={() => setIsSidebarOpen(true)}
              aria-label="Open sidebar"
              title="Open sidebar"
            >
              <Menu size={20} />
            </button>
          </div>

          <div className="guest-messages">
            {messages.length === 0 ? (
              <div className="guest-welcome">
                <div className="guest-welcome-heading">
                  <h2>How can I help you?</h2>

                  <p>
                    Choose a question from your interview preparation set or ask
                    it directly below.
                  </p>

                  <span className="guest-welcome-note">
                    You're using Athena as a guest. Your conversations are saved
                    on this browser.
                  </span>
                </div>

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
                disabled={isLoading || !question.trim() || !guestSessionId}
                aria-label="Send question"
                title="Send question"
              >
                <Send size={17} />
              </button>
            </div>

            <div className="guest-input-hint">
              Enter to send · Shift + Enter for new line · Guest chats are saved
              on this browser
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

      {showFeedback && (
        <Feedback
          theme={theme}
          currentUser={null}
          onClose={() => setShowFeedback(false)}
        />
      )}
    </div>
  );
}

export default GuestChat;
