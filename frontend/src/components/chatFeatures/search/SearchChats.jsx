import { useState } from "react";
import { Search, X } from "lucide-react";

const SearchChats = ({ chats, onSelectChat, disabled, isCollapsed }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const filteredChats = chats.filter((chat) =>
    chat.title.toLowerCase().includes(searchQuery.trim().toLowerCase()),
  );

  const handleClose = () => {
    setSearchQuery("");
    setIsSearchOpen(false);
  };

  /*
   * Collapsed sidebar
   */
  if (isCollapsed) {
    return (
      <button
        className="sidebar-icon-button"
        onClick={() => setIsSearchOpen(true)}
        disabled={disabled}
        title="Search chats"
      >
        <Search size={19} />
      </button>
    );
  }

  /*
   * Expanded sidebar
   */
  return (
    <div className="sidebar-search-container">
      {!isSearchOpen ? (
        <button
          className="sidebar-search"
          onClick={() => setIsSearchOpen(true)}
          disabled={disabled}
        >
          <Search size={17} />
          <span>Search chats</span>
        </button>
      ) : (
        <>
          <div className="sidebar-search-input">
            <Search size={17} />

            <input
              type="text"
              placeholder="Search chats..."
              value={searchQuery}
              autoFocus
              disabled={disabled}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            <button
              type="button"
              onClick={handleClose}
              disabled={disabled}
              aria-label="Close search"
            >
              <X size={16} />
            </button>
          </div>

          {searchQuery.trim() && (
            <div className="search-results">
              {filteredChats.length === 0 ? (
                <div className="empty-search">No chats found</div>
              ) : (
                filteredChats.map((chat) => (
                  <button
                    key={chat.id}
                    className="search-result"
                    onClick={() => {
                      onSelectChat(chat.id);
                      handleClose();
                    }}
                    disabled={disabled}
                    title={chat.title}
                  >
                    {chat.title}
                  </button>
                ))
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SearchChats;
