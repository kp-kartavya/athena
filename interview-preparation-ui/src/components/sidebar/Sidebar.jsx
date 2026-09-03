import { useEffect, useState } from "react";
import { Menu, Plus, MessageSquare, Trash2 } from "lucide-react";
import ThemeToggle from "../theme/ThemeToggle";
import { getChats, deleteChat } from "../../api/recentChats";
import athenaLogo from "../../assets/athena-logo.png";
import "./sidebar.css";
import SearchChats from "../search/SearchChats";
import DeleteChat from "../deleteChat/DeleteChat";

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
  const [chatToDelete, setChatToDelete] = useState(null);

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

  const handleDeleteChat = async (chatId) => {
    try {
      await deleteChat(chatId);

      setChats((prevChats) => prevChats.filter((chat) => chat.id !== chatId));

      if (activeChatId === chatId) {
        onNewChat();
      }

      return true;
    } catch (error) {
      console.error("Failed to delete chat:", error);
      return false;
    }
  };

  return (
    <>
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
                  <div
                    key={chat.id}
                    className={`recent-chat ${
                      chat.id === activeChatId ? "active" : ""
                    }`}
                  >
                    <button
                      className="recent-chat-button"
                      onClick={() => onSelectChat(chat.id)}
                      disabled={disabled}
                      title={chat.title}
                    >
                      <MessageSquare size={17} />

                      {!isCollapsed && (
                        <span className="recent-chat-title">{chat.title}</span>
                      )}
                    </button>

                    {!isCollapsed && (
                      <button
                        className="delete-chat-button"
                        onClick={(event) => {
                          event.stopPropagation();
                          setChatToDelete(chat);
                        }}
                        disabled={disabled}
                        title="Delete chat"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
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

      {chatToDelete && (
        <DeleteChat
          chatTitle={chatToDelete.title}
          onCancel={() => setChatToDelete(null)}
          onConfirm={async () => {
            const deleted = await handleDeleteChat(chatToDelete.id);
            if (deleted) {
              setChatToDelete(null);
            }
          }}
        />
      )}
    </>
  );
};

export default Sidebar;
