import { ArrowLeft, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import "./athena.css";
import logo from "../../assets/athena-logo.png";
import githubLogo from "../../assets/github.svg";
import awsLogo from "../../assets/aws-icon.svg";

// Presents Athena's purpose, architecture, technologies, and project link.
const GITHUB_URL = "https://github.com/kp-kartavya/athena";

const technologies = {
  Frontend: [
    ["https://cdn.simpleicons.org/react/61DAFB", "React"],
    ["https://cdn.simpleicons.org/javascript/F7DF1E", "JavaScript"],
    ["https://cdn.simpleicons.org/vite/646CFF", "Vite"],
    ["https://cdn.simpleicons.org/reactrouter/CA4245", "React Router"],
  ],
  Backend: [
    ["https://cdn.simpleicons.org/openjdk/FFFFFF", "Java"],
    ["https://cdn.simpleicons.org/springboot/6DB33F", "Spring Boot"],
    ["https://cdn.simpleicons.org/springsecurity/6DB33F", "Spring Security"],
    ["https://cdn.simpleicons.org/spring/6DB33F", "Spring AI"],
  ],
  "Data & AI": [
    ["https://cdn.simpleicons.org/postgresql/4169E1", "PostgreSQL"],
    ["https://cdn.simpleicons.org/postgresql/4169E1", "PGVector"],
    ["https://cdn.simpleicons.org/ollama/FFFFFF", "Ollama"],
  ],
  "Deployment & Infrastructure": [
    ["https://cdn.simpleicons.org/docker/2496ED", "Docker"],
    ["https://cdn.simpleicons.org/kubernetes/326CE5", "Kubernetes"],
    [awsLogo, "AWS"],
    ["https://cdn.simpleicons.org/nginx/009639", "Nginx"],
  ],
};

function Athena() {
  return (
    <div className="about-athena-page">
      <header className="about-athena-header">
        <Link to="/" className="about-back-link">
          <ArrowLeft size={17} />
          Back to Athena
        </Link>
      </header>

      <main className="about-athena-content">
        <section className="about-hero">
          <img src={logo} alt="Athena" className="about-athena-logo" />

          <p className="about-eyebrow">ATHENA</p>

          <h1>Technical Interview Assistant</h1>

          <p className="about-tagline">
            A little wisdom from Olympus. A lot of questions from Java.
          </p>

          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="github-button"
          >
            <img src={githubLogo} alt="GitHub" className="about-github-icon" />
            <span>View on GitHub</span>
            <ExternalLink size={14} />
          </a>
        </section>

        <section className="about-section">
          <div className="about-intro">
            <div>
              <h2>What is Athena?</h2>

              <p>
                Athena is an AI-powered technical interview companion built to
                help developers prepare, practice, and survive the dreaded
                words:
              </p>

              <p className="about-highlight">
                "Let's start with a simple question."
              </p>

              <p>
                Inspired by Athena, the Greek goddess of wisdom and strategy,
                this one fights battles of a slightly different kind:
                <strong> technical interviews.</strong>
              </p>
            </div>

            <div className="about-how">
              <h2>How it works</h2>

              <div className="about-flow">
                <div className="about-flow-step">
                  <span>01</span>
                  <strong>You ask</strong>
                  <p>Ask a technical question.</p>
                </div>

                <div className="about-flow-arrow">→</div>

                <div className="about-flow-step">
                  <span>02</span>
                  <strong>Athena thinks</strong>
                  <p>The backend sends it to the AI layer.</p>
                </div>

                <div className="about-flow-arrow">→</div>

                <div className="about-flow-step">
                  <span>03</span>
                  <strong>Athena answers</strong>
                  <p>The response streams back into the chat.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="about-section">
          <h2>The technologies Athena is built on</h2>

          <div className="technology-groups">
            {Object.entries(technologies).map(([groupName, items]) => (
              <div className="technology-group" key={groupName}>
                <h3>{groupName}</h3>

                <div className="technology-items">
                  {items.map(([icon, name]) => (
                    <div
                      className="technology-item"
                      key={`${groupName}-${name}`}
                    >
                      <img src={icon} alt={name} />
                      <span>{name}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="about-footer">
          <p>
            Built with wisdom, strategy, and a slightly unreasonable number of
            technical questions.
          </p>
        </section>
      </main>
    </div>
  );
}

export default Athena;
