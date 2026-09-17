import { useRef, useState } from "react";
import "./login.css";
import logo from "../../assets/athena-logo.png";
import googleLogo from "../../assets/google.png";
import githubLogo from "../../assets/github.svg";
import ThemeToggle from "../theme/ThemeToggle";
import TurnstileWidget from "../turnstile/TurnstileWidget";
import LoadingWidget from "../loading/LoadingWidget";
import { getCsrfHeaders } from "../../api/csrf";

function Login({
  theme,
  onToggleTheme,
  onSignup,
  onForgotPassword,
  onGuest,
  onBack,
  modal = false,
}) {
  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [emailChecked, setEmailChecked] = useState(false);

  const [providers, setProviders] = useState([]);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [turnstileToken, setTurnstileToken] = useState("");

  const turnstileRef = useRef(null);

  const hasLocal = providers.includes("local");

  const hasGoogle = providers.includes("google");

  const hasGithub = providers.includes("github");

  const handleCheckEmail = async (event) => {
    event.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setError("Enter your email address.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/check-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getCsrfHeaders(),
        },
        credentials: "include",
        body: JSON.stringify({
          email: normalizedEmail,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(data.message || "Unable to check email.");
        return;
      }

      setProviders(data.providers || []);

      setEmailChecked(true);
      setPassword("");
      setTurnstileToken("");
      setError("");
    } catch {
      setError("Unable to connect to Athena.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (event) => {
    event.preventDefault();

    if (!password) {
      setError("Enter your password.");
      return;
    }

    if (!turnstileToken) {
      setError("Please complete the security check.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getCsrfHeaders(),
        },
        credentials: "include",
        body: JSON.stringify({
          email,
          password,
          turnstileToken,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(data.message || data.error || "Wrong email or password.");

        turnstileRef.current?.reset();
        setTurnstileToken("");

        return;
      }

      window.location.reload();
    } catch {
      setError("Unable to connect to Athena.");

      turnstileRef.current?.reset();
      setTurnstileToken("");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = "/oauth2/authorization/google";
  };

  const handleGithubLogin = () => {
    window.location.href = "/oauth2/authorization/github";
  };

  const handleForgotPassword = () => {
    setError("");

    onForgotPassword?.(email.trim().toLowerCase());
  };

  const handleBack = () => {
    setEmailChecked(false);
    setPassword("");
    setProviders([]);
    setTurnstileToken("");
    setError("");

    turnstileRef.current?.reset();

    onBack?.();
  };

  const handleGuest = () => {
    if (loading) {
      return;
    }

    setError("");
    onGuest?.();
  };

  return (
    <div className={`login-page ${modal ? "login-modal-content" : ""}`}>
      <LoadingWidget
        visible={loading}
        message={emailChecked ? "Signing in..." : "Checking email..."}
      />

      {!modal && (
        <div className="login-theme-toggle">
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        </div>
      )}

      <div className="login-card">
        <img src={logo} alt="Athena" className="login-logo" />

        <h1>Welcome to ATHENA</h1>

        <p>Technical Interview Assistant</p>

        {!emailChecked ? (
          <>
            <form onSubmit={handleCheckEmail}>
              <input
                type="email"
                className="auth-input"
                placeholder="Email address"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                autoFocus
                disabled={loading}
              />

              {error && <div className="auth-error">{error}</div>}

              <button type="submit" className="continue-btn" disabled={loading}>
                Continue
              </button>
            </form>

            <div className="auth-divider">
              <span>OR</span>
            </div>

            <button
              type="button"
              className="google-login-btn"
              onClick={handleGoogleLogin}
              disabled={loading}
            >
              <img src={googleLogo} alt="Google" className="oauth-icon" />
              Continue with Google
            </button>

            <button
              type="button"
              className="github-login-btn"
              onClick={handleGithubLogin}
              disabled={loading}
            >
              <img src={githubLogo} alt="GitHub" className="oauth-icon" />
              Continue with GitHub
            </button>

            <div className="signup-prompt">
              <span>Don't have an account?</span>

              <button type="button" onClick={onSignup} disabled={loading}>
                Sign up
              </button>
            </div>

            {!modal && (
              <>
                <div className="guest-divider">
                  <span>OR</span>
                </div>

                <button
                  type="button"
                  className="guest-login-btn"
                  onClick={handleGuest}
                  disabled={loading}
                >
                  Continue without an account
                </button>

                <div className="guest-note">
                  Guest conversations are not saved.
                </div>
              </>
            )}
          </>
        ) : (
          <>
            <div className="email-display">{email}</div>

            {hasLocal && (
              <form onSubmit={handleLogin}>
                <input
                  type="password"
                  className="auth-input"
                  placeholder="Password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  autoFocus
                  disabled={loading}
                />

                <div className="forgot-password-container">
                  <button
                    type="button"
                    className="forgot-password-button"
                    onClick={handleForgotPassword}
                    disabled={loading}
                  >
                    Forgot password?
                  </button>
                </div>

                <div className="login-turnstile-container">
                  <TurnstileWidget
                    ref={turnstileRef}
                    enabled={hasLocal}
                    theme={theme}
                    onToken={(token) => {
                      setTurnstileToken(token);
                      setError("");
                    }}
                    onError={(message) => {
                      setError(message);
                      setTurnstileToken("");
                    }}
                  />
                </div>

                {error && <div className="auth-error">{error}</div>}

                <button
                  type="submit"
                  className="continue-btn"
                  disabled={loading}
                >
                  Continue
                </button>
              </form>
            )}

            {hasGoogle && (
              <button
                type="button"
                className="google-login-btn"
                onClick={handleGoogleLogin}
                disabled={loading}
              >
                <img src={googleLogo} alt="Google" className="oauth-icon" />
                Continue with Google
              </button>
            )}

            {hasGithub && (
              <button
                type="button"
                className="github-login-btn"
                onClick={handleGithubLogin}
                disabled={loading}
              >
                <img src={githubLogo} alt="GitHub" className="oauth-icon" />
                Continue with GitHub
              </button>
            )}

            {!hasLocal && !hasGoogle && !hasGithub && (
              <button
                type="button"
                className="continue-btn"
                onClick={onSignup}
                disabled={loading}
              >
                Create account
              </button>
            )}

            <button
              type="button"
              className="back-btn"
              onClick={handleBack}
              disabled={loading}
            >
              ← Use a different email
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default Login;
