import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import Sidebar from "../sidebar/Sidebar";
import { getChat, createChat, sendMessage } from "../../api/recentChats";
import "./chat.css";
import ThinkToggle from "../think/ThinkToggle";
import Header from "../header/Header";
import ComposerExpandToggle from "../expand/ComposerExpandToggle";

const Chat = () => {
  const [question, setQuestion] = useState("");
  const [activeChatId, setActiveChatId] = useState(null);
  const [activeChat, setActiveChat] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [thinkMode, setThinkMode] = useState(false);
  const [isComposerExpanded, setIsComposerExpanded] = useState(false);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  /*
   * Get messages from the currently active chat.
   */
  const messages = activeChat?.messages ?? [];

  /*
   * Scroll to the latest message whenever
   * messages or loading state changes.
   */
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
    textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
  }, [question]);

  /*
   * Start a new conversation.
   */
  const handleNewChat = () => {
    if (isLoading) {
      return;
    }

    setActiveChatId(null);
    setActiveChat(null);
    setQuestion("");
  };

  /*
   * Load an existing conversation.
   */
  const handleSelectChat = async (chatId) => {
    if (isLoading) {
      return;
    }

    try {
      const chat = await getChat(chatId);

      setActiveChatId(chat.id);
      setActiveChat(chat);
      setQuestion("");
    } catch (error) {
      console.error("Failed to load chat:", error);
    }
  };

  /*
   * Send a question.
   */
  const handleSend = async () => {
    const trimmedQuestion = question.trim();

    if (!trimmedQuestion || isLoading) {
      return;
    }

    setQuestion("");
    setIsLoading(true);

    try {
      let chatId = activeChatId;

      /*
       * No active chat means this is a new conversation.
       */
      if (!chatId) {
        const newChat = await createChat(trimmedQuestion);

        chatId = newChat.id;

        setActiveChatId(chatId);
        setActiveChat(newChat);
      }

      /*
       * Show the user's message immediately.
       */
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

      /*
       * Backend:
       * 1. Saves user message
       * 2. Runs RAG + Qwen
       * 3. Saves assistant response
       */
      const updatedChat = await sendMessage(chatId, trimmedQuestion, thinkMode);

      setActiveChat(updatedChat);

      /*
       * Refresh sidebar recents.
       */
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
      <Sidebar
        activeChatId={activeChatId}
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
        disabled={isLoading}
        refreshKey={refreshKey}
      />

      <main className="main">
        {/* Header */}
        <Header />

        {/* Messages */}
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

          {/* Thinking indicator */}
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

        {/* Input */}
        <div className="input-area">
          <div
            className={`input-wrapper ${isLoading ? "input-disabled" : ""} ${
              isComposerExpanded ? "composer-expanded" : ""
            }`}
          >
            <ComposerExpandToggle
              expanded={isComposerExpanded}
              onToggle={() => setIsComposerExpanded((prev) => !prev)}
            />

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
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && !isLoading) {
                  e.preventDefault();
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
