import { useEffect, useState } from "react";
import { BrowserRouter } from "react-router-dom";
import "./App.css";
import AppRoutes from "./routes/AppRoutes";
import { initializeCsrf } from "./api/csrf";
import { transferGuestChats } from "./api/recentChats";
import { clearGuestSessionId } from "./api/guestSession";

const STORAGE_KEY = "interview-bot-theme";

// Manages global application state, theme, authentication initialization,
// and guest-chat transfer before rendering the authenticated application.
const getSystemTheme = () => {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

const getInitialTheme = () => {
  const savedTheme = localStorage.getItem(STORAGE_KEY);

  if (savedTheme === "dark" || savedTheme === "light") {
    return savedTheme;
  }

  return getSystemTheme();
};

function AppContent() {
  const [authenticated, setAuthenticated] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  const [verificationData, setVerificationData] = useState({
    name: "",
    email: "",
  });

  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((currentTheme) => (currentTheme === "dark" ? "light" : "dark"));
  };

  const transferGuestChatsIfAvailable = async () => {
    const guestSessionId = localStorage.getItem("athena_guest_session_id");

    console.log(
      "🔄 Checking guest chat transfer. guestSessionId:",
      guestSessionId,
    );

    if (!guestSessionId) {
      console.log("ℹ️ No guest session found. Nothing to transfer.");
      return;
    }

    try {
      console.log("🚀 Calling transferGuestChats() with:", guestSessionId);

      const result = await transferGuestChats(guestSessionId);

      console.log("✅ Guest chat transfer successful:", result);

      clearGuestSessionId();
    } catch (error) {
      console.error("❌ Failed to transfer guest chats:", error);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const initializeApplication = async () => {
      try {
        await initializeCsrf();
      } catch (error) {
        console.error("Failed to initialize CSRF protection:", error);
      }

      if (cancelled) {
        return;
      }

      try {
        const response = await fetch("/api/auth/me", {
          credentials: "include",
        });

        if (!response.ok) {
          if (!cancelled) {
            setAuthenticated(false);
            setCurrentUser(null);
          }

          return;
        }

        const data = await response.json();

        if (!data.authenticated) {
          if (!cancelled) {
            setAuthenticated(false);
            setCurrentUser(null);
          }

          return;
        }

        if (cancelled) {
          return;
        }

        setCurrentUser({
          name: data.name,
          initial: data.initial,
        });

        await transferGuestChatsIfAvailable();

        if (cancelled) {
          return;
        }

        setAuthenticated(true);
      } catch (error) {
        console.error("Failed to initialize application:", error);

        if (!cancelled) {
          setAuthenticated(false);
          setCurrentUser(null);
        }
      }
    };

    initializeApplication();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleVerificationRequired = (data) => {
    setVerificationData(data);
  };

  const handleVerificationComplete = () => {
    setVerificationData({
      name: "",
      email: "",
    });
  };

  return (
    <AppRoutes
      authenticated={authenticated}
      currentUser={currentUser}
      theme={theme}
      onToggleTheme={toggleTheme}
      verificationData={verificationData}
      onVerificationRequired={handleVerificationRequired}
      onVerificationComplete={handleVerificationComplete}
    />
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
