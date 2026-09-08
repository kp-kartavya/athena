import { useEffect, useState } from "react";
import {
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

const Sidebar = ({
  activeChatId,
  onSelectChat,
  onNewChat,
  mobileOpen,
  onMobileClose,
  theme,
  onToggleTheme,
  currentUser,
  refreshKey,
  disabled = false,

  // Guest mode
  isGuest = false,
  onLogin,
  onSignup,
}) => {
  const [chats, setChats] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteChatId, setDeleteChatId] = useState(null);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    if (isGuest) {
      return;
    }

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
          setChats([]);
        }
      }
    };

    fetchChats();

    return () => {
      cancelled = true;
    };
  }, [isGuest, refreshKey]);

  const handleCollapse = () => {
    setCollapsed(true);
    setProfileMenuOpen(false);
  };

  const handleExpand = () => {
    setCollapsed(false);
    setProfileMenuOpen(false);
  };

  const handleNewChat = () => {
    if (disabled) {
      return;
    }

    if (onNewChat) {
      onNewChat();
    }

    onMobileClose?.();

    setProfileMenuOpen(false);
    setSearchQuery("");
  };

  const handleSelectChat = (chatId) => {
    if (disabled) {
      return;
    }

    if (onSelectChat) {
      onSelectChat(chatId);
    }

    onMobileClose?.();

    setProfileMenuOpen(false);
  };

  const handleDeleteChat = async (chatId) => {
    if (disabled || isGuest) {
      return;
    }

    try {
      await deleteChat(chatId);

      setChats((previousChats) =>
        previousChats.filter((chat) => chat.id !== chatId),
      );

      if (activeChatId === chatId) {
        onNewChat?.();
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
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      window.location.href = "/";
    }
  };

  const handleLogin = () => {
    onMobileClose?.();
    setProfileMenuOpen(false);

    if (onLogin) {
      onLogin();
    }
  };

  const handleSignup = () => {
    onMobileClose?.();
    setProfileMenuOpen(false);

    if (onSignup) {
      onSignup();
    }
  };

  const filteredChats = chats.filter((chat) => {
    const title = chat.title ?? "";
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return true;
    }

    return title.toLowerCase().includes(query);
  });

  const getInitial = () => {
    if (currentUser?.initial) {
      return currentUser.initial;
    }

    if (currentUser?.name) {
      return currentUser.name.charAt(0).toUpperCase();
    }

    return "?";
  };

  return (
    <>
      <LoadingWidget visible={loggingOut} message="Signing you out..." />

      <aside
        className={`sidebar ${
          collapsed ? "collapsed" : ""
        } ${mobileOpen ? "mobile-open" : ""} ${isGuest ? "guest-sidebar" : ""}`}
      >
        <div className="sidebar-header">
          {!collapsed && (
            <>
              <div className="sidebar-brand">
                <img src={logo} alt="Athena" className="sidebar-logo" />

                <div className="sidebar-brand-text">
                  <span className="sidebar-brand-name">ATHENA</span>

                  <span className="sidebar-brand-subtitle">
                    Technical Interview Assistant
                  </span>
                </div>
              </div>

              <button
                type="button"
                className="sidebar-collapse-button"
                onClick={handleCollapse}
                title="Collapse sidebar"
                aria-label="Collapse sidebar"
                disabled={disabled}
              >
                <PanelLeftClose size={20} />
              </button>
            </>
          )}

          {collapsed && (
            <button
              type="button"
              className="sidebar-logo-button"
              onClick={handleExpand}
              title="Expand sidebar"
              aria-label="Expand sidebar"
              disabled={disabled}
            >
              <img src={logo} alt="Athena" className="sidebar-logo" />
            </button>
          )}

          {/* Mobile close button */}

          <button
            type="button"
            className="sidebar-mobile-close"
            onClick={onMobileClose}
            title="Close sidebar"
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        <div className="sidebar-content">
          {/* New Chat */}

          <button
            type="button"
            className="new-chat-button"
            onClick={handleNewChat}
            disabled={disabled}
          >
            <Plus size={20} />

            <span className="new-chat-text">New chat</span>
          </button>

          {/* Search */}

          <div className="sidebar-search">
            <Search size={17} />

            <input
              type="text"
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              disabled={disabled || isGuest}
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
              {isGuest ? (
                <div className="no-chats">
                  <MessageSquare size={17} />

                  <span>Guest chats are not saved</span>
                </div>
              ) : filteredChats.length === 0 ? (
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
                      disabled={disabled}
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
                      disabled={disabled}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {isGuest ? (
          <div className="sidebar-footer">
            <div className="guest-sidebar-footer-card">
              <div className="guest-sidebar-footer-title">
                Get more with Athena
              </div>

              <p>
                Log in to save your conversations and access them from your
                recent chats.
              </p>

              <button type="button" onClick={handleLogin}>
                Log in
              </button>

              <button
                type="button"
                className="guest-sidebar-signup-button"
                onClick={handleSignup}
              >
                Sign up for free
              </button>
            </div>

            {/* Guest Profile */}

            <div className="sidebar-user guest-sidebar-user">
              <div className="sidebar-user-profile-button">
                <div className="sidebar-user-avatar guest-avatar">G</div>

                <div className="sidebar-user-info">
                  <span className="sidebar-user-name">Guest</span>

                  <span className="sidebar-user-theme-label">
                    {theme === "dark" ? "Dark" : "Light"}
                  </span>
                </div>
              </div>

              <button
                type="button"
                className="sidebar-theme-button"
                onClick={onToggleTheme}
                title="Toggle theme"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? <Moon size={16} /> : <Sun size={16} />}
              </button>
            </div>
          </div>
        ) : (
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
        )}
      </aside>

      {deleteChatId !== null && !isGuest && (
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
