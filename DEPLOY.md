# Deployment Guide

## Option 1: Render (Recommended - Easiest)

1. **Create a GitHub repository** (if you haven't already):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   # Create a repo on GitHub, then:
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```

2. **Deploy on Render**:
   - Go to [render.com](https://render.com) and sign up/login
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Settings:
     - **Name**: `iselin-curl-o-rama` (or whatever you want)
     - **Environment**: `Node`
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`
     - **Plan**: Free (or paid if you want)
   - Click "Create Web Service"
   - Render will automatically deploy and give you a URL like `https://iselin-curl-o-rama.onrender.com`

3. **Done!** Your site will be live. Render automatically redeploys when you push to GitHub.

---

## Option 2: Railway

1. **Push to GitHub** (same as step 1 above)

2. **Deploy on Railway**:
   - Go to [railway.app](https://railway.app) and sign up/login
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository
   - Railway auto-detects Node.js and deploys
   - You'll get a URL like `https://your-app.up.railway.app`

---

## Option 3: Fly.io

1. **Install Fly CLI**: `curl -L https://fly.io/install.sh | sh`

2. **Login**: `fly auth login`

3. **Initialize**: `fly launch` (follow prompts)

4. **Deploy**: `fly deploy`

---

## Notes

- All platforms support the `PORT` environment variable (your server already uses this)
- The free tiers are usually sufficient for this app
- Render and Railway auto-deploy on git push
- Your app scrapes World Curling every 30 seconds (cached), which is fine for free tiers
