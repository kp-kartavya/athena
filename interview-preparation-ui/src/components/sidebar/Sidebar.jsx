import { useEffect, useState } from "react";
import { Menu, Plus, MessageSquare } from "lucide-react";
import ThemeToggle from "../theme/ThemeToggle";
import { getChats } from "../../api/recentChats";
import athenaLogo from "../../assets/athena-logo.png";
import "./sidebar.css";
import SearchChats from "../search/SearchChats";

const Sidebar = ({
  activeChatId,
  onNewChat,
  onSelectChat,
  disabled,
  refreshKey,
}) => {
  const [chats, setChats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const loadChats = async () => {
      try {
        setIsLoading(true);

        const savedChats = await getChats();

        setChats(savedChats);
      } catch (error) {
        console.error("Failed to load recent chats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadChats();
  }, [refreshKey]);

  return (
    <aside className={`sidebar ${isCollapsed ? "collapsed" : ""}`}>
      {/* ========================= */}
      {/* Sidebar Header             */}
      {/* ========================= */}

      <div className="sidebar-header">
        <button
          className="sidebar-logo-button"
          onClick={() => setIsCollapsed((prev) => !prev)}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <img src={athenaLogo} alt="Athena" className="sidebar-logo" />
          ) : (
            <>
              <img src={athenaLogo} alt="Athena" className="sidebar-logo" />

              <span className="sidebar-brand">ATHENA</span>
            </>
          )}
        </button>

        {!isCollapsed && (
          <button
            className="collapse-button"
            onClick={() => setIsCollapsed(true)}
            disabled={disabled}
            title="Collapse sidebar"
          >
            <Menu size={20} />
          </button>
        )}
      </div>

      {/* ========================= */}
      {/* Search                    */}
      {/* ========================= */}

      <SearchChats
        chats={chats}
        onSelectChat={onSelectChat}
        disabled={disabled}
        isCollapsed={isCollapsed}
      />

      {/* ========================= */}
      {/* New Chat                  */}
      {/* ========================= */}

      <button
        className="new-chat-button"
        onClick={onNewChat}
        disabled={disabled}
        title="New chat"
      >
        <Plus size={20} />

        {!isCollapsed && <span>New chat</span>}
      </button>

      {/* ========================= */}
      {/* Recents                   */}
      {/* ========================= */}

      <div className="recent-section">
        {!isCollapsed && <div className="recent-title">Recents</div>}

        {isLoading
          ? !isCollapsed && (
              <div className="empty-recents">Loading chats...</div>
            )
          : chats.length === 0
            ? !isCollapsed && (
                <div className="empty-recents">No recent chats</div>
              )
            : chats.map((chat) => (
                <button
                  key={chat.id}
                  className={`recent-chat ${
                    chat.id === activeChatId ? "active" : ""
                  }`}
                  onClick={() => onSelectChat(chat.id)}
                  disabled={disabled}
                  title={chat.title}
                >
                  <MessageSquare size={17} />

                  {!isCollapsed && (
                    <span className="recent-chat-title">{chat.title}</span>
                  )}
                </button>
              ))}
      </div>

      {/* ========================= */}
      {/* Footer                    */}
      {/* ========================= */}

      <div className="sidebar-footer">
        {!isCollapsed && <span>Theme</span>}

        <ThemeToggle />
      </div>
    </aside>
  );
};

export default Sidebar;
