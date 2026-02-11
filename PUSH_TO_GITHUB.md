# Push Your Code to GitHub

GitHub requires authentication. Here's the easiest way:

## Option 1: Use Personal Access Token (Recommended)

### Step 1: Create a Personal Access Token

1. Go to GitHub → Click your profile picture (top right) → **Settings**
2. Scroll down to **Developer settings** (left sidebar, near bottom)
3. Click **Personal access tokens** → **Tokens (classic)**
4. Click **Generate new token** → **Generate new token (classic)**
5. Fill in:
   - **Note**: `Curling Project` (or any name)
   - **Expiration**: Choose how long (90 days, 1 year, etc.)
   - **Scopes**: Check **`repo`** (this gives full repository access)
6. Click **Generate token** at the bottom
7. **COPY THE TOKEN IMMEDIATELY** - you won't see it again! It looks like: `ghp_xxxxxxxxxxxxxxxxxxxx`

### Step 2: Push Your Code

Run this command in your terminal:

```bash
cd /Users/jimmyatkinson/Curling
git push -u origin main
```

When prompted:
- **Username**: `jimmyatkinson`
- **Password**: Paste your Personal Access Token (the `ghp_...` token, NOT your GitHub password)

---

## Option 2: Use GitHub CLI (Alternative)

If you have GitHub CLI installed:

```bash
gh auth login
git push -u origin main
```

---

## Option 3: Use SSH (Most Secure, but requires setup)

If you prefer SSH keys, we can set that up too.

---

**Once your code is pushed, we'll move on to deploying on Render!**
