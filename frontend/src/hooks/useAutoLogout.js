import { useEffect, useRef } from "react";
import { getCsrfHeaders } from "../api/csrf";

const IDLE_TIMEOUT = 60 * 60 * 1000;

function useAutoLogout(enabled) {
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    const logout = async () => {
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

    const resetTimer = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(logout, IDLE_TIMEOUT);
    };

    const events = [
      "mousemove",
      "mousedown",
      "keydown",
      "scroll",
      "touchstart",
      "click",
    ];

    events.forEach((event) => {
      window.addEventListener(event, resetTimer, { passive: true });
    });

    resetTimer();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      events.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [enabled]);
}

export default useAutoLogout;
