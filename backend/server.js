const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { z } = require("zod");
require("dotenv").config();

const { GoogleGenAI } = require("@google/genai");

const app = express();
const PORT = process.env.PORT || 5000;

// --------------------------------------------------
// MIDDLEWARE
// --------------------------------------------------

app.use(cors());
app.use(express.json());

// --------------------------------------------------
// GEMINI CONFIGURATION
// --------------------------------------------------

if (!process.env.GEMINI_API_KEY) {
  console.error("GEMINI_API_KEY is missing from backend/.env");
  process.exit(1);
}

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    timeout: 180000,
  },
});

const GEMINI_MODEL = "gemini-3.5-flash-lite";

// --------------------------------------------------
// FREE LOCAL JSON STORAGE
// --------------------------------------------------

const DATA_DIRECTORY = path.join(__dirname, "data");
const DATA_FILE = path.join(DATA_DIRECTORY, "mysteries.json");

const mysteryStore = new Map();

function saveMysteries() {
  fs.mkdirSync(DATA_DIRECTORY, { recursive: true });

  const serializableMysteries = Array.from(mysteryStore.entries()).map(
    ([id, mystery]) => [
      id,
      {
        ...mystery,
        discoveredEvidence: Array.from(mystery.discoveredEvidence),
      },
    ],
  );

  const temporaryFile = `${DATA_FILE}.tmp`;

  fs.writeFileSync(
    temporaryFile,
    JSON.stringify(serializableMysteries, null, 2),
    "utf8",
  );

  fs.renameSync(temporaryFile, DATA_FILE);
}

function loadMysteries() {
  if (!fs.existsSync(DATA_FILE)) {
    console.log("No saved mysteries found. Starting with an empty store.");
    return;
  }

  try {
    const savedData = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));

    if (!Array.isArray(savedData)) {
      throw new Error("Saved mystery data has an invalid format.");
    }

    for (const [id, mystery] of savedData) {
      if (!id || !mystery || !mystery.publicMystery) {
        continue;
      }

      mysteryStore.set(id, {
        ...mystery,
        discoveredEvidence: new Set(mystery.discoveredEvidence || []),
        revealedHints: Array.isArray(mystery.revealedHints)
          ? mystery.revealedHints
          : [],
      });
    }

    console.log(`Restored ${mysteryStore.size} saved mystery/mysteries.`);
  } catch (error) {
    console.error("Could not load saved mysteries:", error.message);

    throw new Error(
      "Saved mystery data could not be loaded. Check backend/data/mysteries.json.",
    );
  }
}

// Load existing progress before accepting requests.
loadMysteries();

// --------------------------------------------------
// VALIDATION
// --------------------------------------------------

const mysteryRequestSchema = z.object({
  category: z.enum([
    "Locked Room",
    "Missing Artifact",
    "Mansion Secret",
    "Museum",
    "Office",
    "Secret Identity",
    "Historical",
  ]),
  difficulty: z.enum(["Beginner", "Intermediate", "Expert"]),
  title: z.string().max(80).optional().default(""),
  description: z.string().max(500).optional().default(""),
});

// --------------------------------------------------
// DIFFICULTY SETTINGS
// --------------------------------------------------

const difficultySettings = {
  Beginner: {
    suspects: 3,
    evidence: 5,
    hints: 3,
  },
  Intermediate: {
    suspects: 4,
    evidence: 7,
    hints: 2,
  },
  Expert: {
    suspects: 5,
    evidence: 9,
    hints: 1,
  },
};

// --------------------------------------------------
// GEMINI RESPONSE SCHEMA
// --------------------------------------------------

const mysteryResponseSchema = {
  type: "object",
  properties: {
    title: {
      type: "string",
    },
    introduction: {
      type: "string",
    },
    setting: {
      type: "string",
    },
    suspects: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: {
            type: "string",
          },
          name: {
            type: "string",
          },
          description: {
            type: "string",
          },
          alibi: {
            type: "string",
          },
        },
        required: ["id", "name", "description", "alibi"],
      },
    },
    evidence: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: {
            type: "string",
          },
          title: {
            type: "string",
          },
          description: {
            type: "string",
          },
        },
        required: ["id", "title", "description"],
      },
    },
    hints: {
      type: "array",
      items: {
        type: "string",
      },
    },
    hiddenSolution: {
      type: "object",
      properties: {
        culpritId: {
          type: "string",
        },
        explanation: {
          type: "string",
        },
      },
      required: ["culpritId", "explanation"],
    },
  },
  required: [
    "title",
    "introduction",
    "setting",
    "suspects",
    "evidence",
    "hints",
    "hiddenSolution",
  ],
};

// --------------------------------------------------
// RETRY HELPER FOR TEMPORARY GEMINI ERRORS
// --------------------------------------------------

const sleep = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

async function createGeminiInteraction(request) {
  const maxAttempts = 3;
  const retryDelays = [5000, 10000];

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log(`Gemini generation attempt ${attempt}/${maxAttempts}`);

      const interaction = await ai.interactions.create(request);

      return interaction;
    } catch (error) {
      const status = Number(error.status || error.code || 0);

      const isRetryable = status === 408 || status === 429 || status >= 500;

      if (!isRetryable || attempt === maxAttempts) {
        throw error;
      }

      const delay = retryDelays[attempt - 1];

      console.warn(
        `Gemini temporarily unavailable (${status}). Retrying in ${delay / 1000} seconds...`,
      );

      await sleep(delay);
    }
  }

  throw new Error("Gemini generation failed after retry attempts.");
}

// --------------------------------------------------
// HEALTH CHECK
// --------------------------------------------------

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "AI Mystery Room backend is running!",
  });
});

// --------------------------------------------------
// GENERATE MYSTERY
// --------------------------------------------------

app.post("/api/mysteries", async (req, res) => {
  try {
    const validation = mysteryRequestSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid mystery details.",
        errors: validation.error.flatten(),
      });
    }

    const { category, difficulty, title, description } = validation.data;

    const settings = difficultySettings[difficulty];

    const prompt = `
You are an expert writer of fair-play fictional detective mysteries.

Create one original, engaging, general-audience detective mystery.

MYSTERY DETAILS:
Category: ${category}
Difficulty: ${difficulty}
Requested title: ${title || "Create a suitable title"}
Scenario: ${description || "Create an original scenario"}

EXACT CONTENT REQUIREMENTS:
1. Create exactly ${settings.suspects} suspects.
2. Create exactly ${settings.evidence} evidence items.
3. Create exactly ${settings.hints} progressive hints.
4. Give every suspect a unique ID.
5. Give every evidence item a unique ID.
6. The hiddenSolution.culpritId must match one suspect ID.
7. Every suspect must have a believable description and alibi.
8. The evidence must contain fair clues that help solve the mystery.
9. There must be exactly one responsible culprit.
10. The solution must be logically supported by the evidence.

HINT REQUIREMENTS:
- Hints must be ordered from least revealing to most helpful.
- Each hint should guide the player toward relevant evidence or contradictions.
- Never directly reveal the culprit's name.
- Never directly reveal the complete solution.
- Do not make hints contradictory.

STORY REQUIREMENTS:
- Make the mystery immersive and interesting.
- Keep the story fictional and suitable for a general audience.
- Avoid graphic violence, gore, or disturbing descriptions.
- Do not reveal the culprit in the introduction or suspect descriptions.
- Keep the explanation clear and consistent with the clues.

Return only the structured JSON response matching the supplied schema.
`;

    const interaction = await createGeminiInteraction({
      model: GEMINI_MODEL,
      input: prompt,
      store: false,
      response_format: {
        type: "text",
        mime_type: "application/json",
        schema: mysteryResponseSchema,
      },
    });

    if (!interaction.output_text) {
      throw new Error("Gemini returned an empty response.");
    }

    const generatedMystery = JSON.parse(interaction.output_text);

    // VERIFY GENERATED CONTENT

    if (
      !generatedMystery ||
      !Array.isArray(generatedMystery.suspects) ||
      !Array.isArray(generatedMystery.evidence) ||
      !Array.isArray(generatedMystery.hints) ||
      !generatedMystery.hiddenSolution
    ) {
      throw new Error("Gemini returned an invalid mystery structure.");
    }

    if (
      generatedMystery.suspects.length !== settings.suspects ||
      generatedMystery.evidence.length !== settings.evidence ||
      generatedMystery.hints.length !== settings.hints
    ) {
      throw new Error(
        "Generated mystery does not match difficulty requirements.",
      );
    }

    const suspectIds = generatedMystery.suspects.map((suspect) => suspect.id);

    const evidenceIds = generatedMystery.evidence.map((item) => item.id);

    if (
      new Set(suspectIds).size !== suspectIds.length ||
      new Set(evidenceIds).size !== evidenceIds.length
    ) {
      throw new Error("Generated mystery contains duplicate IDs.");
    }

    if (!suspectIds.includes(generatedMystery.hiddenSolution.culpritId)) {
      throw new Error("Generated solution contains an invalid culprit ID.");
    }

    // CREATE PUBLIC MYSTERY

    const mysteryId = crypto.randomUUID();

    const publicMystery = {
      id: mysteryId,
      category,
      difficulty,
      title: generatedMystery.title,
      introduction: generatedMystery.introduction,
      setting: generatedMystery.setting,
      suspects: generatedMystery.suspects,

      // Evidence descriptions stay private until discovered.
      evidence: generatedMystery.evidence.map((item) => ({
        id: item.id,
        title: item.title,
      })),

      createdAt: new Date().toISOString(),
    };

    // STORE PRIVATE GAME DATA

    mysteryStore.set(mysteryId, {
      publicMystery,
      fullEvidence: generatedMystery.evidence,
      hiddenSolution: generatedMystery.hiddenSolution,
      privateHints: generatedMystery.hints,
      hintLimit: settings.hints,
      hintsUsed: 0,
      revealedHints: [],
      discoveredEvidence: new Set(),
      completed: false,
    });

    saveMysteries();

    return res.status(201).json({
      success: true,
      message: "Mystery generated successfully!",
      mystery: publicMystery,
      hintStatus: {
        limit: settings.hints,
        used: 0,
        remaining: settings.hints,
      },
    });
  } catch (error) {
    console.error("Mystery generation failed:", error.message);

    const status = Number(error.status || error.code || 0);

    const isTemporary = status === 408 || status === 429 || status >= 500;

    if (isTemporary) {
      return res.status(503).json({
        success: false,
        message:
          "Gemini is temporarily busy. Please wait a moment and try generating your mystery again.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to generate the mystery. Please try again.",
    });
  }
});

// --------------------------------------------------
// GET MYSTERY AND INVESTIGATION PROGRESS
// --------------------------------------------------

app.get("/api/mysteries/:id", (req, res) => {
  try {
    const mystery = mysteryStore.get(req.params.id);

    if (!mystery) {
      return res.status(404).json({
        success: false,
        message: "Mystery not found. Please generate a new mystery.",
      });
    }

    const evidence = mystery.publicMystery.evidence.map((item) => {
      const discovered = mystery.discoveredEvidence.has(item.id);

      const fullEvidence = discovered
        ? mystery.fullEvidence.find((clue) => clue.id === item.id)
        : null;

      return {
        ...item,
        discovered,
        ...(discovered && fullEvidence
          ? { description: fullEvidence.description }
          : {}),
      };
    });

    return res.json({
      success: true,
      mystery: {
        ...mystery.publicMystery,
        evidence,
      },
      hintStatus: {
        limit: mystery.hintLimit,
        used: mystery.hintsUsed,
        remaining: Math.max(0, mystery.hintLimit - mystery.hintsUsed),
      },
      revealedHints: mystery.revealedHints || [],
    });
  } catch (error) {
    console.error("Get mystery error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to load the mystery.",
    });
  }
});

// --------------------------------------------------
// DISCOVER EVIDENCE
// --------------------------------------------------

app.post("/api/mysteries/:id/evidence/:evidenceId/discover", (req, res) => {
  try {
    const mystery = mysteryStore.get(req.params.id);

    if (!mystery) {
      return res.status(404).json({
        success: false,
        message: "Mystery not found.",
      });
    }

    const evidence = mystery.fullEvidence.find(
      (item) => item.id === req.params.evidenceId,
    );

    if (!evidence) {
      return res.status(404).json({
        success: false,
        message: "Evidence not found.",
      });
    }

    if (mystery.discoveredEvidence.has(req.params.evidenceId)) {
      return res.status(409).json({
        success: false,
        message: "You have already discovered this evidence.",
      });
    }

    mystery.discoveredEvidence.add(req.params.evidenceId);

    saveMysteries();

    return res.json({
      success: true,
      message: "Evidence discovered successfully!",
      evidence: {
        id: evidence.id,
        title: evidence.title,
        description: evidence.description,
        discovered: true,
      },
      progress: {
        discovered: mystery.discoveredEvidence.size,
        total: mystery.fullEvidence.length,
      },
    });
  } catch (error) {
    console.error("Evidence discovery error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to discover evidence.",
    });
  }
});

// --------------------------------------------------
// REQUEST NEXT PROGRESSIVE HINT
// --------------------------------------------------

app.post("/api/mysteries/:id/hint", (req, res) => {
  try {
    const mystery = mysteryStore.get(req.params.id);

    if (!mystery) {
      return res.status(404).json({
        success: false,
        message: "Mystery not found.",
      });
    }

    if (mystery.hintsUsed >= mystery.hintLimit) {
      return res.status(409).json({
        success: false,
        message: "You have used all available hints.",
        hintStatus: {
          limit: mystery.hintLimit,
          used: mystery.hintsUsed,
          remaining: 0,
        },
      });
    }

    const hint = mystery.privateHints[mystery.hintsUsed];

    if (!hint) {
      return res.status(500).json({
        success: false,
        message: "Hint is currently unavailable.",
      });
    }

    mystery.hintsUsed += 1;

    const revealedHint = {
      number: mystery.hintsUsed,
      text: hint,
    };

    if (!Array.isArray(mystery.revealedHints)) {
      mystery.revealedHints = [];
    }

    mystery.revealedHints.push(revealedHint);

    saveMysteries();

    return res.json({
      success: true,
      message: "Hint unlocked successfully!",
      hint: revealedHint,
      hintStatus: {
        limit: mystery.hintLimit,
        used: mystery.hintsUsed,
        remaining: mystery.hintLimit - mystery.hintsUsed,
      },
    });
  } catch (error) {
    console.error("Hint request error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve the hint.",
    });
  }
});

// --------------------------------------------------
// START SERVER
// --------------------------------------------------

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Gemini model: ${GEMINI_MODEL}`);
});
