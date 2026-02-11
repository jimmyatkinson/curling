# Deploy on Render - Get Your Site Live!

## Step-by-Step Instructions

### Step 1: Go to Render
1. Open your browser and go to: **https://render.com**
2. Click **"Get Started for Free"** or **"Sign In"** (top right)

### Step 2: Sign Up / Sign In
- **Easiest option**: Click **"Sign up with GitHub"** 
  - This connects your GitHub account automatically
  - No need to create a separate Render account
- Or sign up with email if you prefer

### Step 3: Create New Web Service
1. Once logged in, click the **"New +"** button (top right)
2. Click **"Web Service"**

### Step 4: Connect Your Repository
1. You'll see "Connect a repository"
2. If you signed in with GitHub, you should see your repositories listed
3. Find and click on **`jimmyatkinson/curling`**
4. Click **"Connect"**

### Step 5: Configure Your Service
Fill in these settings:

- **Name**: `curling` ⭐ **MUST be exactly "curling" to get curling.onrender.com**
- **Environment**: `Node`
- **Region**: Choose the closest to you (e.g., `Oregon (US West)` or `Frankfurt (EU Central)`)
- **Branch**: `main` (should be selected automatically)
- **Root Directory**: (leave blank - empty)
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Instance Type**: **Free** (or choose a paid plan if you want)

### Step 6: Create Web Service
1. Scroll down and click the green **"Create Web Service"** button
2. Render will start building and deploying your app
3. This takes 2-3 minutes - you'll see logs scrolling

### Step 7: Wait for Deployment
- Watch the logs - you'll see:
  - "Installing dependencies..."
  - "Building..."
  - "Starting..."
- When you see **"Your service is live"** or status changes to **"Live"** - you're done!

### Step 8: Your Site is Live! 🎉
Your site will be available at:

**`https://curling.onrender.com`**

Share this URL with your friends!

---

## What Happens Next?

- Render automatically redeploys whenever you push changes to GitHub
- Your site stays live 24/7 (free tier may spin down after inactivity, but wakes up on first visit)
- You can view logs, monitor usage, and manage settings in Render dashboard

---

## Troubleshooting

**If build fails:**
- Check the "Logs" tab in Render
- Make sure `package.json` has `"start": "node server.mjs"` (it does!)
- Make sure all files are pushed to GitHub

**If site doesn't load:**
- Wait a minute for the first deployment to complete
- Check the "Logs" tab for any errors
- Make sure the service status shows "Live"
