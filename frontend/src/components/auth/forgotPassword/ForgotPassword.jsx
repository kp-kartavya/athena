import { useRef, useState } from "react";
import "./forgotPassword.css";
import logo from "../../../assets/athena-logo.png";
import ThemeToggle from "../../common/theme/ThemeToggle";
import TurnstileWidget from "../../common/turnstile/TurnstileWidget";
import LoadingWidget from "../loading/LoadingWidget";
import { getCsrfHeaders } from "../../../api/csrf";

function ForgotPassword({
  theme,
  onToggleTheme,
  email: initialEmail,
  onBackToLogin,
  onCodeSent,
}) {
  const [email, setEmail] = useState(initialEmail || "");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [turnstileToken, setTurnstileToken] = useState("");

  const turnstileRef = useRef(null);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setError("Please enter your email address.");
      return;
    }

    if (!turnstileToken) {
      setError("Please complete the verification.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getCsrfHeaders(),
        },
        credentials: "include",
        body: JSON.stringify({
          email: normalizedEmail,
          turnstileToken,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(
          data.message ||
            data.error ||
            "Unable to process the password reset request.",
        );

        turnstileRef.current?.reset();
        setTurnstileToken("");
        return;
      }

      onCodeSent(normalizedEmail);
    } catch {
      setError("Unable to connect to Athena. Please try again.");

      turnstileRef.current?.reset();
      setTurnstileToken("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-page">
      <LoadingWidget visible={loading} message="Sending verification code..." />

      <div className="forgot-password-theme-toggle">
        <ThemeToggle theme={theme} onToggleTheme={onToggleTheme} />
      </div>

      <div className="forgot-password-card">
        <img src={logo} alt="Athena" className="forgot-password-logo" />

        <h1>Forgot password?</h1>

        <p className="forgot-password-subtitle">
          Enter your email address and we'll send you a verification code to
          reset your password.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="forgot-password-field">
            <label htmlFor="forgot-email">Email address</label>

            <input
              id="forgot-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Enter your email"
              autoComplete="email"
              autoFocus
              disabled={loading}
            />
          </div>

          <div className="forgot-password-turnstile">
            <TurnstileWidget
              ref={turnstileRef}
              enabled={true}
              theme={theme}
              onToken={(token) => {
                setTurnstileToken(token);
                setError("");
              }}
              onError={(message) => {
                setTurnstileToken("");
                setError(message);
              }}
            />
          </div>

          {error && <div className="forgot-password-error">{error}</div>}

          <button
            type="submit"
            className="forgot-password-submit"
            disabled={loading}
          >
            Send verification code
          </button>
        </form>

        <button
          type="button"
          className="forgot-password-back"
          onClick={onBackToLogin}
          disabled={loading}
        >
          ← Back to login
        </button>
      </div>
    </div>
  );
}

export default ForgotPassword;
