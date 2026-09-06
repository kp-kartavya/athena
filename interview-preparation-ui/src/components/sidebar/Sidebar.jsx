import { useEffect, useState } from "react";
import {
  Menu,
  Plus,
  MessageSquare,
  Trash2,
  LogOut,
  PanelLeftClose,
  Search,
  X,
  Sun,
  Moon,
} from "lucide-react";
import { getChats, deleteChat } from "../../api/recentChats";
import logo from "../../assets/athena-logo.png";
import "./sidebar.css";
import LoadingWidget from "../loading/LoadingWidget";
import { getCsrfHeaders } from "../../api/csrf";

/**
 * Provides the application sidebar for chat navigation and user controls.
 *
 * Supports expanded, collapsed, and mobile layouts. In the expanded
 * desktop layout, the collapse button is displayed beside the Athena
 * branding. In the collapsed layout, the Athena logo becomes the
 * control used to expand the sidebar.
 *
 * In collapsed mode, the authenticated user's initials open the
 * profile menu containing theme and logout controls.
 */
const Sidebar = ({
  activeChatId,
  onSelectChat,
  onNewChat,
  mobileOpen,
  onMobileClose,
  theme,
  onToggleTheme,
  currentUser,
}) => {
  const [chats, setChats] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteChatId, setDeleteChatId] = useState(null);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const fetchChats = async () => {
      try {
        const response = await getChats();

        if (!cancelled) {
          setChats(response ?? []);
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to load chats:", error);
        }
      }
    };

    fetchChats();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleCollapse = () => {
    setCollapsed(true);
    setProfileMenuOpen(false);
  };

  const handleExpand = () => {
    setCollapsed(false);
    setProfileMenuOpen(false);
  };

  const handleNewChat = () => {
    onNewChat();
    onMobileClose?.();
    setProfileMenuOpen(false);
  };

  const handleSelectChat = (chatId) => {
    onSelectChat(chatId);
    onMobileClose?.();
    setProfileMenuOpen(false);
  };

  const handleDeleteChat = async (chatId) => {
    try {
      await deleteChat(chatId);

      setChats((previousChats) =>
        previousChats.filter((chat) => chat.id !== chatId),
      );

      if (activeChatId === chatId) {
        onNewChat();
      }
    } catch (error) {
      console.error("Failed to delete chat:", error);
    } finally {
      setDeleteChatId(null);
    }
  };

  const handleLogout = async () => {
    if (loggingOut) {
      return;
    }

    setProfileMenuOpen(false);
    setLoggingOut(true);

    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          ...getCsrfHeaders(),
        },
        credentials: "include",
      });
    } finally {
      window.location.href = "/";
    }
  };

  const filteredChats = chats.filter((chat) => {
    const title = chat.title ?? "";

    return title.toLowerCase().includes(searchQuery.trim().toLowerCase());
  });

  const getInitial = () => {
    return currentUser?.initial || "?";
  };

  return (
    <>
      <LoadingWidget visible={loggingOut} message="Signing you out..." />
      <aside
        className={`sidebar ${
          collapsed ? "collapsed" : ""
        } ${mobileOpen ? "mobile-open" : ""}`}
      >
        {/* Header */}
        <div className="sidebar-header">
          {collapsed ? (
            <button
              type="button"
              className="sidebar-logo-button"
              onClick={handleExpand}
              title="Expand sidebar"
              aria-label="Expand sidebar"
            >
              <img src={logo} alt="Athena" className="sidebar-logo" />
            </button>
          ) : (
            <>
              <div className="sidebar-brand">
                <img src={logo} alt="Athena" className="sidebar-logo" />

                <span className="sidebar-brand-name">ATHENA</span>
              </div>

              <button
                type="button"
                className="sidebar-collapse-button"
                onClick={handleCollapse}
                title="Collapse sidebar"
                aria-label="Collapse sidebar"
              >
                <PanelLeftClose size={20} />
              </button>
            </>
          )}

          <button
            type="button"
            className="sidebar-mobile-close"
            onClick={onMobileClose}
            title="Close sidebar"
            aria-label="Close sidebar"
          >
            <Menu size={20} />
          </button>
        </div>

        {/* Main Content */}
        <div className="sidebar-content">
          <button
            type="button"
            className="new-chat-button"
            onClick={handleNewChat}
          >
            <Plus size={20} />

            <span className="new-chat-text">New chat</span>
          </button>

          <div className="sidebar-search">
            <Search size={17} />

            <input
              type="text"
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />

            {searchQuery && (
              <button
                type="button"
                className="sidebar-search-clear"
                onClick={() => setSearchQuery("")}
                aria-label="Clear search"
              >
                <X size={15} />
              </button>
            )}
          </div>

          <div className="recent-chats-section">
            <div className="recent-chats-title">Recent</div>

            <div className="recent-chats-list">
              {filteredChats.length === 0 ? (
                <div className="no-chats">
                  <MessageSquare size={17} />

                  <span>No chats yet</span>
                </div>
              ) : (
                filteredChats.map((chat) => (
                  <div
                    key={chat.id}
                    className={`chat-item ${
                      activeChatId === chat.id ? "active" : ""
                    }`}
                  >
                    <button
                      type="button"
                      className="chat-item-button"
                      onClick={() => handleSelectChat(chat.id)}
                    >
                      <MessageSquare size={17} />

                      <span className="chat-title">
                        {chat.title || "New chat"}
                      </span>
                    </button>

                    <button
                      type="button"
                      className="chat-delete-button"
                      onClick={() => setDeleteChatId(chat.id)}
                      title="Delete chat"
                      aria-label="Delete chat"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* User Footer */}
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <button
              type="button"
              className="sidebar-user-profile-button"
              onClick={() => {
                if (collapsed) {
                  setProfileMenuOpen((open) => !open);
                }
              }}
              aria-label="Open profile menu"
            >
              <div className="sidebar-user-avatar">{getInitial()}</div>

              <div className="sidebar-user-info">
                <span className="sidebar-user-name">
                  {currentUser?.name ?? "User"}
                </span>

                <span className="sidebar-user-theme-label">
                  {theme === "dark" ? "Dark" : "Light"}
                </span>
              </div>
            </button>

            <button
              type="button"
              className="sidebar-theme-button"
              onClick={onToggleTheme}
              title="Toggle theme"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Moon size={16} /> : <Sun size={16} />}
            </button>

            <button
              type="button"
              className="logout-button"
              onClick={handleLogout}
              disabled={loggingOut}
              title="Logout"
              aria-label="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>

          {/* Collapsed Profile Menu */}
          {profileMenuOpen && collapsed && (
            <div className="collapsed-profile-menu">
              <div className="profile-menu-header">
                <div className="profile-menu-avatar">{getInitial()}</div>

                <div className="profile-menu-user">
                  <span className="profile-menu-name">
                    {currentUser?.name ?? "User"}
                  </span>

                  <span className="profile-menu-provider">Go</span>
                </div>
              </div>

              <div className="profile-menu-divider" />

              <button
                type="button"
                className="profile-menu-theme"
                onClick={onToggleTheme}
              >
                <div className="profile-menu-theme-label">
                  {theme === "dark" ? <Moon size={18} /> : <Sun size={18} />}

                  <span>{theme === "dark" ? "Dark mode" : "Light mode"}</span>
                </div>

                <span className="profile-menu-theme-state">
                  {theme === "dark" ? "Dark" : "Light"}
                </span>
              </button>

              <button
                type="button"
                className="profile-menu-item"
                onClick={handleLogout}
                disabled={loggingOut}
              >
                <LogOut size={18} />
                <span>Log out</span>
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Delete Chat Dialog */}
      {deleteChatId !== null && (
        <div className="delete-chat-overlay">
          <div className="delete-chat-dialog">
            <h3>Delete chat?</h3>

            <p>This chat will be permanently deleted.</p>

            <div className="delete-chat-actions">
              <button
                type="button"
                className="delete-chat-cancel"
                onClick={() => setDeleteChatId(null)}
              >
                Cancel
              </button>

              <button
                type="button"
                className="delete-chat-confirm"
                onClick={() => handleDeleteChat(deleteChatId)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
