import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  BrainCircuit,
  Fingerprint,
  Sparkles,
  Shield,
  Clock3,
  CheckCircle,
  AlertCircle,
  LoaderCircle,
} from "lucide-react";
import "./CreateMystery.css";

function CreateMystery() {
  const location = useLocation();
  const navigate = useNavigate();

  const initialCategory = location.state?.selectedMystery || "Locked Room";
  const initialDifficulty = location.state?.difficulty || "Beginner";

  const [category, setCategory] = useState(initialCategory);
  const [difficulty, setDifficulty] = useState(initialDifficulty);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedMystery, setGeneratedMystery] = useState(null);

  const categories = [
    "Locked Room",
    "Museum",
    "Mansion",
    "Office",
    "Secret Identity",
    "Historical",
  ];

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError("");
    setMessage("");
    setGeneratedMystery(null);

    try {
      const response = await fetch("http://localhost:5000/api/mysteries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          category,
          difficulty,
          title: title.trim(),
          description: description.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to generate your mystery.");
      }

      setGeneratedMystery(data.mystery);
      setMessage("Your mystery has been generated successfully!");
    } catch (err) {
      console.error("Mystery generation failed:", err);
      setError(
        err.message || "Unable to connect to the backend. Please try again.",
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const clearGeneratedMystery = () => {
    setGeneratedMystery(null);
    setMessage("");
    setError("");
  };

  return (
    <div className="create-page">
      <nav className="create-navbar">
        <div className="create-brand">
          <Fingerprint size={25} />
          MYSTERY<span>ROOM</span>
        </div>

        <button className="back-button" onClick={() => navigate("/")}>
          <ArrowLeft size={17} /> Back to Home
        </button>
      </nav>

      <main className="create-container">
        <div className="create-heading">
          <div className="create-eyebrow">
            <Sparkles size={15} />
            NEW INVESTIGATION
          </div>

          <h1>
            CREATE YOUR <span>MYSTERY.</span>
          </h1>

          <p>
            Every great detective story begins with a question. Configure your
            case and prepare to uncover the truth.
          </p>
        </div>

        <div className="creation-layout">
          <section className="creation-form">
            <div className="form-heading">
              <span>01</span>
              <div>
                <h2>Case Details</h2>
                <p>Give your mystery a unique identity.</p>
              </div>
            </div>

            <label htmlFor="case-title">MYSTERY TITLE (OPTIONAL)</label>
            <input
              id="case-title"
              type="text"
              placeholder="Example: The Midnight Disappearance"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                clearGeneratedMystery();
              }}
            />

            <label htmlFor="case-description">CUSTOM SCENARIO (OPTIONAL)</label>
            <textarea
              id="case-description"
              placeholder="Describe a setting or situation you'd like the AI to use..."
              rows="4"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                clearGeneratedMystery();
              }}
            />

            <div className="form-divider"></div>

            <div className="form-heading">
              <span>02</span>
              <div>
                <h2>Mystery Category</h2>
                <p>Choose the type of case you want to investigate.</p>
              </div>
            </div>

            <div className="category-options">
              {categories.map((item) => (
                <button
                  key={item}
                  type="button"
                  className={`category-option ${
                    category === item ? "active" : ""
                  }`}
                  onClick={() => {
                    setCategory(item);
                    clearGeneratedMystery();
                  }}
                >
                  {item}
                </button>
              ))}
            </div>

            <div className="form-divider"></div>

            <div className="form-heading">
              <span>03</span>
              <div>
                <h2>Investigation Difficulty</h2>
                <p>Decide how challenging the case should be.</p>
              </div>
            </div>

            <div className="difficulty-options-create">
              {[
                {
                  name: "Beginner",
                  detail: "A gentle introduction",
                },
                {
                  name: "Intermediate",
                  detail: "Think beyond the obvious",
                },
                {
                  name: "Expert",
                  detail: "A serious detective challenge",
                },
              ].map((item) => (
                <button
                  key={item.name}
                  type="button"
                  className={`difficulty-card ${
                    difficulty === item.name ? "active" : ""
                  }`}
                  onClick={() => {
                    setDifficulty(item.name);
                    clearGeneratedMystery();
                  }}
                >
                  <Shield size={20} />
                  <strong>{item.name}</strong>
                  <small>{item.detail}</small>
                </button>
              ))}
            </div>

            <button
              className="generate-button"
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <LoaderCircle size={19} className="loading-icon" />
                  Generating Mystery...
                </>
              ) : (
                <>
                  <BrainCircuit size={19} />
                  Generate Mystery
                  <ArrowRight size={18} />
                </>
              )}
            </button>

            {isGenerating && (
              <div className="creation-success">
                <Sparkles size={19} />
                <p>Gemini is creating your detective case. Please wait...</p>
              </div>
            )}

            {message && (
              <div className="creation-success">
                <CheckCircle size={19} />
                <p>{message}</p>
              </div>
            )}

            {error && (
              <div className="creation-error">
                <AlertCircle size={19} />
                <p>{error}</p>
              </div>
            )}
          </section>

          <aside className="case-preview">
            <div className="preview-top">
              <span>INVESTIGATION PREVIEW</span>
              <span className="preview-dot">● READY</span>
            </div>

            <div className="preview-art">
              <Fingerprint size={105} strokeWidth={0.8} />
            </div>

            <h2>CASE FILE</h2>

            <p className="preview-title">
              {generatedMystery?.title || title.trim() || "Untitled Mystery"}
            </p>

            <div className="preview-details">
              <div>
                <span>CATEGORY</span>
                <strong>{category}</strong>
              </div>

              <div>
                <span>DIFFICULTY</span>
                <strong>{difficulty}</strong>
              </div>

              <div>
                <span>STATUS</span>
                <strong>
                  {generatedMystery ? "GENERATED" : "NOT STARTED"}
                </strong>
              </div>
            </div>

            <div className="preview-note">
              <Clock3 size={17} />
              <p>
                Your investigation settings will be used to prepare the case.
              </p>
            </div>

            {generatedMystery && (
              <div className="generated-details">
                <h3>CASE GENERATED</h3>

                <p>{generatedMystery.introduction}</p>

                <div className="generated-counts">
                  <div>
                    <strong>{generatedMystery.suspects?.length || 0}</strong>
                    <span>Suspects</span>
                    <button
                      className="generate-button"
                      onClick={() =>
                        navigate(`/investigation/${generatedMystery.id}`)
                      }
                    >
                      Enter Investigation
                      <ArrowRight size={18} />
                    </button>
                  </div>

                  <div>
                    <strong>{generatedMystery.evidence?.length || 0}</strong>
                    <span>Evidence items</span>
                  </div>
                </div>
              </div>
            )}
          </aside>
        </div>
      </main>

      <footer className="create-footer">
        <span>MYSTERY ROOM</span>
        <span>EVERY DETAIL MATTERS.</span>
      </footer>
    </div>
  );
}

export default CreateMystery;
