# 🚀 Amar Swarup NGO — Complete Deployment Guide

This guide will take you from running everything on your laptop to having a fully deployed, always-online application with a permanent Twilio WhatsApp webhook.

---

## 📋 What We're Deploying

| Component | What it is | Where it goes | Cost |
|-----------|-----------|---------------|------|
| **Backend** (Flask API + Twilio Webhook) | Python server that handles all API requests and WhatsApp messages | **Render.com** | Free |
| **Frontend** (React Dashboard) | The waste management dashboard UI | **Vercel** | Free |
| **Database** (SQLite) | Stores donors, pickups, leads, activities | Hosted on Render with the backend | Free |
| **Twilio Webhook** | WhatsApp chatbot endpoint | Points to Render URL (permanent!) | Free* |

> *Twilio Sandbox is free for testing. Production WhatsApp requires a Twilio paid plan.

---

## 🔧 Prerequisites

Before you begin, make sure you have:

- [ ] A **GitHub account** (https://github.com)
- [ ] A **Render account** (https://render.com) — sign up with GitHub
- [ ] A **Vercel account** (https://vercel.com) — sign up with GitHub
- [ ] A **Twilio account** (https://twilio.com) — you already have this
- [ ] **Git** installed on your laptop
- [ ] Your project code at: `/Users/kirtan/Desktop/amar swarup/Amar-Swarup-NGO/`

---

## STEP 1: Push Your Code to GitHub

### 1.1 — Create a GitHub Repository

1. Go to https://github.com/new
2. Repository name: `Amar-Swarup-NGO`
3. Set to **Private** (recommended) or Public
4. Do NOT check "Add a README" (you already have one)
5. Click **"Create repository"**

### 1.2 — Push Your Local Code

Open **Terminal** on your Mac and run these commands one by one:

```bash
cd "/Users/kirtan/Desktop/amar swarup/Amar-Swarup-NGO"
```

```bash
git add -A
```

```bash
git commit -m "Prepare for deployment"
```

If this is a new repo (no remote set yet):
```bash
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/Amar-Swarup-NGO.git
```

If you already have a remote set:
```bash
git remote set-url origin https://github.com/YOUR_GITHUB_USERNAME/Amar-Swarup-NGO.git
```

Then push:
```bash
git branch -M main
git push -u origin main
```

> ⚠️ Replace `YOUR_GITHUB_USERNAME` with your actual GitHub username (e.g., `krrishparmar`).

### 1.3 — Verify

Go to `https://github.com/YOUR_GITHUB_USERNAME/Amar-Swarup-NGO` in your browser. You should see all your files there.

---

## STEP 2: Deploy the Backend to Render

### 2.1 — Create a New Web Service

1. Go to https://render.com and log in with GitHub
2. Click the **"New +"** button (top right)
3. Select **"Web Service"**
4. Click **"Connect a repository"** and select your `Amar-Swarup-NGO` repo
5. If you don't see your repo, click **"Configure account"** to give Render access

### 2.2 — Configure the Service

Fill in these settings exactly:

| Setting | Value |
|---------|-------|
| **Name** | `amar-swarup-api` |
| **Region** | Singapore (Southeast Asia) — closest to India |
| **Branch** | `main` |
| **Root Directory** | `backend` |
| **Runtime** | `Python 3` |
| **Build Command** | `pip install -r requirements.txt` |
| **Start Command** | `gunicorn app:app --bind 0.0.0.0:$PORT --workers 2 --timeout 120` |

### 2.3 — Select the Free Plan

- Scroll down to **"Instance Type"**
- Select **"Free"**

### 2.4 — Add Environment Variables

Scroll down to **"Environment Variables"** and click **"Add Environment Variable"** for each:

| Key | Value |
|-----|-------|
| `SECRET_KEY` | `amarswarup-prod-secret-2026-change-this` |
| `FLASK_ENV` | `production` |

> 💡 Tip: For SECRET_KEY, use any long random string. You can generate one at https://randomkeygen.com

### 2.5 — Deploy!

1. Click **"Create Web Service"**
2. Wait 3-5 minutes for the build to complete
3. You'll see a green **"Live"** badge when it's ready
4. Your backend URL will be shown at the top, something like:
   ```
   https://amar-swarup-api.onrender.com
   ```

### 2.6 — Test the Backend

Open a new browser tab and go to:
```
https://amar-swarup-api.onrender.com/webhook
```

You should see: **"Amar Swarup WhatsApp Webhook Active"**

If you see this, your backend is deployed! 🎉

---

## STEP 3: Update Twilio Webhook (Permanent URL!)

This is the most important step — this is what makes Twilio work forever without ngrok.

### 3.1 — Open Twilio Console

1. Go to https://console.twilio.com
2. Log in with your Twilio credentials

### 3.2 — Navigate to WhatsApp Sandbox

1. In the left sidebar, click **"Messaging"** → **"Try it out"** → **"Send a WhatsApp message"**
2. OR go directly to: https://console.twilio.com/us1/develop/sms/settings/whatsapp-sandbox

### 3.3 — Update the Webhook URL

1. Find the section **"WHEN A MESSAGE COMES IN"**
2. Delete the old URL (the ngrok one)
3. Paste your new permanent Render URL:
   ```
   https://amar-swarup-api.onrender.com/webhook
   ```
4. Make sure the dropdown next to it says **"HTTP POST"**
5. Click **"Save"** at the bottom

### 3.4 — Test WhatsApp

1. Open WhatsApp on your phone
2. Send **"hi"** to your Twilio Sandbox number
3. You should get back the welcome message! 🎉

> ⚠️ **First message might take 30-50 seconds** if Render's free tier has gone to sleep. After the first message, subsequent ones will be instant.

---

## STEP 4: Deploy the Frontend to Vercel

### 4.1 — Import Your Project

1. Go to https://vercel.com and log in with GitHub
2. Click **"Add New..."** → **"Project"**
3. Find and select your `Amar-Swarup-NGO` repository
4. Click **"Import"**

### 4.2 — Configure the Build

Fill in these settings:

| Setting | Value |
|---------|-------|
| **Framework Preset** | Vite |
| **Root Directory** | `.` (leave as default / root) |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |

### 4.3 — Add Environment Variables

Click **"Environment Variables"** and add:

| Key | Value |
|-----|-------|
| `VITE_API_BASE` | `https://amar-swarup-api.onrender.com/api` |
| `VITE_GOOGLE_CLIENT_ID` | `159199212470-dopq7jgrd42jh95im7ngh6ntt4hddq8e.apps.googleusercontent.com` |

> ⚠️ Replace the Render URL with YOUR actual Render URL from Step 2.

### 4.4 — Deploy!

1. Click **"Deploy"**
2. Wait 1-2 minutes
3. Vercel will give you a URL like:
   ```
   https://amar-swarup-ngo.vercel.app
   ```
4. Click on it — your dashboard should load! 🎉

### 4.5 — (Optional) Add a Custom Domain

1. In Vercel, go to your project → **"Settings"** → **"Domains"**
2. You can add a custom domain like `dashboard.amarswarup.org`

---

## STEP 5: Update CORS (Connect Frontend ↔ Backend)

Now that you know your Vercel URL, tell the backend to accept requests from it:

1. Go to https://render.com → your `amar-swarup-api` service
2. Click **"Environment"** tab
3. Add a new environment variable:

| Key | Value |
|-----|-------|
| `FRONTEND_URL` | `https://amar-swarup-ngo.vercel.app` |

> Replace with your actual Vercel URL.

4. Click **"Save Changes"** — Render will auto-redeploy.

---

## STEP 6: Update Google OAuth (if using Google Sign-In)

1. Go to https://console.cloud.google.com/apis/credentials
2. Click on your OAuth 2.0 Client ID
3. Under **"Authorized JavaScript origins"**, add:
   ```
   https://amar-swarup-ngo.vercel.app
   ```
4. Under **"Authorized redirect URIs"**, add:
   ```
   https://amar-swarup-ngo.vercel.app
   ```
5. Click **"Save"**

---

## ✅ Final Checklist

After everything is deployed, verify each component:

- [ ] **Dashboard loads**: Open your Vercel URL in a browser
- [ ] **Login works**: Try signing in / signing up
- [ ] **API works**: Dashboard shows data (leads, pickups, donors)
- [ ] **WhatsApp works**: Send "hi" to your Twilio sandbox number → get a reply
- [ ] **Full flow works**: Complete a full pickup booking via WhatsApp → see it appear on dashboard

---

## 🏗️ Architecture After Deployment

```
┌─────────────────────────────────────────────────────────────────┐
│                        THE INTERNET                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  👤 User Browser                                                │
│    │                                                            │
│    │ visits https://amar-swarup-ngo.vercel.app                  │
│    ▼                                                            │
│  ┌──────────────────────┐                                       │
│  │   VERCEL (Frontend)  │                                       │
│  │   React Dashboard    │                                       │
│  └──────────┬───────────┘                                       │
│             │ API calls (/api/leads, /api/pickups, etc.)        │
│             ▼                                                   │
│  ┌──────────────────────┐     ┌──────────────────┐              │
│  │   RENDER (Backend)   │◄────│   TWILIO          │              │
│  │   Flask API          │     │   (WhatsApp)      │              │
│  │   /webhook endpoint  │────►│   Sends replies   │              │
│  │   SQLite Database    │     └──────────────────┘              │
│  └──────────────────────┘              ▲                        │
│                                        │                        │
│                                   📱 WhatsApp User              │
│                                   sends "hi"                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 How to Update After Deployment

Whenever you make code changes:

```bash
cd "/Users/kirtan/Desktop/amar swarup/Amar-Swarup-NGO"
git add -A
git commit -m "Your change description"
git push
```

- **Render** will auto-detect the push and redeploy the backend (takes ~3 min)
- **Vercel** will auto-detect the push and redeploy the frontend (takes ~1 min)
- **Twilio webhook URL stays the same** — no changes needed!

---

## ⚠️ Known Limitations (Free Tier)

### Render Free Tier Sleep
- The backend goes to sleep after **15 minutes of no traffic**
- First request after sleep takes **30-50 seconds** to wake up
- After waking up, all requests are instant

### How to Fix Sleep Issue (Optional)
Option A — **Free workaround**: Set up a cron job to keep it awake
1. Go to https://cron-job.org (free)
2. Create a job that pings `https://amar-swarup-api.onrender.com/webhook` 
3. Set it to run every **14 minutes**
4. This keeps your server awake 24/7

Option B — **Paid fix**: Upgrade to Render Starter plan ($7/month) for always-on service

### SQLite on Render
- SQLite data persists between deploys but is lost if Render rebuilds your disk
- For a production app with important data, consider upgrading to PostgreSQL later

---

## 📞 Quick Reference

| What | URL |
|------|-----|
| **Dashboard** | `https://amar-swarup-ngo.vercel.app` |
| **Backend API** | `https://amar-swarup-api.onrender.com` |
| **Twilio Webhook** | `https://amar-swarup-api.onrender.com/webhook` |
| **Render Dashboard** | https://dashboard.render.com |
| **Vercel Dashboard** | https://vercel.com/dashboard |
| **Twilio Console** | https://console.twilio.com |
| **GitHub Repo** | `https://github.com/YOUR_USERNAME/Amar-Swarup-NGO` |

---

## 🆘 Troubleshooting

### WhatsApp not responding?
1. Check if backend is running: visit `https://amar-swarup-api.onrender.com/webhook` in browser
2. If it shows "Amar Swarup WhatsApp Webhook Active" → backend is fine
3. Check Twilio Console → make sure webhook URL is correct and set to POST
4. Check Render logs: Render Dashboard → your service → "Logs" tab

### Dashboard not loading data?
1. Open browser DevTools (F12) → Console tab → look for errors
2. Check if API URL is correct in Vercel environment variables
3. Check CORS: make sure `FRONTEND_URL` env var on Render matches your Vercel URL

### Build failing on Render?
1. Go to Render Dashboard → your service → "Events" tab
2. Click on the failed deploy to see build logs
3. Common fix: make sure `requirements.txt` has all dependencies

### Build failing on Vercel?
1. Go to Vercel Dashboard → your project → "Deployments" tab
2. Click on failed deploy to see logs
3. Common fix: make sure `VITE_API_BASE` env var is set correctly
