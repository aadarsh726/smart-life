# 🚀 Smart Daily Life Manager

**An AI-powered personal assistant for productivity, wellness, and task management.**

> "Not just a to-do list, but a smart companion that knows *when* you work best."

## 🌟 Overview
Smart Daily Life Manager is a full-stack **Progressive Web App (PWA)** designed to optimize your daily routine. Unlike traditional task managers, it uses **Machine Learning** to analyze your sleep, mood, and past performance to predict your productivity score and suggest the perfect schedule.

Now featuring **Voice Control** 🗣️ and **Sentiment Analysis** 🧠!

## ✨ Key Features

### 🧠 Intelligent Core
- **Productivity Prediction**: A Python Random Forest model predicts your daily energy levels (0-100) based on sleep and mood.
- **Smart Scheduling**: Auto-schedules your tasks based on priority and your predicted peak hours.
- **Context-Aware AI Chat**: Ask "What should I do next?" and get voice-spoken answers.

### 🗣️ Voice Interaction
- **Hands-Free Control**: Use the microphone to chat with your assistant.
- **Text-to-Speech**: The app speaks back to you, acting like a real digital butler.

### 🧘 Lifestyle & Wellness
- **Smart Journal 📔**: Write about your day and let the **Sentiment Engine** analyze your mood (Positive/Negative) automatically.
- **Habit Tracker 💧**: Build streaks for daily habits like "Drink Water" or "Read".
- **Daily Check-ins**: Morning prompts to log sleep and mood data.

### 📱 Mobile Ready (PWA)
- **Installable**: work offline and behaves like a native app on iOS and Android.
- **Touch Optimized**: Smooth interactions on all devices.

## 🛠️ Tech Stack
This project uses a **Microservices Architecture**:

- **Frontend**: React.js, Vite, Sass, Framer Motion (Animations).
- **Backend (API)**: Node.js, Express, MongoDB (Data & Auth).
- **AI Engine**: Python, FastAPI, Scikit-Learn, TextBlob (NLP).

## 🚀 Getting Started

### Prerequisites
- Node.js & npm
- Python 3.8+
- MongoDB

### Installation
1. **Clone the repo**
   ```bash
   git clone https://github.com/aadarsh726/smart-life.git
   cd smart-life
   ```

2. **Run Everything (Windows)**
   Simply double-click `start_all.bat`!

   *Or run manually:*
   ```bash
   # Terminal 1: Node Backend
   cd backend-node && npm install && npm run dev

   # Terminal 2: Python Engine
   cd backend-python && pip install -r requirements.txt && python -m uvicorn main:app --reload

   # Terminal 3: Frontend
   cd frontend-react && npm install && npm run dev
   ```

3. **Open App**
   Visit `http://localhost:5173`

## 🔮 Future Roadmap
- [ ] Wearable Device Sync (Fitbit API)
- [ ] Gamification Leaderboards
- [ ] Push Notifications

---
*Built with ❤️ by Aadarsh*
