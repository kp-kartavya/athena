import { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Menu } from "lucide-react";
import Sidebar from "../sidebar/Sidebar";
import { getChat, createChat, sendMessage } from "../../api/recentChats";
import "./chat.css";
import ThinkToggle from "../think/ThinkToggle";
import Header from "../header/Header";
import ComposerExpandToggle from "../expand/ComposerExpandToggle";

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

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const messages = useMemo(
    () => activeChat?.messages ?? [],
    [activeChat?.messages],
  );

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
      if (window.innerWidth > 768) {
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

        <Header />

        <div className="messages">
          {messages.length === 0 ? (
            <div className="welcome">
              <h2>How can I help you?</h2>
              <p>Ask me anything about your interview preparation.</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`message ${message.role}-message`}
              >
                <div className="message-content">
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
            className={`input-wrapper ${
              isLoading ? "input-disabled" : ""
            } ${isComposerExpanded ? "composer-expanded" : ""}`}
          >
            {showExpandButton && (
              <ComposerExpandToggle
                isExpanded={isComposerExpanded}
                onToggle={() => setIsComposerExpanded(!isComposerExpanded)}
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
              onToggle={() => setThinkMode((prev) => !prev)}
              disabled={isLoading}
            />

            <button
              className="send-button"
              onClick={handleSend}
              disabled={isLoading || !question.trim()}
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
    </div>
  );
};

export default Chat;
