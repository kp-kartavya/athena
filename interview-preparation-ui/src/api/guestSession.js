const GUEST_SESSION_KEY = "athena_guest_session_id";

export const getGuestSessionId = () => {
  let guestSessionId = localStorage.getItem(GUEST_SESSION_KEY);

  if (!guestSessionId) {
    guestSessionId = crypto.randomUUID();
    localStorage.setItem(GUEST_SESSION_KEY, guestSessionId);
  }

  return guestSessionId;
};

export const clearGuestSessionId = () => {
  localStorage.removeItem(GUEST_SESSION_KEY);
};
