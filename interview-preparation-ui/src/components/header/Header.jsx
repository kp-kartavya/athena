import "./header.css";
import athenaLogo from "../../assets/athena-logo.png";

const Header = () => {
  return (
    <header className="app-header">

      {/* Left side - Logo + Branding */}
      <div className="header-brand">

        <img
          src={athenaLogo}
          alt="Athena"
          className="athena-logo"
        />

        <div className="brand-separator" />

        <div className="brand-content">
          <h1 className="brand-name">
            ATHENA
          </h1>

          <p className="brand-subtitle">
            TECHNICAL INTERVIEW ASSISTANT
          </p>
        </div>

      </div>

      {/* Right side - Developer */}
      <div className="developer-badge">

        <div className="developer-code">
          &lt;/&gt;
        </div>

        <div className="developer-divider" />

        <div className="developer-text">
          <span className="developer-label">
            BUILT &amp; DEVELOPED BY
          </span>

          <span className="developer-name">
            Kartavya Pandey
          </span>
        </div>

      </div>

    </header>
  );
};

export default Header;