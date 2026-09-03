import "./deleteChat.css";

const DeleteChat = ({ chatTitle, onConfirm, onCancel }) => {
  return (
    <div className="delete-modal-overlay" onClick={onCancel}>
      <div
        className="delete-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="delete-modal-icon">🗑</div>

        <h3>Delete chat?</h3>

        <p>
          Are you sure you want to delete <strong>{chatTitle}</strong>?
        </p>

        <div className="delete-modal-actions">
          <button
            type="button"
            className="delete-cancel-button"
            onClick={onCancel}
          >
            Cancel
          </button>

          <button
            type="button"
            className="delete-confirm-button"
            onClick={onConfirm}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteChat;
