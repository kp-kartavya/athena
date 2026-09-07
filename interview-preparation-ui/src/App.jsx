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
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        const response = await fetch("/api/auth/me", {
          credentials: "include",
        });

        if (!response.ok) {
          setAuthenticated(false);
          setCurrentUser(null);
          return;
        }

        const data = await response.json();

        setAuthenticated(data.authenticated);

        if (data.authenticated) {
          setCurrentUser({
            name: data.name,
            initial: data.initial,
          });
        } else {
          setCurrentUser(null);
        }
      } catch {
        setAuthenticated(false);
        setCurrentUser(null);
      }
    };

    loadCurrentUser();
  }, []);

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

  if (authenticated === null) {
    return null;
  }

  /*
   * Authenticated users always enter the actual chat.
   */
  if (authenticated) {
    if (location.pathname !== "/chat") {
      return <Navigate to="/chat" replace />;
    }

    return (
      <Chat
        theme={theme}
        onToggleTheme={toggleTheme}
        currentUser={currentUser}
      />
    );
  }

  /*
   * Guests cannot directly access the authenticated chat.
   */
  if (location.pathname === "/chat") {
    return <Navigate to="/" replace />;
  }

  return (
    <Routes>
      {/* =========================
          Guest Homepage
          ========================= */}
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

      {/* =========================
          Login Page
          ========================= */}
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

      {/* =========================
          Signup Page
          ========================= */}
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

      {/* =========================
          Email Verification
          ========================= */}
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

      {/* =========================
          Unknown Route
          ========================= */}
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
