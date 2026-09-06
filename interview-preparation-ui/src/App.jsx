import { useEffect, useState } from "react";
import "./App.css";
import Chat from "./components/chat/Chat";
import Login from "./components/login/Login";
import Signup from "./components/signup/Signup";
import VerifyEmail from "./components/verifyEmail/VerifyEmail";
import ForgotPassword from "./components/forgotPassword/ForgotPassword";
import ResetPassword from "./components/resetPassword/ResetPassword";
import LoadingWidget from "./components/loading/LoadingWidget";
import useAutoLogout from "./hooks/useAutoLogout";
import { initializeCsrf } from "./api/csrf";

const STORAGE_KEY = "interview-bot-theme";

const getSystemTheme = () =>
  window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

const getInitialTheme = () => {
  const savedTheme = localStorage.getItem(STORAGE_KEY);

  if (savedTheme === "dark" || savedTheme === "light") {
    return savedTheme;
  }

  return getSystemTheme();
};

function App() {
  const [authenticated, setAuthenticated] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [authScreen, setAuthScreen] = useState("login");
  const [verificationData, setVerificationData] = useState({
    name: "",
    email: "",
  });
  const [passwordResetEmail, setPasswordResetEmail] = useState("");
  const [theme, setTheme] = useState(getInitialTheme);

  useAutoLogout(authenticated === true);

  useEffect(() => {
    initializeCsrf().catch(() => {});
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);

    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        const response = await fetch("/api/auth/me");

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

  const toggleTheme = () => {
    setTheme((currentTheme) => (currentTheme === "dark" ? "light" : "dark"));
  };

  const handleSignup = () => {
    setAuthScreen("signup");
  };

  const handleBackToLogin = () => {
    setAuthScreen("login");
  };

  const handleVerificationRequired = (data) => {
    setVerificationData(data);
    setAuthScreen("verify");
  };

  const handleVerificationComplete = () => {
    setVerificationData({
      name: "",
      email: "",
    });

    setAuthScreen("login");
  };

  const handleForgotPassword = (email) => {
    setPasswordResetEmail(email || "");

    setAuthScreen("forgot-password");
  };

  const handleResetCodeSent = (email) => {
    setPasswordResetEmail(email);

    setAuthScreen("reset-password");
  };

  const handlePasswordResetComplete = () => {
    setPasswordResetEmail("");

    setAuthScreen("login");
  };

  if (authenticated === null) {
    return <LoadingWidget visible={true} message="Loading Athena..." />;
  }

  if (authenticated) {
    return (
      <Chat
        theme={theme}
        onToggleTheme={toggleTheme}
        currentUser={currentUser}
      />
    );
  }

  if (authScreen === "signup") {
    return (
      <Signup
        theme={theme}
        onToggleTheme={toggleTheme}
        onBackToLogin={handleBackToLogin}
        onVerificationRequired={handleVerificationRequired}
      />
    );
  }

  if (authScreen === "verify") {
    return (
      <VerifyEmail
        theme={theme}
        onToggleTheme={toggleTheme}
        name={verificationData.name}
        email={verificationData.email}
        onVerificationComplete={handleVerificationComplete}
      />
    );
  }

  if (authScreen === "forgot-password") {
    return (
      <ForgotPassword
        theme={theme}
        onToggleTheme={toggleTheme}
        email={passwordResetEmail}
        onBackToLogin={handleBackToLogin}
        onCodeSent={handleResetCodeSent}
      />
    );
  }

  if (authScreen === "reset-password") {
    return (
      <ResetPassword
        theme={theme}
        onToggleTheme={toggleTheme}
        email={passwordResetEmail}
        onBackToLogin={handleBackToLogin}
        onPasswordReset={handlePasswordResetComplete}
      />
    );
  }

  return (
    <Login
      theme={theme}
      onToggleTheme={toggleTheme}
      onSignup={handleSignup}
      onForgotPassword={handleForgotPassword}
    />
  );
}

export default App;
