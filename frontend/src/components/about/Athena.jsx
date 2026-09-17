import { ArrowLeft, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import "./athena.css";
import logo from "../../assets/athena-logo.png";
import github from "../../assets/github.svg";

const GITHUB_URL = "https://github.com/kp-kartavya/athena";

// Presents Athena's purpose, architecture, technologies, and project links.
function Athena() {
  return (
    <div className="about-athena-page">
      <header className="about-athena-header">
        <Link to="/" className="about-back-link">
          <ArrowLeft size={18} />
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
            <img src={github} alt="GitHub" className="about-github-icon" />
            View on GitHub
            <ExternalLink size={15} />
          </a>
        </section>

        <section className="about-section">
          <h2>What is Athena?</h2>

          <p>
            Athena is an AI-powered technical interview companion built to help
            developers prepare, practice, and hopefully survive the dreaded
            words: <strong>"Let's start with a simple question."</strong>
          </p>

          <p>
            Inspired by Athena, the Greek goddess associated with wisdom and
            strategy, this Athena is here for a slightly different battlefield:
            <strong> technical interviews.</strong>
          </p>

          <p>
            You can ask technical questions, explore concepts, practice common
            interview topics, and have an actual conversation instead of reading
            through a static list of answers.
          </p>
        </section>

        <section className="about-section">
          <h2>How does Athena work?</h2>

          <div className="about-flow">
            <div className="about-flow-step">
              <span>01</span>
              <h3>You ask</h3>
              <p>Ask Athena a technical or interview-related question.</p>
            </div>

            <div className="about-flow-arrow">→</div>

            <div className="about-flow-step">
              <span>02</span>
              <h3>Athena processes it</h3>
              <p>
                Your request is handled by the application backend and AI layer.
              </p>
            </div>

            <div className="about-flow-arrow">→</div>

            <div className="about-flow-step">
              <span>03</span>
              <h3>Athena responds</h3>
              <p>The answer is streamed back into the conversation.</p>
            </div>
          </div>

          <p className="about-explanation">
            The frontend provides the chat experience and handles things such as
            conversations, guest sessions, authentication, themes, and user
            interactions. The backend manages authentication, chat history,
            persistence, API requests, and communication with the AI layer. The
            generated response is streamed back into the conversation so you can
            start reading while Athena is still finishing the answer.
          </p>
        </section>

        <section className="about-section">
          <h2>The technologies Athena is built on</h2>

          <div className="technology-grid">
            <div className="technology-card">
              <h3>Frontend</h3>
              <p>React</p>
              <p>JavaScript</p>
              <p>Vite</p>
              <p>React Router</p>
              <p>CSS</p>
            </div>

            <div className="technology-card">
              <h3>Backend</h3>
              <p>Java</p>
              <p>Spring Boot</p>
              <p>Spring Security</p>
              <p>Spring Data JPA</p>
              <p>Spring AI</p>
            </div>

            <div className="technology-card">
              <h3>Data & AI</h3>
              <p>PostgreSQL</p>
              <p>PGVector</p>
              <p>Ollama</p>
              <p>Qwen</p>
            </div>

            <div className="technology-card">
              <h3>Deployment & Infrastructure</h3>
              <p>Docker</p>
              <p>Kubernetes</p>
              <p>AWS</p>
              <p>Nginx</p>
            </div>
          </div>
        </section>

        <section className="about-section">
          <h2>So... what can this goddess actually do?</h2>

          <div className="capability-grid">
            <div>💬 Interactive technical conversations</div>
            <div>📚 Interview question practice</div>
            <div>⚡ Streaming AI responses</div>
            <div>🧑‍💻 Guest conversations</div>
            <div>🔐 User authentication</div>
            <div>📝 Conversation history</div>
            <div>👍 Feedback</div>
            <div>🌙 Dark & light themes</div>
          </div>
        </section>

        <section className="about-section about-name-section">
          <h2>Why the name Athena?</h2>

          <p>
            Athena is the Greek goddess associated with wisdom and strategy. An
            interview preparation assistant built around those ideas felt like a
            pretty obvious name.
          </p>

          <p>
            Also, <strong>"Interview Preparation Bot"</strong> wasn't exactly
            winning any naming contests.
          </p>
        </section>

        <section className="about-github-section">
          <img src={github} alt="GitHub" className="about-github-icon" />

          <h2>Want to see what's under the armor?</h2>

          <p>
            Athena is open source. Explore the code, see how it works, and break
            something.
          </p>

          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="github-button"
          >
            <img src={github} alt="GitHub" className="about-github-icon" />
            View Athena on GitHub
            <ExternalLink size={15} />
          </a>
        </section>
      </main>
    </div>
  );
}

export default Athena;
