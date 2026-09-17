const GUEST_SESSION_KEY = "athena_guest_session_id";

export const getGuestSessionId = () => {
  let guestSessionId = localStorage.getItem(GUEST_SESSION_KEY);

  if (!guestSessionId) {
    if (
      typeof crypto !== "undefined" &&
      typeof crypto.randomUUID === "function"
    ) {
      guestSessionId = crypto.randomUUID();
    } else {
      guestSessionId = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    }

    localStorage.setItem(GUEST_SESSION_KEY, guestSessionId);
  }

  return guestSessionId;
};

export const clearGuestSessionId = () => {
  localStorage.removeItem(GUEST_SESSION_KEY);
};
