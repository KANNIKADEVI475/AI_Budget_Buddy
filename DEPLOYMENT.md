# AI Budget Buddy — Deployment Guide

> Complete instructions for deploying the AI Budget Buddy application to production using **Vercel** (frontend), **Render** (backend), and **MongoDB Atlas** (database).

---

## Architecture Overview

```
┌────────────────────┐       HTTPS        ┌────────────────────────┐
│  Vercel (Frontend) │ ◄────────────────► │  Render (Backend API)  │
│  React + Vite      │                    │  Node.js + Express     │
└────────────────────┘                    └──────────┬─────────────┘
                                                     │ Mongoose
                                                     ▼
                                          ┌────────────────────────┐
                                          │   MongoDB Atlas        │
                                          │   ai_budget_buddy DB   │
                                          └────────────────────────┘
                                                     │
                                          ┌────────────────────────┐
                                          │ PayPal Sandbox API     │
                                          │ api-m.sandbox.paypal.com│
                                          └────────────────────────┘
```

| Layer    | Service        | URL Pattern                                      |
|----------|----------------|--------------------------------------------------|
| Frontend | Vercel         | `https://ai-budget-buddy.vercel.app`             |
| Backend  | Render         | `https://ai-budget-buddy-api.onrender.com`       |
| Database | MongoDB Atlas  | Private (connection string in Render env vars)   |

---

## Repository Structure

```
AI_Budget_buddy/              ← Monorepo root (also the frontend)
├── src/                      ← React source
├── public/
├── index.html
├── package.json              ← Frontend dependencies (Vite, React, Tailwind)
├── vite.config.js
├── vercel.json               ← Vercel SPA rewrite config
├── .gitignore
├── DEPLOYMENT.md             ← This file
└── backend/                  ← Backend sub-directory
    ├── src/
    │   ├── server.js         ← Express entry point
    │   ├── config/
    │   ├── controllers/
    │   ├── models/
    │   ├── routes/
    │   ├── services/
    │   ├── jobs/
    │   └── middleware/
    ├── package.json          ← Backend dependencies (Express, Mongoose, etc.)
    ├── .env.example          ← Template for environment variables
    └── .gitignore            ← Excludes backend/.env and node_modules
```

---

## 1. Prerequisites

Before deploying, ensure you have:

- [ ] A **GitHub** account with the repository at `https://github.com/KANNIKADEVI475/AI_Budget_Buddy`
- [ ] A **Vercel** account at [vercel.com](https://vercel.com) (free tier works)
- [ ] A **Render** account at [render.com](https://render.com) (free tier has limitations — see note below)
- [ ] A **MongoDB Atlas** account at [cloud.mongodb.com](https://cloud.mongodb.com) (free M0 cluster works)
- [ ] A **PayPal Developer** account at [developer.paypal.com](https://developer.paypal.com) with a Sandbox REST app

> [!WARNING]
> **Render Free Tier Limitation**: Render's free "Web Service" spins down after 15 minutes of inactivity. When the server spins down, the `node-cron` daily sync job (`0 2 * * *`) **will not run**. For reliable daily sync, upgrade to a Render paid plan or use a Render **Cron Job** service that calls `POST /api/transactions/sync`.

---

## 2. MongoDB Atlas Setup

### Step 1 — Create a Cluster

1. Log in to [cloud.mongodb.com](https://cloud.mongodb.com)
2. Click **Create** → Select **M0 Free** tier
3. Choose a cloud provider and region (e.g., AWS, `us-east-1`)
4. Name your cluster (e.g., `ai-budget-buddy-cluster`)
5. Click **Create Deployment**

### Step 2 — Create a Database User

1. In Atlas sidebar → **Database Access** → **Add New Database User**
2. Authentication method: **Password**
3. Username: `ai_budget_buddy_user`
4. Password: Generate a strong password and **save it securely**
5. Database User Privileges: **Read and write to any database**
6. Click **Add User**

### Step 3 — Configure Network Access

1. In Atlas sidebar → **Network Access** → **Add IP Address**
2. For Render Free tier: Click **Allow Access from Anywhere** (`0.0.0.0/0`)
   - For paid Render plans, add only Render's static outbound IPs
3. Click **Confirm**

### Step 4 — Get Connection String

1. In Atlas → **Clusters** → Click **Connect** on your cluster
2. Select **Drivers** → Driver: **Node.js**
3. Copy the connection string — it looks like:
   ```
   mongodb+srv://ai_budget_buddy_user:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
4. Replace `<password>` with your actual database user password
5. Add the database name: change `/?retryWrites` to `/ai_budget_buddy?retryWrites`

Final URI example:
```
mongodb+srv://ai_budget_buddy_user:YourPassword@cluster0.xxxxx.mongodb.net/ai_budget_buddy?retryWrites=true&w=majority
```

---

## 3. GitHub Push

### Step 1 — Verify Security (Critical)

```bash
# Confirm .env is NOT tracked
git ls-files backend/.env   # Must return NOTHING

# Review what will be committed
git status
```

### Step 2 — Stage and Commit

```bash
cd c:\Users\kanni\OneDrive\Desktop\projects\AI_Budget_buddy

git add .
git status   # Review the files — confirm backend/.env is NOT listed

git commit -m "feat: Complete AI Budget Buddy with dashboard, MongoDB sync, and AI insights"
```

### Step 3 — Push to GitHub

```bash
git push -u origin main
```

> [!NOTE]
> If prompted for GitHub credentials, use your GitHub username and a **Personal Access Token** (not your password). Create one at: GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic) → Generate new token (select `repo` scope).

---

## 4. Render Backend Deployment

### Option A — Deploy from the Render Blueprint

The repository includes [`render.yaml`](./render.yaml), which defines the backend service,
health check, build command, and non-secret defaults. In Render, choose **New +** →
**Blueprint** and select this repository. Before the first deploy, provide the prompted
values for `FRONTEND_URL`, `MONGODB_URI`, and `CREDENTIAL_ENCRYPTION_KEY`.

The `FRONTEND_URL` value can be updated after the Vercel deployment. Render automatically
provides `PORT`; the server is configured to use it.

### Option B — Create a Web Service manually

### Step 1 — Create a New Web Service

1. Log in to [render.com](https://render.com)
2. Click **New +** → **Web Service**
3. Connect your GitHub account and select `KANNIKADEVI475/AI_Budget_Buddy`
4. Configure:

| Setting           | Value                        |
|-------------------|------------------------------|
| **Name**          | `ai-budget-buddy-api`        |
| **Region**        | Oregon (US West) — or closest to you |
| **Branch**        | `main`                       |
| **Root Directory**| `backend`                    |
| **Runtime**       | Node                         |
| **Build Command** | `npm install`                |
| **Start Command** | `npm start`                  |

### Step 2 — Set Environment Variables

In Render → Your service → **Environment** → Add the following:

| Variable                    | Value                                                      |
|-----------------------------|------------------------------------------------------------|
| `NODE_ENV`                  | `production`                                               |
| `PORT`                      | `5000`                                                     |
| `FRONTEND_URL`              | `https://your-app.vercel.app` *(update after Vercel deploy)* |
| `PAYPAL_ENV`                | `sandbox`                                                  |
| `MONGODB_URI`               | Your MongoDB Atlas connection string from Step 2.4         |
| `CREDENTIAL_ENCRYPTION_KEY` | A 64-character hex string — **generate a new one** (see below) |

**Generate a new encryption key** (run in any terminal):
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

> [!CAUTION]
> **Never commit the `CREDENTIAL_ENCRYPTION_KEY` to GitHub.** If you already have PayPal credentials stored in MongoDB, use the **same key** that encrypted them. If starting fresh, generate a new one and store it only in Render.

### Step 3 — Deploy

1. Click **Create Web Service**
2. Render will clone the repo, run `npm install` in the `backend` directory, and start the server
3. Wait for the build to complete (2–5 minutes)
4. Note your **Render service URL**: `https://ai-budget-buddy-api.onrender.com`

### Step 4 — Verify Backend Health

Visit: `https://ai-budget-buddy-api.onrender.com/api/health`

Expected response:
```json
{ "status": "healthy", "timestamp": "...", "paypalEnv": "sandbox" }
```

---

## 5. Vercel Frontend Deployment

### Step 1 — Import Project

1. Log in to [vercel.com](https://vercel.com)
2. Click **Add New...** → **Project**
3. Import from GitHub: select `KANNIKADEVI475/AI_Budget_Buddy`

### Step 2 — Configure Build Settings

| Setting               | Value           |
|-----------------------|-----------------|
| **Framework Preset**  | Vite            |
| **Root Directory**    | `.` (the root)  |
| **Build Command**     | `npm run build` |
| **Install Command**   | `npm install`   |
| **Output Directory**  | `dist`          |

### Step 3 — Set Environment Variables

| Variable        | Value                                           |
|-----------------|-------------------------------------------------|
| `VITE_API_URL`  | `https://ai-budget-buddy-api.onrender.com`      |

### Step 4 — Deploy

1. Click **Deploy**
2. Vercel builds and deploys automatically (1–3 minutes)
3. Note your **Vercel URL**: `https://ai-budget-buddy-[hash].vercel.app`

### Step 5 — Update Render's CORS Setting

Go back to Render → Your service → **Environment**:
- Update `FRONTEND_URL` to your actual Vercel URL (e.g., `https://ai-budget-buddy-abc123.vercel.app`)
- Click **Save Changes** — Render will auto-redeploy

---

## 6. Post-Deployment Checklist

- [ ] `GET https://ai-budget-buddy-api.onrender.com/api/health` returns `{ "status": "healthy" }`
- [ ] Frontend loads at Vercel URL without errors
- [ ] PayPal Sandbox connection form works (enter Client ID + Secret → Connect)
- [ ] Transaction sync works after connecting PayPal
- [ ] Dashboard shows correct data
- [ ] MongoDB Atlas shows documents in `ai_budget_buddy` collections

---

## 7. Environment Variables Reference

### Frontend (Vercel)

| Variable       | Required | Description                              |
|----------------|----------|------------------------------------------|
| `VITE_API_URL` | ✅ Yes   | Full Render backend URL (no trailing `/`) |

### Backend (Render)

| Variable                    | Required | Description                                        |
|-----------------------------|----------|----------------------------------------------------|
| `NODE_ENV`                  | ✅ Yes   | Set to `production`                                |
| `PORT`                      | Optional | Defaults to `5000`; Render sets this automatically |
| `FRONTEND_URL`              | ✅ Yes   | Vercel URL for CORS (no trailing `/`)              |
| `MONGODB_URI`               | ✅ Yes   | MongoDB Atlas connection string                    |
| `PAYPAL_ENV`                | ✅ Yes   | Must be `sandbox` (never `live`)                   |
| `CREDENTIAL_ENCRYPTION_KEY` | ✅ Yes   | 64-char hex; encrypts stored PayPal credentials    |

---

## 8. Automatic Deployments (CI/CD)

Both Vercel and Render automatically redeploy when you push to the `main` branch on GitHub. No manual action needed after the initial setup.

---

## 9. Troubleshooting

| Problem | Likely Cause | Fix |
|---------|-------------|-----|
| Backend returns CORS error | `FRONTEND_URL` doesn't match Vercel URL | Update `FRONTEND_URL` in Render env vars |
| "Cannot connect to MongoDB" | Atlas Network Access not configured | Add `0.0.0.0/0` to Atlas IP Allowlist |
| PayPal connect fails | Wrong PayPal Sandbox credentials | Use Sandbox Client ID/Secret from [developer.paypal.com](https://developer.paypal.com) |
| Transactions not syncing daily | Render free tier spin-down kills cron | Upgrade Render plan or use Render Cron Job |
| Frontend shows blank page | `VITE_API_URL` missing or wrong | Check Vercel env vars and redeploy |
| Render build fails | Missing `npm start` in backend `package.json` | Verify `"start": "node src/server.js"` exists |

---

## 10. Quick Reference URLs

| Resource             | URL                                                                 |
|----------------------|---------------------------------------------------------------------|
| GitHub Repository    | https://github.com/KANNIKADEVI475/AI_Budget_Buddy                  |
| Vercel Dashboard     | https://vercel.com/kannikadevi475                                   |
| Render Dashboard     | https://dashboard.render.com                                        |
| MongoDB Atlas        | https://cloud.mongodb.com                                           |
| PayPal Developer     | https://developer.paypal.com                                        |
| Backend Health Check | https://ai-budget-buddy-api.onrender.com/api/health                 |
