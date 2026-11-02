1. Project Overview
AI Mystery Room is an AI-powered, single-player detective game. Players
enter a fictional mystery, investigate a location, examine suspects,
discover evidence, request hints, and submit a final accusation.

The application uses Google's Gemini API to generate mystery content.
The backend validates and stores each mystery, manages investigation
progress, protects the hidden solution, and calculates the final score.

The goal is to deliver an engaging, replayable detective experience with
a polished, responsive interface.
2. Problem Statement
Many mystery games rely on fixed stories and answers, which can reduce
replay value. AI Mystery Room aims to provide varied investigations by
generating new fictional cases from player-selected themes and
difficulty settings.

The game should balance open-ended storytelling with a fair, logically
supported solution. Players should be able to solve a case using
information available during the investigation rather than guessing an
arbitrary answer.
3. Project Goals
- Generate original fictional mysteries using Gemini.
- Let players choose a mystery category and difficulty.
- Present suspects, statements, locations, and evidence in a clear
  investigation interface.
- Reveal evidence progressively as the player investigates.
- Provide limited, contextual hints.
- Allow players to review and connect evidence.
- Accept one final accusation per case.
- Explain the solution and show the player's score.
- Allow players to start another case.
4. Target Users and Experience
Target users: People who enjoy detective stories, mystery games,
logic puzzles, and interactive storytelling.

Expected experience: The player should feel like a detective. The
interface should make the current case, available actions, discovered
evidence, and remaining hints easy to understand. The mystery should be
challenging but fair, with a solution supported by the clues.
5. Scope
5.1 Version 1 core features
1. Home page and game introduction.
2. Mystery creation form.
3. Mystery category and difficulty selection.
4. AI-generated case, suspects, evidence, and hints.
5. Investigation room with suspect profiles and evidence.
6. Evidence discovery and progress tracking.
7. Hint requests with a usage limit.
8. Final suspect accusation.
9. Server-side verdict and score calculation.
10. Results page with culprit and explanation.
11. Start-a-new-case flow.
5.2 Optional enhancements
These are not required for the first working release:
- Interactive drag-and-drop evidence board.
- Connecting evidence items with visual relationship lines.
- Sound effects and ambient audio controls.
- Case history and player statistics.
- User accounts and saved progress.
- Daily mystery challenge.
- Achievements and leaderboards.
6. Mystery Categories
Initial categories:
- Locked-room mystery.
- Museum or missing-artifact mystery.
- Mansion mystery.
- Office mystery.
- Secret-identity mystery.
- Historical mystery.
- Custom premise.
All cases must be fictional and suitable for a general audience. The
first release focuses on non-graphic mystery and puzzle storytelling.
7. Difficulty Settings
  Difficulty       Suspects   Evidence items   Hints
  Beginner                3                5       3
Intermediate            4                7       2
Expert                  5                9       1

The backend must enforce these limits. The AI response must be checked
before a case is saved.
8. User Journey
1. The player opens the application.
2. The player selects Start Investigation.
3. The player chooses a category or enters a custom premise.
4. The player selects a difficulty.
5. The frontend submits the request to the backend.
6. The backend asks Gemini to generate structured mystery data.
7. The backend validates the response and saves the case.
8. The player enters the investigation room.
9. The player reads the case introduction and examines suspects.
10. The player discovers evidence and reviews statements.
11. The player may request a limited hint.
12. The player reviews the available information and selects a suspect.
13. The player submits one final accusation.
14. The backend evaluates the accusation and calculates the score.
15. The results page displays the verdict, culprit, explanation, and
    score.
16. The player may start another case.
9. Pages and UI Requirements
9.1 Home
Purpose: Introduce the game and start an investigation.

Elements: - Application logo and navigation. - Hero section with a
concise description. - Start Investigation call to action. - How to Play
section. - Mystery category previews. - Footer.
9.2 Create Mystery
Purpose: Collect the player's case preferences.

Elements: - Category selector. - Custom premise input. - Difficulty
selector. - Generate Mystery button. - Input validation. - Loading state
while the case is generated. - Clear error state if generation fails.
9.3 Investigation Room
Purpose: Main gameplay screen.

Elements: - Case title and introduction. - Difficulty and progress
indicators. - Suspect cards and profile details. - Evidence list and
evidence detail view. - Discovered evidence indicator. - Hint request
control and remaining hint count. - Investigation notes or summary
area. - Accusation action.

The initial release may use a structured evidence-board layout.
Drag-and-drop connections are an optional enhancement.
9.4 Accusation
Purpose: Collect the player's final decision.

Elements: - Suspect selection. - Selected suspect confirmation. -
Warning that the accusation is final. - Submit button. - Loading and
error states.
9.5 Results
Purpose: Explain the outcome.

Elements: - Correct or incorrect verdict. - Player's accusation. -
Actual culprit. - Explanation of the mystery. - Evidence supporting the
solution. - Score breakdown. - Play Again button.

The results endpoint must not reveal the solution before the case is
completed.
10. Functional Requirements
- FR-01: The player can create a case using a category or custom
  premise.
- FR-02: The player can select Beginner, Intermediate, or Expert
  difficulty.
- FR-03: The system generates the configured number of suspects,
  evidence items, and hints.
- FR-04: The player can retrieve the active case and public
  investigation data.
- FR-05: The player can discover an evidence item.
- FR-06: Discovering the same evidence item more than once must
  not award duplicate points.
- FR-07: The player can request hints within the case's hint
  limit.
- FR-08: The player can submit one final accusation.
- FR-09: The backend determines whether the accusation is correct.
- FR-10: The backend calculates and stores the final score.
- FR-11: The player can retrieve the result after the case is
  completed.
- FR-12: A completed case cannot be modified through gameplay
  endpoints.
11. AI Generation Requirements
Gemini must return structured data containing:
- Case title, category, premise, and introduction.
- Suspects with unique IDs, descriptions, backgrounds, and statements.
- Evidence items with unique IDs, descriptions, and relevant suspect
  references.
- Hints appropriate to the selected difficulty.
- A hidden culprit ID.
- A private solution explanation.
- Evidence references that support the solution.
Quality rules
1. The generated case must have exactly one defensible solution.
2. The solution must be supported by evidence available to the player.
3. Suspect and evidence IDs must be unique within the case.
4. All suspect references in evidence must point to existing suspects.
5. The story, statements, evidence, and solution must not contradict
   one another unintentionally.
6. Hints should guide reasoning without directly naming the culprit.
7. The backend must validate the AI response before saving it.
8. Invalid responses must be retried a limited number of times or
   rejected with a controlled error.
9. AI output must be treated as untrusted input.
12. Scoring Rules
Proposed Version 1 scoring:

  Action                                              Score
  Correct accusation                       +100 base points
Each unique evidence item discovered           +10 points
Each hint used                                 -10 points
Incorrect accusation                        0 base points
Minimum final score                                     0

Difficulty multiplier:

  Difficulty       Multiplier
  Beginner                1.0
Intermediate            1.5
Expert                  2.0

Formula:

Final Score = max(0, (Base Points + Evidence Points - Hint Penalties) × Difficulty Multiplier)

The base points are awarded only for a correct accusation. An incorrect
accusation receives zero base points, but evidence points and hint
penalties still apply.

The backend is the sole authority for score calculation. The frontend
must never submit a trusted score.
13. Backend API Design
Base path: /api
  Method                  Endpoint                                         Purpose
  POST                    /mysteries                                     Generate and save a new
mystery

  GET                     /mysteries/:id                                 Retrieve public case
information and
progress

  GET                     /mysteries/:id/suspects                        Retrieve public suspect
profiles

  POST                    /mysteries/:id/evidence/:evidenceId/discover   Discover an evidence
item

  POST                    /mysteries/:id/hints                           Request the next
available hint

  POST                    /mysteries/:id/accuse                          Submit and evaluate the
final accusation
GET                     /mysteries/:id/results                         Retrieve the completed
result
API behavior
- Validate request bodies and route parameters.
- Use consistent JSON response structures.
- Return suitable HTTP status codes.
- Do not expose internal stack traces to clients.
- Ensure repeated requests cannot duplicate rewards or bypass limits.
- Protect state-changing operations against invalid case states.
14. Data Model
A Mystery document should include:

Public case data - title - category - premise - introduction -
difficulty - suspects - evidence - hints (with private hint content
protected until requested)

Private solution data - culpritId - solutionExplanation -
supportingEvidenceIds

Player progress - discoveredEvidenceIds - hintsUsed -
accusationSuspectId - accusationSubmittedAt - completedAt - finalScore -
status

Metadata - createdAt - updatedAt

The implementation should use Mongoose schemas and validation. Public
API responses must be constructed using explicit serializers or DTOs;
never return the raw database document.
15. Security and Privacy
- Store Gemini and database credentials only in backend environment
  variables.
- Never put secret keys in frontend code.
- Exclude .env from version control.
- Keep the culprit and solution on the server until the accusation is
  submitted.
- Do not send hidden solution fields in active-case API responses.
- Validate all client inputs.
- Validate and constrain AI-generated data.
- Prevent duplicate evidence rewards.
- Enforce hint limits on the server.
- Reject repeated accusations and mutations after completion.
- Apply rate limiting to case generation and hint requests.
- Configure CORS for the deployed frontend origin.
- Use centralized error handling.
16. Non-Functional Requirements
- Responsive layout for desktop, tablet, and mobile.
- Clear loading, empty, success, and error states.
- Accessible labels and keyboard-operable controls.
- Consistent navigation and visual hierarchy.
- Reasonable API response times and controlled AI retries.
- Maintainable separation of frontend, backend, and AI services.
- No secrets or private solution data in browser logs.
17. Visual Design Direction
Theme: Premium detective investigation interface.
- Dark navy and charcoal surfaces.
- Restrained gold and electric-blue accents.
- Clear, readable typography.
- Evidence cards and suspect profile panels.
- Subtle borders, depth, and transitions.
- Focused layouts that prioritize investigation information.
- Responsive navigation and card layouts.
The design should feel immersive without sacrificing readability or
usability.
18. Proposed Project Structure
AI-Mystery-Room/
├── SPEC.md
├── .gitignore
├── client/
│   ├── public/
│   └── src/
│       ├── assets/
│       ├── components/
│       ├── pages/
│       ├── layouts/
│       ├── services/
│       ├── hooks/
│       ├── context/
│       ├── utils/
│       ├── App.jsx
│       └── main.jsx
└── server/
    ├── config/
    ├── controllers/
    ├── middleware/
    ├── models/
    ├── routes/
    ├── services/
    ├── validators/
    ├── utils/
    ├── tests/
    └── server.js
19. Testing Plan
Test at minimum:
- Case generation for every difficulty.
- Exact suspect, evidence, and hint counts.
- Empty and invalid premises.
- Invalid category and difficulty values.
- Gemini API errors and malformed AI responses.
- Unique IDs and valid references.
- Evidence discovery and duplicate discovery.
- Hint limits and repeated hint requests.
- Correct and incorrect accusations.
- Score calculation and minimum score.
- Attempts to retrieve the solution before accusation.
- Attempts to mutate a completed case.
- Missing or invalid case IDs.
- Frontend loading and error states.
- Responsive layouts and complete gameplay flow.
20. Acceptance Criteria
Version 1 is ready when:
- A player can create a mystery and select a difficulty.
- Gemini generates a valid, logically consistent case.
- The configured suspect, evidence, and hint counts are enforced.
- The player can inspect suspects and discover evidence.
- The player can request hints within the allowed limit.
- Duplicate evidence does not award duplicate points.
- The player can submit one final accusation.
- The backend evaluates the accusation and calculates the score.
- The solution is not exposed before the accusation.
- Results show the correct culprit and explanation.
- Completed cases cannot be changed.
- The complete experience works on the deployed website.
21. Limitations and Assumptions
- Version 1 is single-player.
- User accounts and multiplayer are outside the initial scope.
- Case history and leaderboards are optional enhancements.
- The application depends on Gemini API availability and configured
  usage limits.
- AI-generated cases require validation; generation is not assumed to
  be correct automatically.
- All scenarios are fictional.
- The initial evidence board may be a structured layout rather than a
  free-form canvas.
22. Deployment and Final Deliverables
Deployment plan - MongoDB Atlas for the production database. - A
Node.js-compatible host for the backend. - Vercel for the frontend. -
Production environment variables configured separately for each
service. - End-to-end verification using the deployed website.

Final deliverables 1. Approved SPEC.md. 2. React frontend source
code. 3. Express backend source code. 4. MongoDB integration. 5. Gemini
integration. 6. Tested end-to-end mystery game. 7. GitHub repository. 8.
Live website URL.
Development rule: Treat this specification as the implementation
baseline. Build incrementally, test each feature, and update this
document when a deliberate scope or design decision changes.