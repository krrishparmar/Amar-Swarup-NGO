# 🌿 Amar Swarup NGO – AI-Powered Waste Management Platform

Welcome to the Amar Swarup NGO hackathon project! This platform consists of a **React Frontend Dashboard** and a **Python/Flask Backend** linked to a fully functional Twilio-powered **WhatsApp Webhook Bot** using SQLite. 

## 🚀 Quick Setup Guide

Follow these steps to run the full stack locally on your machine. 

### 1. Backend Setup (Flask & WhatsApp Bot)
The backend acts as the brains of the project. It hosts the REST API endpoints and actively listens for incoming WhatsApp messages securely.

```bash
# Navigate to the backend directory
cd backend

# (Optional) Create and activate a Virtual Environment
python3 -m venv venv
source venv/bin/activate 

# Install dependencies
pip install -r requirements.txt

# Run the backend locally on port 5001
python3 app.py
```
*Your backend is now running at `http://localhost:5001`. It will automatically configure and build the `amar_swarup.db` SQLite database for you!*

### 2. Twilio WhatsApp Interactivity (Tunneling)
To allow WhatsApp (via the public Twilio Sandbox) to safely connect to your localhost backend, you need a temporary tunneling service.

In a **new terminal tab**, run:
```bash
ssh -R 80:localhost:5001 nokey@localhost.run
```
*(Or use `ngrok` or `localtunnel` if you prefer: `npx localtunnel --port 5001`)*

1. Take the generated URL (e.g., `https://example-url.lhr.life`).
2. Go to your **Twilio Console** > **Messaging** > **WhatsApp Sandbox Settings**.
3. Under "WHEN A MESSAGE COMES IN", paste your URL and append `/webhook` (e.g. `https://example-url.lhr.life/webhook`).
4. Set the HTTP method to **HTTP POST** and Save.

### 3. Frontend Setup (React & Vite)
Our dashboard directly links to the local backend using Vite's proxy configuration in `vite.config.js`. You don't need to change any URLs as long as your Python backend is actively running on port 5001!

In a **new terminal tab** at the root of the project:
```bash
# Install frontend node modules
npm install

# Start the Vite development server
npm run dev
```
*Open `http://localhost:5173/` in your browser. Any live data submitted dynamically via WhatsApp will magically reflect instantly on the dashboard!*

---

### 🏗 Features Included:
- **Interactive Multi-Step WhatsApp Bot:** The bot asks conversational questions to grab the user's Waste Type, Weight, and exact Location in separate steps.
- **Zero-Setup Database Integration:** The bot automatically figures out if the user is a registered Donor. New Donors, Pending Pickups, and their Activity streams are directly saved into the SQLite DB.
- **Unified React Dashboard:** Fetches API stats immediately, providing seamless synchronization with the phone interactions.

Built with ⚡️ React + Vite, Python + Flask, SQLite, and Twilio WhatsApp APIs.
