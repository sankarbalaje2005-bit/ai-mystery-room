import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Fingerprint,
  Search,
  Shield,
  FileText,
  LoaderCircle,
  AlertCircle,
  Lock,
  Unlock,
  Eye,
  Lightbulb,
  CheckCircle2,
} from "lucide-react";
import "./InvestigationRoom.css";

// Local development fallback; deployed URL comes from frontend/.env
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function InvestigationRoom() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [mystery, setMystery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [discoveringId, setDiscoveringId] = useState(null);
  const [discoveryError, setDiscoveryError] = useState("");

  const [hintStatus, setHintStatus] = useState({
    limit: 0,
    used: 0,
    remaining: 0,
  });
  const [revealedHints, setRevealedHints] = useState([]);
  const [loadingHint, setLoadingHint] = useState(false);
  const [hintError, setHintError] = useState("");

  // Load the mystery and current investigation progress.
  useEffect(() => {
    const fetchMystery = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_BASE_URL}/api/mysteries/${id}`);

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Unable to load mystery.");
        }

        setMystery(data.mystery);

        setHintStatus(data.hintStatus || { limit: 0, used: 0, remaining: 0 });

        setRevealedHints(data.revealedHints || []);
      } catch (err) {
        setError(err.message || "Unable to load mystery.");
      } finally {
        setLoading(false);
      }
    };

    fetchMystery();
  }, [id]);

  // Discover an individual evidence item.
  const discoverEvidence = async (evidenceId) => {
    try {
      setDiscoveringId(evidenceId);
      setDiscoveryError("");

      const response = await fetch(
        `${API_BASE_URL}/api/mysteries/${id}/evidence/${evidenceId}/discover`,
        {
          method: "POST",
        },
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to discover this evidence.");
      }

      setMystery((previousMystery) => ({
        ...previousMystery,
        evidence: previousMystery.evidence.map((item) =>
          item.id === evidenceId
            ? { ...data.evidence, discovered: true }
            : item,
        ),
      }));
    } catch (err) {
      setDiscoveryError(err.message || "Unable to discover this evidence.");
    } finally {
      setDiscoveringId(null);
    }
  };

  // Request the next hint from the backend.
  const requestHint = async () => {
    try {
      setLoadingHint(true);
      setHintError("");

      const response = await fetch(`${API_BASE_URL}/api/mysteries/${id}/hint`, {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        if (data.hintStatus) {
          setHintStatus(data.hintStatus);
        }

        throw new Error(data.message || "Unable to retrieve the next hint.");
      }

      // The API may return the hint as a string or object.
      const hintValue = data.hint;

      const hintText =
        typeof hintValue === "string"
          ? hintValue
          : hintValue?.text || hintValue?.hint || hintValue?.content || "";

      if (!hintText) {
        throw new Error("The server returned an empty hint. Please try again.");
      }

      const hintNumber =
        hintValue && typeof hintValue === "object" && hintValue.number
          ? hintValue.number
          : (data.hintStatus?.used ?? hintStatus.used + 1);

      setRevealedHints((previousHints) => [
        ...previousHints,
        {
          number: hintNumber,
          text: hintText,
        },
      ]);

      if (data.hintStatus) {
        setHintStatus(data.hintStatus);
      } else {
        setHintStatus((previousStatus) => ({
          ...previousStatus,
          used: previousStatus.used + 1,
          remaining: Math.max(0, previousStatus.remaining - 1),
        }));
      }
    } catch (err) {
      setHintError(err.message || "Unable to retrieve the next hint.");
    } finally {
      setLoadingHint(false);
    }
  };

  if (loading) {
    return (
      <div className="investigation-loading">
        <LoaderCircle size={35} className="loading-icon" />
        <h2>Opening Case File...</h2>
        <p>Preparing your investigation.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="investigation-loading">
        <AlertCircle size={35} />
        <h2>Case unavailable</h2>
        <p>{error}</p>
        <button onClick={() => navigate("/")}>Back to Home</button>
      </div>
    );
  }

  const discoveredCount = mystery.evidence.filter(
    (item) => item.discovered,
  ).length;

  const hintsExhausted = hintStatus.remaining <= 0;

  return (
    <div className="investigation-page">
      <nav className="investigation-navbar">
        <div className="create-brand">
          <Fingerprint size={25} />
          MYSTERY<span>ROOM</span>
        </div>

        <button className="back-button" onClick={() => navigate("/")}>
          <ArrowLeft size={17} />
          Exit Investigation
        </button>
      </nav>

      <main className="investigation-container">
        <div className="investigation-heading">
          <span className="investigation-eyebrow">
            <Search size={15} />
            ACTIVE INVESTIGATION
          </span>

          <h1>{mystery.title}</h1>

          <p>
            {mystery.category} · {mystery.difficulty} Difficulty
          </p>
        </div>

        <section className="case-briefing">
          <div className="section-title">
            <FileText size={22} />
            <h2>CASE BRIEFING</h2>
          </div>

          <p>{mystery.introduction}</p>

          <div className="case-setting">
            <strong>LOCATION / SETTING</strong>
            <p>{mystery.setting}</p>
          </div>
        </section>

        <section className="investigation-section">
          <div className="section-title">
            <Shield size={22} />
            <h2>PERSONS OF INTEREST</h2>
            <span>{mystery.suspects.length} SUSPECTS</span>
          </div>

          <div className="suspect-grid">
            {mystery.suspects.map((suspect, index) => (
              <article className="suspect-card" key={suspect.id}>
                <div className="suspect-number">SUSPECT 0{index + 1}</div>

                <div className="suspect-icon">
                  <Shield size={28} />
                </div>

                <h3>{suspect.name}</h3>
                <p>{suspect.description}</p>

                <div className="suspect-alibi">
                  <strong>ALIBI</strong>
                  <p>{suspect.alibi}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="investigation-section">
          <div className="section-title">
            <Fingerprint size={22} />
            <h2>EVIDENCE REGISTER</h2>

            <span>
              {discoveredCount}/{mystery.evidence.length} DISCOVERED
            </span>
          </div>

          {discoveryError && (
            <div className="evidence-error">
              <AlertCircle size={18} />
              {discoveryError}
            </div>
          )}

          <div className="evidence-grid">
            {mystery.evidence.map((item, index) => (
              <article
                className={`evidence-card ${
                  item.discovered ? "evidence-discovered" : "evidence-locked"
                }`}
                key={item.id}
              >
                <div className="evidence-card-header">
                  <span>EVIDENCE 0{index + 1}</span>

                  {item.discovered ? <Unlock size={19} /> : <Lock size={19} />}
                </div>

                <h3>{item.title}</h3>

                {item.discovered ? (
                  <>
                    <p>{item.description}</p>

                    <span className="discovered-label">
                      <Eye size={15} />
                      CLUE DISCOVERED
                    </span>
                  </>
                ) : (
                  <>
                    <p className="locked-description">
                      This evidence has not been examined yet.
                    </p>

                    <button
                      className="discover-button"
                      onClick={() => discoverEvidence(item.id)}
                      disabled={discoveringId !== null}
                    >
                      {discoveringId === item.id ? (
                        <>
                          <LoaderCircle size={17} className="loading-icon" />
                          Examining...
                        </>
                      ) : (
                        <>
                          <Search size={17} />
                          Discover Evidence
                        </>
                      )}
                    </button>
                  </>
                )}
              </article>
            ))}
          </div>
        </section>

        <section className="investigation-section hint-section">
          <div className="section-title">
            <Lightbulb size={22} />
            <h2>DETECTIVE HINTS</h2>

            <span>
              {hintStatus.remaining} OF {hintStatus.limit} REMAINING
            </span>
          </div>

          <div className="hint-panel">
            <div className="hint-panel-intro">
              <div className="hint-icon-wrap">
                <Lightbulb size={25} />
              </div>

              <div>
                <h3>Need a little direction?</h3>
                <p>
                  Reveal hints one at a time. Use them carefully — your hint
                  allowance depends on the case difficulty.
                </p>
              </div>
            </div>

            <div className="hint-usage-track" aria-label="Hints remaining">
              <div
                className="hint-usage-fill"
                style={{
                  width: `${
                    hintStatus.limit > 0
                      ? (hintStatus.used / hintStatus.limit) * 100
                      : 0
                  }%`,
                }}
              />
            </div>

            {hintError && (
              <div className="evidence-error hint-error">
                <AlertCircle size={18} />
                {hintError}
              </div>
            )}

            <button
              className="hint-button"
              onClick={requestHint}
              disabled={loadingHint || hintsExhausted || hintStatus.limit === 0}
            >
              {loadingHint ? (
                <>
                  <LoaderCircle size={18} className="loading-icon" />
                  Revealing hint...
                </>
              ) : hintsExhausted ? (
                <>
                  <CheckCircle2 size={18} />
                  All hints revealed
                </>
              ) : (
                <>
                  <Lightbulb size={18} />
                  Reveal Next Hint
                </>
              )}
            </button>

            {revealedHints.length > 0 && (
              <div className="revealed-hints">
                <h3>REVEALED CLUES</h3>

                {revealedHints.map((hint, index) => (
                  <article
                    className="hint-card"
                    key={`${hint.number}-${index}`}
                  >
                    <div className="hint-card-heading">
                      <Lightbulb size={17} />
                      HINT {hint.number}
                    </div>

                    <p>{hint.text}</p>
                  </article>
                ))}
              </div>
            )}

            {hintsExhausted && hintStatus.limit > 0 && (
              <p className="hint-limit-message">
                You have used all available hints for this investigation.
              </p>
            )}
          </div>
        </section>

        <div className="investigation-notice">
          <Search size={20} />
          <p>
            Study the suspects and examine each clue carefully. Look for
            contradictions and uncover the truth.
          </p>
        </div>
      </main>
    </div>
  );
}

export default InvestigationRoom;
