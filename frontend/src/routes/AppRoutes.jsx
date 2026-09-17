import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import Chat from "../components/chatFeatures/chat/Chat";
import GuestChat from "../components/chatFeatures/guestChat/GuestChat";
import Login from "../components/auth/login/Login";
import Signup from "../components/auth/signup/Signup";
import VerifyEmail from "../components/auth/verifyEmail/VerifyEmail";
import Athena from "../components/about/Athena";

// Handles authenticated and guest routes, navigation, and route-specific handlers.
function AppRoutes({
  authenticated,
  currentUser,
  theme,
  onToggleTheme,
  verificationData,
  onVerificationRequired,
  onVerificationComplete,
}) {
  const navigate = useNavigate();
  const location = useLocation();

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
    onVerificationRequired(data);
    navigate("/verify-email");
  };

  const handleVerificationComplete = () => {
    onVerificationComplete();
    navigate("/login");
  };

  if (authenticated === null) {
    return null;
  }
  if (location.pathname === "/about") {
    return <Athena />;
  }

  if (authenticated) {
    if (location.pathname !== "/chat") {
      return <Navigate to="/chat" replace />;
    }

    return (
      <Chat
        theme={theme}
        onToggleTheme={onToggleTheme}
        currentUser={currentUser}
      />
    );
  }

  if (location.pathname === "/chat") {
    return <Navigate to="/" replace />;
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          <GuestChat
            theme={theme}
            onToggleTheme={onToggleTheme}
            onVerificationRequired={handleVerificationRequired}
          />
        }
      />

      <Route
        path="/login"
        element={
          <Login
            theme={theme}
            onToggleTheme={onToggleTheme}
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
            onToggleTheme={onToggleTheme}
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
            onToggleTheme={onToggleTheme}
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

export default AppRoutes;
