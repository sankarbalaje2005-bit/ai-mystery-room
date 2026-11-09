# ai-mystery-room
An AI-powered detective mystery investigation game using React, Node.js and Google Gemini AI.
🕵️ AI Mystery Room

Every clue tells a story. Can you uncover the truth?

An AI-powered interactive detective investigation game where players solve fictional mysteries by examining suspects, discovering clues, analysing evidence and making final accusations.

🚀 Live Demo | 💻 GitHub Repository

⸻

📌 About the Project

AI Mystery Room is an interactive mystery-solving application designed to provide a dynamic detective experience using Generative AI.

Unlike traditional mystery games with predefined storylines, this project uses AI-generated cases to create engaging investigation experiences.

Players investigate cases, analyse suspect information, collect evidence, request hints and submit their final accusations.

🎯 Project Objectives

* Create an interactive AI-powered detective experience.
* Generate dynamic fictional mystery cases.
* Encourage logical reasoning and critical thinking.
* Provide an engaging investigation workflow.
* Demonstrate practical Generative AI integration in a full-stack web application.

✨ Key Features

* AI-Powered Mystery Generation: Generate fictional mystery cases using Google Gemini.
* Interactive Investigation: Explore suspects, statements and case information.
* Evidence Discovery: Collect and analyse clues during investigations.
* Hint System: Receive hints to support the investigation.
* Final Accusation: Select a suspect and submit your conclusion.
* Verdict & Scoring: Receive the investigation outcome, explanation and score.
* Difficulty Levels: Experience different levels of investigation challenges.

🛠️ Technology Stack

Technology	Purpose
React	Frontend development
Node.js	Backend runtime
Express.js	Backend API development
Google Gemini API	AI-powered mystery generation
MongoDB	Database
Mongoose	Database modelling
Vercel	Application deployment

Verify the complete stack against your actual implementation before publishing.

🏗️ Application Architecture

The application follows a frontend-backend architecture.

1. Frontend: React provides the interactive user interface.
2. Backend: Node.js and Express handle application logic and API requests.
3. AI Integration: Google Gemini generates mystery content.
4. Database: MongoDB stores application data.
5. Deployment: Vercel hosts the live application.

🔄 How It Works

1. Start a new mystery investigation.
2. Generate or select an available case.
3. Examine suspects and their statements.
4. Discover clues and collect evidence.
5. Request hints when needed.
6. Submit your final accusation.
7. Review the verdict and investigation score.

📂 Project Structure

ai-mystery-room/
│
├── backend/
│   ├── controllers/
│   ├── routes/
│   ├── models/
│   ├── config/
│   └── server.js
│
├── frontend/
│   ├── public/
│   ├── src/
│   └── package.json
│
├── README.md
└── SPEC.md

Adjust this tree to match your actual repository folders and files.

⚙️ Installation and Setup

Prerequisites

* Node.js
* npm
* MongoDB
* Google Gemini API key

1. Clone the repository

git clone https://github.com/sankarbalaje2005-bit/ai-mystery-room.git
cd ai-mystery-room

2. Install dependencies

Install frontend and backend dependencies separately:

cd frontend
npm install
cd ../backend
npm install

3. Configure environment variables

Create the required .env files based on your backend and frontend configuration.

Example backend variables:

PORT=5000
MONGODB_URI=your_mongodb_connection
GEMINI_API_KEY=your_gemini_api_key

Use the actual variable names expected by your code. Never commit API keys or credentials.

4. Run the application

Start the backend:

cd backend
npm run dev

Start the frontend in another terminal:

cd frontend
npm run dev

Check your package.json scripts and configuration before using these commands.

🔐 Security Considerations

* Store API keys in environment variables.
* Keep sensitive credentials out of GitHub.
* Validate incoming API requests.
* Protect AI-generated answers and application logic on the backend.

🎓 Learning Outcomes

Through this project, I explored:

* Full-stack web application development.
* Generative AI and API integration.
* Frontend and backend communication.
* Database integration.
* Application architecture and deployment.
* Interactive user experience development.

🚀 Future Enhancements

* Multiplayer detective investigations.
* Additional mystery categories.
* Advanced evidence analysis.
* Investigation history and user profiles.
* Leaderboards and achievement systems.

🌐 Live Application

Experience the investigation:

https://ai-mystery-room-lime.vercel.app

👨‍💻 Developer

Sankar Balaje

B.Tech Mechanical Engineering | Full-Stack Development & Generative AI Enthusiast

⸻

⭐ If you find this project interesting, consider giving the repository a star!
