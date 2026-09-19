import { useEffect, useMemo, useRef, useState } from "react";
import { Menu } from "lucide-react";
import Sidebar from "../../common/sidebar/Sidebar";
import Feedback from "../feedback/Feedback";
import {
  getChat,
  createChat,
  sendMessageStream,
} from "../../../api/recentChats";
import "./chat.css";
import ChatMessages from "../chatMessages/ChatMessages";
import QuickQuestions from "../../common/quickQuestions/QuickQuestions";
import Composer from "../composer/Composer";

const Chat = ({ theme, onToggleTheme, currentUser }) => {
  const [question, setQuestion] = useState("");
  const [activeChatId, setActiveChatId] = useState(null);
  const [activeChat, setActiveChat] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [thinkMode, setThinkMode] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [scrollRequestKey, setScrollRequestKey] = useState(0);

  const abortControllerRef = useRef(null);
  const textareaRef = useRef(null);

  const messages = useMemo(
    () => activeChat?.messages ?? [],
    [activeChat?.messages],
  );

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

    requestAnimationFrame(() => {
      textareaRef.current?.focus();
    });
  };

  const handleSend = async () => {
    const trimmedQuestion = question.trim();

    if (!trimmedQuestion || isLoading) {
      return;
    }

    const controller = new AbortController();

    abortControllerRef.current = controller;

    setQuestion("");
    setIsLoading(true);

    setScrollRequestKey((previous) => previous + 1);

    try {
      let chatId = activeChatId;

      if (!chatId) {
        const newChat = await createChat(trimmedQuestion);

        chatId = newChat.id;

        setActiveChatId(chatId);
        setActiveChat(newChat);
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

      setActiveChat((previous) => ({
        ...(previous ?? {}),
        messages: [
          ...(previous?.messages ?? []),
          userMessage,
          assistantMessage,
        ],
      }));

      await sendMessageStream(
        chatId,
        trimmedQuestion,
        thinkMode,
        (_chunk, fullResponse) => {
          setActiveChat((previous) => ({
            ...(previous ?? {}),
            messages: (previous?.messages ?? []).map((message) =>
              message.id === assistantMessage.id
                ? {
                    ...message,
                    content: fullResponse,
                  }
                : message,
            ),
          }));
        },
        controller.signal,
      );

      setRefreshKey((previous) => previous + 1);
    } catch (error) {
      if (error?.name === "AbortError") {
        console.log("🛑 Response generation stopped by user.");
        return;
      }

      console.error("Error sending message:", error);

      const errorMessage = {
        id: `error-${Date.now()}`,
        role: "assistant",
        content: "Sorry, I couldn't get a response. Please try again.",
        timestamp: new Date().toISOString(),
      };

      setActiveChat((previous) => ({
        ...(previous ?? {}),
        messages: [...(previous?.messages ?? []), errorMessage],
      }));
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

        <div className="chat-content">
          {messages.length === 0 ? (
            <div className="messages">
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
                  <>
                    <QuickQuestions
                      isLoading={isLoading}
                      onQuestionSelect={handleQuickQuestion}
                      variant="chat"
                    />

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
                  </>
                )}

                {thinkMode && (
                  <div className="think-mode-welcome">
                    <div className="think-mode-icon-large">✦</div>

                    <h3>Think Mode is ON</h3>

                    <p>
                      Ask broader technical questions, explore concepts outside
                      the quick-question set, or get a more detailed
                      explanation.
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <ChatMessages
              messages={messages}
              containerClassName="messages"
              messageClassName="message"
              messageContentClassName="message-content"
              scrollRequestKey={scrollRequestKey}
              isLoading={isLoading}
            />
          )}
        </div>

        <Composer
          ref={textareaRef}
          question={question}
          onQuestionChange={setQuestion}
          onSend={handleSend}
          onStop={handleStop}
          isLoading={isLoading}
          thinkMode={thinkMode}
          onToggleThinkMode={() => setThinkMode((previous) => !previous)}
        />
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
