import { useEffect, useState } from "react";

import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";

import "./App.css";

import Chat from "./components/chat/Chat";
import GuestChat from "./components/guestChat/GuestChat";
import Login from "./components/login/Login";
import Signup from "./components/signup/Signup";
import VerifyEmail from "./components/verifyEmail/VerifyEmail";

import { initializeCsrf } from "./api/csrf";
import { transferGuestChats } from "./api/recentChats";
import { clearGuestSessionId } from "./api/guestSession";

const STORAGE_KEY = "interview-bot-theme";

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
  const navigate = useNavigate();
  const location = useLocation();

  const [authenticated, setAuthenticated] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  const [verificationData, setVerificationData] = useState({
    name: "",
    email: "",
  });

  const [theme, setTheme] = useState(getInitialTheme);

  const toggleTheme = () => {
    setTheme((currentTheme) => (currentTheme === "dark" ? "light" : "dark"));
  };

  useEffect(() => {
    console.log("Hi its kartavya");

    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  // =========================================================
  // APPLICATION INITIALIZATION
  // =========================================================

  useEffect(() => {
    let cancelled = false;

    const initializeApplication = async () => {
      // -------------------------------------------------------
      // 1. Initialize CSRF
      // -------------------------------------------------------

      try {
        await initializeCsrf();
      } catch (error) {
        console.error("Failed to initialize CSRF protection:", error);
      }

      if (cancelled) {
        return;
      }

      // -------------------------------------------------------
      // 2. Check current authentication state
      // -------------------------------------------------------

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
      } catch (error) {
        console.error("Failed to load current user:", error);

        if (!cancelled) {
          setAuthenticated(false);
          setCurrentUser(null);
        }

        return;
      }

      if (cancelled) {
        return;
      }

      // -------------------------------------------------------
      // 3. Transfer guest chats to authenticated account
      // -------------------------------------------------------

      try {
        const guestSessionId = localStorage.getItem("athena_guest_session_id");

        if (guestSessionId) {
          const result = await transferGuestChats(guestSessionId);

          console.log(
            `Transferred ${
              result?.transferredCount ?? 0
            } guest chat(s) to the authenticated user.`,
          );

          // Only remove the guest session after the backend
          // confirms the transfer request succeeded.
          clearGuestSessionId();
        }
      } catch (error) {
        console.error("Failed to transfer guest chats:", error);

        // Keep the guest session ID when transfer fails.
        // A later application load can retry the transfer.
      }

      if (cancelled) {
        return;
      }

      // -------------------------------------------------------
      // 4. Now mark the application authenticated
      // -------------------------------------------------------

      setAuthenticated(true);
    };

    initializeApplication();

    return () => {
      cancelled = true;
    };
  }, []);

  // =========================================================
  // NAVIGATION
  // =========================================================

  const handleSignup = () => {
    navigate("/signup");
  };

  const handleGuest = () => {
    navigate("/");
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  const handleVerificationRequired = (data) => {
    setVerificationData(data);
    navigate("/verify-email");
  };

  const handleVerificationComplete = () => {
    setVerificationData({
      name: "",
      email: "",
    });

    navigate("/login");
  };

  // =========================================================
  // LOADING STATE
  // =========================================================

  console.log("AUTHENTICATED STATE:", authenticated);

  if (authenticated === null) {
    return null;
  }

  // =========================================================
  // AUTHENTICATED APP
  // =========================================================

  if (authenticated) {
    if (location.pathname !== "/chat") {
      return <Navigate to="/chat" replace />;
    }

    console.log("🔥 AUTHENTICATED CHAT IS BEING RENDERED");

    return (
      <Chat
        theme={theme}
        onToggleTheme={toggleTheme}
        currentUser={currentUser}
      />
    );
  }

  // =========================================================
  // GUEST APP
  // =========================================================

  if (location.pathname === "/chat") {
    return <Navigate to="/" replace />;
  }

  console.log("🔥 GUEST CHAT IS BEING RENDERED");

  return (
    <Routes>
      <Route
        path="/"
        element={
          <GuestChat
            theme={theme}
            onToggleTheme={toggleTheme}
            onVerificationRequired={handleVerificationRequired}
          />
        }
      />

      <Route
        path="/login"
        element={
          <Login
            theme={theme}
            onToggleTheme={toggleTheme}
            onSignup={handleSignup}
            onGuest={handleGuest}
            onBack={handleBack}
          />
        }
      />

      <Route
        path="/signup"
        element={
          <Signup
            theme={theme}
            onToggleTheme={toggleTheme}
            onBackToLogin={() => navigate("/login")}
            onVerificationRequired={handleVerificationRequired}
          />
        }
      />

      <Route
        path="/verify-email"
        element={
          <VerifyEmail
            theme={theme}
            onToggleTheme={toggleTheme}
            name={verificationData.name}
            email={verificationData.email}
            onVerificationComplete={handleVerificationComplete}
          />
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
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
