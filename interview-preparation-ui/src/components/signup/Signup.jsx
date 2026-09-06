import { useEffect, useRef, useState } from "react";
import "./signup.css";
import logo from "../../assets/athena-logo.png";
import ThemeToggle from "../theme/ThemeToggle";
import LoadingWidget from "../loading/LoadingWidget";
import { getCsrfHeaders } from "../../api/csrf";

function Signup({
  theme,
  onToggleTheme,
  onBackToLogin,
  onVerificationRequired,
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const turnstileRef = useRef(null);
  const widgetIdRef = useRef(null);

  useEffect(() => {
    const renderTurnstile = () => {
      if (
        !window.turnstile ||
        !turnstileRef.current ||
        widgetIdRef.current !== null
      ) {
        return;
      }

      widgetIdRef.current = window.turnstile.render(turnstileRef.current, {
        sitekey: import.meta.env.VITE_TURNSTILE_SITE_KEY,
        theme,
        callback: (token) => {
          setTurnstileToken(token);
          setError("");
        },
        "expired-callback": () => {
          setTurnstileToken("");
        },
        "error-callback": () => {
          setTurnstileToken("");
          setError("Security verification failed. Please try again.");
        },
      });
    };

    if (window.turnstile) {
      renderTurnstile();
      return;
    }

    const interval = setInterval(() => {
      if (window.turnstile) {
        clearInterval(interval);
        renderTurnstile();
      }
    }, 100);

    return () => {
      clearInterval(interval);

      if (window.turnstile && widgetIdRef.current !== null) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [theme]);

  const resetTurnstile = () => {
    setTurnstileToken("");

    if (window.turnstile && widgetIdRef.current !== null) {
      window.turnstile.reset(widgetIdRef.current);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    const normalizedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedName) {
      setError("Enter your name.");
      return;
    }

    if (!normalizedEmail) {
      setError("Enter your email address.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!turnstileToken) {
      setError("Please complete the security check.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getCsrfHeaders(),
        },
        credentials: "include",
        body: JSON.stringify({
          name: normalizedName,
          email: normalizedEmail,
          password,
          turnstileToken,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(data.message || "Unable to create your account.");
        resetTurnstile();
        return;
      }

      onVerificationRequired({
        name: normalizedName,
        email: normalizedEmail,
      });
    } catch {
      setError("Unable to connect to Athena.");
      resetTurnstile();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-page">
      <LoadingWidget visible={loading} message="Creating your account..." />

      <div className="signup-theme-toggle">
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
      </div>

      <div className="signup-card">
        <img src={logo} alt="Athena" className="signup-logo" />

        <h1>Create your account</h1>

        <p>Start preparing for your technical interviews.</p>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            className="auth-input"
            placeholder="Full name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            autoComplete="name"
            autoFocus
            disabled={loading}
          />

          <input
            type="email"
            className="auth-input"
            placeholder="Email address"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            disabled={loading}
          />

          <input
            type="password"
            className="auth-input"
            placeholder="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="new-password"
            disabled={loading}
          />

          <input
            type="password"
            className="auth-input"
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            autoComplete="new-password"
            disabled={loading}
          />

          <div className="turnstile-container" ref={turnstileRef} />

          {error && <div className="auth-error">{error}</div>}

          <button type="submit" className="continue-btn" disabled={loading}>
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <div className="login-prompt">
          Already have an account?
          <button type="button" onClick={onBackToLogin} disabled={loading}>
            Log in
          </button>
        </div>
      </div>
    </div>
  );
}

export default Signup;
