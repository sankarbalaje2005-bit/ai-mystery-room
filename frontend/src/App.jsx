import { Routes, Route } from "react-router-dom";
import CreateMystery from "./CreateMystery";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import InvestigationRoom from "./InvestigationRoom";
import {
  ArrowRight,
  BrainCircuit,
  Clock3,
  Fingerprint,
  LockKeyhole,
  Search,
  Shield,
  Sparkles,
  Target,
} from "lucide-react";
import "./App.css";

const mysteries = [
  {
    id: 1,
    title: "The Locked Room",
    description: "A mysterious incident. A locked door. Five possible suspects.",
    category: "Locked Room",
    icon: LockKeyhole,
  },
  {
    id: 2,
    title: "The Missing Artifact",
    description: "A priceless artifact has disappeared from a secure museum.",
    category: "Museum",
    icon: Search,
  },
  {
    id: 3,
    title: "The Mansion Secret",
    description: "Uncover hidden connections inside an isolated mansion.",
    category: "Mansion",
    icon: Fingerprint,
  },
];

function Home() {
  const [selectedMystery, setSelectedMystery] = useState("Locked Room");
  const [difficulty, setDifficulty] = useState("Beginner");
  const [started, setStarted] = useState(false);
  const navigate = useNavigate();

 const startInvestigation = () => {
  navigate("/create-mystery", {
    state: {
      selectedMystery,
      difficulty,
    },
  });
};

  return (
    <div className="app">
      <nav className="navbar">
        <a className="brand" href="/">
          <span className="brand-icon">
            <Fingerprint size={25} />
          </span>
          <span>
            MYSTERY<span className="gold-text">ROOM</span>
          </span>
        </a>

        <div className="nav-right">
          <span className="nav-status">
            <span className="status-dot"></span>
            AI DETECTIVE SYSTEM
          </span>
          <button className="nav-button" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            <Shield size={16} /> Detective Hub
          </button>
        </div>
      </nav>

      <main>
        <section className="hero">
          <div className="hero-content">
            <div className="eyebrow">
              <Sparkles size={15} /> INTELLIGENCE MEETS INVESTIGATION
            </div>

            <h1>
              EVERY CLUE
              <br />
              TELLS A <span className="gold-text">STORY.</span>
            </h1>

            <p className="hero-description">
              Step into the world of mystery. Investigate suspicious incidents,
              analyse evidence, question suspects, and uncover the truth.
            </p>

            <div className="hero-actions">
              <button
                className="primary-button"
                onClick={() =>
                  document.getElementById("case-selection").scrollIntoView({
                    behavior: "smooth",
                  })
                }
              >
                Start Exploring <ArrowRight size={18} />
              </button>

              <div className="hero-note">
                <BrainCircuit size={17} />
                <span>Powered by Artificial Intelligence</span>
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <div className="visual-glow"></div>
            <div className="visual-card">
              <div className="visual-top">
                <span>CASE FILE #001</span>
                <span className="case-open">● OPEN</span>
              </div>

              <div className="fingerprint-art">
                <Fingerprint size={155} strokeWidth={0.8} />
              </div>

              <div className="visual-bottom">
                <div>
                  <span className="visual-label">CLASSIFICATION</span>
                  <h3>TOP SECRET</h3>
                </div>
                <LockKeyhole size={27} />
              </div>
            </div>

            <div className="floating-tag tag-one">
              <Search size={15} /> Evidence detected
            </div>
            <div className="floating-tag tag-two">
              <Target size={15} /> Case unresolved
            </div>
          </div>
        </section>

        <section className="stats">
          <div className="stat-item">
            <Fingerprint size={22} />
            <div>
              <strong>AI GENERATED</strong>
              <span>Unique mystery cases</span>
            </div>
          </div>
          <div className="stat-item">
            <Search size={22} />
            <div>
              <strong>INVESTIGATE</strong>
              <span>Discover hidden clues</span>
            </div>
          </div>
          <div className="stat-item">
            <Clock3 size={22} />
            <div>
              <strong>YOUR CHALLENGE</strong>
              <span>Think like a detective</span>
            </div>
          </div>
        </section>

        <section className="case-section" id="case-selection">
          <div className="section-heading">
            <div>
              <span className="section-label">YOUR NEXT CHALLENGE</span>
              <h2>Choose Your Mystery</h2>
              <p>Select a case type to begin your investigation.</p>
            </div>
            <span className="case-count">03 CASE TYPES</span>
          </div>

          <div className="mystery-grid">
            {mysteries.map((mystery) => {
              const Icon = mystery.icon;
              const isSelected = selectedMystery === mystery.category;

              return (
                <button
                  className={`mystery-card ${isSelected ? "selected" : ""}`}
                  key={mystery.id}
                  onClick={() => {
                    setSelectedMystery(mystery.category);
                    setStarted(false);
                  }}
                >
                  <div className="card-icon">
                    <Icon size={25} />
                  </div>
                  <span className="card-number">
                    CASE TYPE 0{mystery.id}
                  </span>
                  <h3>{mystery.title}</h3>
                  <p>{mystery.description}</p>
                  <div className="card-footer">
                    <span>{isSelected ? "SELECTED" : "SELECT CASE"}</span>
                    <ArrowRight size={17} />
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <section className="difficulty-section">
          <div>
            <span className="section-label">SET YOUR CHALLENGE</span>
            <h2>Choose Difficulty</h2>
            <p>How challenging should your investigation be?</p>
          </div>

          <div className="difficulty-options">
            {["Beginner", "Intermediate", "Expert"].map((level) => (
              <button
                key={level}
                className={`difficulty-button ${difficulty === level ? "active" : ""}`}
                onClick={() => {
                  setDifficulty(level);
                  setStarted(false);
                }}
              >
                {level}
              </button>
            ))}
          </div>
        </section>

        <section className="launch-section">
          <div>
            <span className="section-label">READY, DETECTIVE?</span>
            <h2>Your investigation starts here.</h2>
            <p>
              Selected case: <strong>{selectedMystery}</strong>
              {" · "}
              Difficulty: <strong>{difficulty}</strong>
            </p>
          </div>

          <button className="primary-button launch-button" onClick={startInvestigation}>
            Start Investigation <ArrowRight size={18} />
          </button>
        </section>

        {started && (
          <div className="launch-message">
            <Sparkles size={19} />
            <div>
              <strong>Investigation configuration saved!</strong>
              <p>
                Your {difficulty.toLowerCase()} {selectedMystery.toLowerCase()} case
                is selected. AI case generation will be connected in a later phase.
              </p>
            </div>
          </div>
        )}
      </main>

      <footer>
        <a className="brand footer-brand" href="/">
          <Fingerprint size={20} />
          MYSTERY<span className="gold-text">ROOM</span>
        </a>
        <span>THINK SHARPER. FIND THE TRUTH.</span>
        <span>© 2026 AI Mystery Room</span>
      </footer>
    </div>
  );
}

function App() {
  return (
   <Routes>
  <Route path="/" element={<Home />} />
  <Route path="/create-mystery" element={<CreateMystery />} />
  <Route
    path="/investigation/:id"
    element={<InvestigationRoom />}
  />
</Routes>
  );
}

export default App;
