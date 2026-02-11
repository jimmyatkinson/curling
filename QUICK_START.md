# Quick Start Guide - Get Your Site Live!

## Step 1: Create GitHub Repository

1. Go to [github.com](https://github.com) and sign in (or create an account)
2. Click the **"+"** icon in the top right → **"New repository"**
3. Fill in:
   - **Repository name**: `iselin-curl-o-rama` (or any name you like)
   - **Description**: "Fantasy Olympic Curling League"
   - **Visibility**: Choose **Public** (free) or **Private** (your choice)
   - **DO NOT** check "Initialize with README" (we already have files)
4. Click **"Create repository"**

## Step 2: Push Your Code to GitHub

After creating the repo, GitHub will show you commands. Run these in your terminal:

```bash
cd /Users/jimmyatkinson/Curling
git remote add origin https://github.com/YOUR_USERNAME/iselin-curl-o-rama.git
git branch -M main
git push -u origin main
```

**Replace `YOUR_USERNAME` with your actual GitHub username!**

You'll be prompted for your GitHub username and password (or use a Personal Access Token).

## Step 3: Deploy on Render

1. Go to [render.com](https://render.com)
2. Sign up/login (you can use your GitHub account - makes it easier!)
3. Click **"New +"** → **"Web Service"**
4. Click **"Connect account"** if you haven't already, then select your GitHub account
5. Find and select your repository (`iselin-curl-o-rama`)
6. Fill in the settings:
   - **Name**: `curling` ⭐ **IMPORTANT: Use exactly "curling" to get curling.onrender.com**
   - **Environment**: `Node`
   - **Region**: Choose closest to you (e.g., `Oregon (US West)`)
   - **Branch**: `main`
   - **Root Directory**: (leave blank)
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: **Free** (or choose a paid plan)
7. Click **"Create Web Service"**

Render will start building and deploying. This takes 2-3 minutes.

## Step 4: Get Your Website URL

Once deployment finishes (you'll see "Live" status), your site will be at:

**`https://curling.onrender.com`** 🎯

**Share this URL with your friends!** 🎉

**Share this URL with your friends!** 🎉

## Future Updates

Whenever you make changes to your code:
1. Make your changes
2. Run: `git add . && git commit -m "Your update message" && git push`
3. Render will automatically redeploy (takes 1-2 minutes)

---

## Troubleshooting

**If GitHub push fails:**
- Make sure you're using a Personal Access Token (not password) for authentication
- GitHub → Settings → Developer settings → Personal access tokens → Generate new token

**If Render deployment fails:**
- Check the "Logs" tab in Render to see what went wrong
- Make sure `package.json` has the correct `start` script (it does!)

**Need help?** Check the logs in Render's dashboard - they're very helpful!
