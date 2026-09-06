import { useRef, useState } from "react";
import "./verifyEmail.css";
import logo from "../../assets/athena-logo.png";
import ThemeToggle from "../theme/ThemeToggle";
import TurnstileWidget from "../turnstile/TurnstileWidget";
import LoadingWidget from "../loading/LoadingWidget";
import { getCsrfHeaders } from "../../api/csrf";

function VerifyEmail({
  theme,
  onToggleTheme,
  name,
  email,
  onVerificationComplete,
}) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");

  const turnstileRef = useRef(null);

  const handleCodeChange = (event) => {
    const value = event.target.value.replace(/\D/g, "").slice(0, 6);

    setCode(value);
    setError("");
    setMessage("");
  };

  const handleVerify = async (event) => {
    event.preventDefault();

    if (code.length !== 6) {
      setError("Enter the 6-digit verification code.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getCsrfHeaders(),
        },
        credentials: "include",
        body: JSON.stringify({
          email,
          code,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(data.message || "Unable to verify your email.");
        return;
      }

      onVerificationComplete();
    } catch {
      setError("Unable to connect to Athena.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!turnstileToken) {
      setError("Please complete the security check.");
      return;
    }

    setResending(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/auth/resend-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getCsrfHeaders(),
        },
        credentials: "include",
        body: JSON.stringify({
          email,
          turnstileToken,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(data.message || "Unable to resend the code.");

        turnstileRef.current?.reset();
        setTurnstileToken("");

        return;
      }

      setCode("");
      setMessage("A new verification code has been sent.");

      turnstileRef.current?.reset();
      setTurnstileToken("");
    } catch {
      setError("Unable to connect to Athena.");

      turnstileRef.current?.reset();
      setTurnstileToken("");
    } finally {
      setResending(false);
    }
  };

  const isBusy = loading || resending;

  return (
    <div className="verify-email-page">
      <LoadingWidget
        visible={isBusy}
        message={
          loading ? "Verifying your email..." : "Sending verification code..."
        }
      />

      <div className="verify-email-theme-toggle">
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
      </div>

      <div className="verify-email-card">
        <img src={logo} alt="Athena" className="verify-email-logo" />

        <h1>Check your email</h1>

        <p>
          We sent a verification code to
          <strong>{email}</strong>
        </p>

        <form onSubmit={handleVerify}>
          <input
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            className="verification-code-input"
            placeholder="000000"
            value={code}
            onChange={handleCodeChange}
            maxLength={6}
            autoFocus
            disabled={isBusy}
          />

          {error && <div className="auth-error">{error}</div>}

          {message && <div className="auth-success">{message}</div>}

          <button type="submit" className="continue-btn" disabled={loading}>
            {loading ? "Verifying..." : "Verify email"}
          </button>
        </form>

        <div className="resend-security-check">
          <TurnstileWidget
            ref={turnstileRef}
            enabled={!loading}
            theme={theme}
            onToken={setTurnstileToken}
            onError={(message) => {
              setError(message);
            }}
          />
        </div>

        <button
          type="button"
          className="resend-btn"
          onClick={handleResend}
          disabled={resending || loading || !turnstileToken}
        >
          {resending ? "Sending..." : "Resend verification code"}
        </button>

        <div className="verification-footer">
          <span>Signing up as</span>
          <strong>{name}</strong>
        </div>
      </div>
    </div>
  );
}

export default VerifyEmail;
