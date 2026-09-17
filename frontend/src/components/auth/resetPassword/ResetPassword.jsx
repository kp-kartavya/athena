import { useEffect, useRef, useState } from "react";
import "./resetPassword.css";
import logo from "../../../assets/athena-logo.png";
import ThemeToggle from "../../common/theme/ThemeToggle";
import TurnstileWidget from "../../common/turnstile/TurnstileWidget";
import LoadingWidget from "../loading/LoadingWidget";
import { getCsrfHeaders } from "../../../api/csrf";

function ResetPassword({
  theme,
  onToggleTheme,
  email,
  onBackToLogin,
  onPasswordReset,
}) {
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [resendMessage, setResendMessage] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [turnstileToken, setTurnstileToken] = useState("");

  const turnstileRef = useRef(null);

  useEffect(() => {
    if (resendCooldown <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setResendCooldown((previous) => (previous > 0 ? previous - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmedCode = code.trim();

    if (!/^\d{6}$/.test(trimmedCode)) {
      setError("Please enter the 6-digit verification code.");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (newPassword.length > 72) {
      setError("Password cannot exceed 72 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError("");
    setResendMessage("");

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getCsrfHeaders(),
        },
        credentials: "include",
        body: JSON.stringify({
          email,
          code: trimmedCode,
          newPassword,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(
          data.message || data.error || "Unable to reset your password.",
        );
        return;
      }

      setSuccess(true);
    } catch {
      setError("Unable to connect to Athena. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0) {
      return;
    }

    if (!turnstileToken) {
      setError("Please complete the security check.");
      return;
    }

    setResending(true);
    setError("");
    setResendMessage("");

    try {
      const response = await fetch("/api/auth/resend-password-reset-code", {
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
        setError(
          data.message ||
            data.error ||
            "Unable to resend the verification code.",
        );

        turnstileRef.current?.reset();
        setTurnstileToken("");
        return;
      }

      setCode("");

      setResendMessage("A new verification code has been sent.");

      setResendCooldown(60);

      turnstileRef.current?.reset();
      setTurnstileToken("");
    } catch {
      setError("Unable to connect to Athena. Please try again.");

      turnstileRef.current?.reset();
      setTurnstileToken("");
    } finally {
      setResending(false);
    }
  };

  if (success) {
    return (
      <div className="reset-password-page">
        <div className="reset-password-theme-toggle">
          <ThemeToggle theme={theme} onToggleTheme={onToggleTheme} />
        </div>

        <div className="reset-password-card">
          <div className="reset-password-success-icon">✓</div>

          <h1>Password reset successful</h1>

          <p className="reset-password-success-text">
            Your password has been updated successfully. You can now log in with
            your new password.
          </p>

          <button
            type="button"
            className="reset-password-submit"
            onClick={onPasswordReset}
          >
            Back to login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="reset-password-page">
      <LoadingWidget
        visible={loading || resending}
        message={
          resending
            ? "Sending new verification code..."
            : "Resetting your password..."
        }
      />

      <div className="reset-password-theme-toggle">
        <ThemeToggle theme={theme} onToggleTheme={onToggleTheme} />
      </div>

      <div className="reset-password-card">
        <img src={logo} alt="Athena" className="reset-password-logo" />

        <h1>Reset password</h1>

        <p className="reset-password-subtitle">
          Enter the verification code sent to
          <br />
          <strong>{email}</strong>
        </p>

        <form onSubmit={handleSubmit}>
          <div className="reset-password-field">
            <label htmlFor="reset-code">Verification code</label>

            <input
              id="reset-code"
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={(event) =>
                setCode(event.target.value.replace(/\D/g, "").slice(0, 6))
              }
              placeholder="Enter 6-digit code"
              autoComplete="one-time-code"
              autoFocus
              disabled={loading || resending}
            />
          </div>

          <div className="reset-password-field">
            <label htmlFor="new-password">New password</label>

            <input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              placeholder="Enter new password"
              autoComplete="new-password"
              disabled={loading || resending}
            />
          </div>

          <div className="reset-password-field">
            <label htmlFor="confirm-password">Confirm password</label>

            <input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Confirm new password"
              autoComplete="new-password"
              disabled={loading || resending}
            />
          </div>

          <div className="reset-password-hint">
            Password must be 8–72 characters.
          </div>

          <div className="reset-password-turnstile">
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

          {error && <div className="reset-password-error">{error}</div>}

          {resendMessage && (
            <div className="reset-password-success-message">
              {resendMessage}
            </div>
          )}

          <button
            type="submit"
            className="reset-password-submit"
            disabled={loading || resending}
          >
            Reset password
          </button>
        </form>

        <div className="reset-password-resend">
          <span>Didn't receive the code?</span>

          <button
            type="button"
            onClick={handleResendCode}
            disabled={loading || resending || resendCooldown > 0}
          >
            {resendCooldown > 0
              ? `Resend in ${resendCooldown}s`
              : "Resend code"}
          </button>
        </div>

        <button
          type="button"
          className="reset-password-back"
          onClick={onBackToLogin}
          disabled={loading || resending}
        >
          ← Back to login
        </button>
      </div>
    </div>
  );
}

export default ResetPassword;
