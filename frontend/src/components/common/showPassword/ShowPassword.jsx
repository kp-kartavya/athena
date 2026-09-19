import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import "./showPassword.css";

function ShowPassword({
  value,
  onChange,
  placeholder = "Password",
  name,
  autoComplete,
  disabled = false,
  autoFocus = false,
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="show-password-field">
      <input
        type={showPassword ? "text" : "password"}
        className="auth-input show-password-input"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        name={name}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        disabled={disabled}
      />

      <button
        type="button"
        className="show-password-button"
        onClick={() => setShowPassword((previous) => !previous)}
        disabled={disabled}
        aria-label={showPassword ? "Hide password" : "Show password"}
        title={showPassword ? "Hide password" : "Show password"}
      >
        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}

export default ShowPassword;
