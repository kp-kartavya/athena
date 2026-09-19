import { useEffect, useRef, useState } from "react";
import { Menu, Sparkles, X } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";

import "./guestChat.css";
import "./authModal.css";

import Sidebar from "../../common/sidebar/Sidebar";
import Feedback from "../feedback/Feedback";
import Login from "../../auth/login/Login";
import Signup from "../../auth/signup/Signup";
import ChatMessages from "../chatMessages/ChatMessages";
import QuickQuestions from "../../common/quickQuestions/QuickQuestions";
import ChatComposer from "../composer/Composer";

import {
  getGuestChats,
  getGuestChat,
  createGuestChat,
  sendGuestMessageStream,
} from "../../../api/recentChats";

import { getGuestSessionId } from "../../../api/guestSession";

function GuestChat({ theme, onToggleTheme, onVerificationRequired }) {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [thinkMode, setThinkMode] = useState(false);
  const [error, setError] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [scrollRequestKey, setScrollRequestKey] = useState(0);

  const [guestSessionId, setGuestSessionId] = useState(null);
  const [guestChats, setGuestChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [isChatsLoading, setIsChatsLoading] = useState(true);

  const [searchParams, setSearchParams] = useSearchParams();

  const navigate = useNavigate();

  const abortControllerRef = useRef(null);
  const textareaRef = useRef(null);

  const authModal = searchParams.get("auth");

  const isLoginModal = authModal === "login";
  const isSignupModal = authModal === "signup";

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
        setMessages([]);
        setQuestion("");
        setThinkMode(false);
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

  const refreshGuestChats = async (sessionId = guestSessionId) => {
    if (!sessionId) {
      return [];
    }

    const chats = await getGuestChats(sessionId);
    const normalizedChats = Array.isArray(chats) ? chats : [];

    setGuestChats(normalizedChats);

    return normalizedChats;
  };

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
      setMessages(Array.isArray(chat.messages) ? chat.messages : []);
      setQuestion("");
      setThinkMode(false);

      await refreshGuestChats(guestSessionId);
    } catch (requestError) {
      console.error("Failed to load guest chat:", requestError);

      setError("Unable to load this conversation.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    if (isLoading) {
      return;
    }

    setActiveChatId(null);
    setMessages([]);
    setQuestion("");
    setError("");
    setThinkMode(false);
    setIsSidebarOpen(false);
  };

  const handleQuickQuestion = (selectedQuestion) => {
    if (isLoading) {
      return;
    }

    setQuestion(selectedQuestion);

    requestAnimationFrame(() => {
      textareaRef.current?.focus();
    });
  };

  const handleSend = async () => {
    const trimmedQuestion = question.trim();

    if (!trimmedQuestion || isLoading || !guestSessionId) {
      return;
    }

    const controller = new AbortController();

    abortControllerRef.current = controller;

    setQuestion("");
    setError("");
    setIsLoading(true);

    setScrollRequestKey((previous) => previous + 1);

    try {
      let chatId = activeChatId;

      if (!chatId) {
        const newChat = await createGuestChat(
          trimmedQuestion.slice(0, 80),
          guestSessionId,
        );

        chatId = newChat.id;
        setActiveChatId(chatId);
      }

      const userMessage = {
        id: `temp-user-${Date.now()}`,
        role: "user",
        content: trimmedQuestion,
        timestamp: new Date().toISOString(),
      };

      const assistantMessage = {
        id: `temp-assistant-${Date.now()}`,
        role: "assistant",
        content: "",
        timestamp: new Date().toISOString(),
      };

      setMessages((previous) => [...previous, userMessage, assistantMessage]);

      await sendGuestMessageStream(
        chatId,
        guestSessionId,
        trimmedQuestion,
        thinkMode,
        (_chunk, fullResponse) => {
          setMessages((previous) =>
            previous.map((message) =>
              message.id === assistantMessage.id
                ? {
                    ...message,
                    content: fullResponse,
                  }
                : message,
            ),
          );
        },
        controller.signal,
      );

      await refreshGuestChats(guestSessionId);
    } catch (requestError) {
      if (requestError?.name === "AbortError") {
        console.log("🛑 Guest response generation stopped by user.");
        return;
      }

      console.error("Guest chat error:", requestError);

      setError(requestError.message || "Unable to connect to Athena.");
    } finally {
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
      }

      setIsLoading(false);
    }
  };

  const handleStop = () => {
    abortControllerRef.current?.abort();
    setIsLoading(false);
  };

  const handleFeedback = () => {
    if (isLoading) {
      return;
    }

    setIsSidebarOpen(false);
    setShowFeedback(true);
  };

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
              className="guest-about-header-button"
              onClick={() => navigate("/about")}
            >
              <Sparkles size={14} />
              About Athena
            </button>

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

          {messages.length === 0 ? (
            <div className="guest-messages">
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
                  <>
                    <QuickQuestions
                      isLoading={isLoading}
                      onQuestionSelect={handleQuickQuestion}
                      variant="guest"
                    />

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
                  </>
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
            </div>
          ) : (
            <ChatMessages
              messages={messages}
              containerClassName="guest-messages"
              messageClassName="guest-message"
              messageContentClassName="guest-message-content"
              scrollRequestKey={scrollRequestKey}
              isLoading={isLoading}
            />
          )}

          {error && <div className="guest-error">{error}</div>}

          <ChatComposer
            ref={textareaRef}
            question={question}
            onQuestionChange={setQuestion}
            onSend={handleSend}
            onStop={handleStop}
            isLoading={isLoading}
            thinkMode={thinkMode}
            onToggleThinkMode={() => setThinkMode((previous) => !previous)}
            variant="guest"
            canSend={Boolean(guestSessionId)}
          />
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
