# 🚀 BuildNext MVP - Complete Setup & Deployment Guide

## 📋 Table of Contents
1. [Quick Start (5 mins)](#quick-start)
2. [Detailed Setup](#detailed-setup)
3. [Environment Variables](#environment-variables)
4. [Running Locally](#running-locally)
5. [GitHub Setup](#github-setup)
6. [Vercel Deployment](#vercel-deployment)
7. [Post-Deployment](#post-deployment)
8. [Troubleshooting](#troubleshooting)

---

## Quick Start

```bash
# 1. Install
npm install

# 2. Setup environment
cp .env.example .env.local
# Edit .env.local with your credentials

# 3. Run
npm run dev

# 4. Open browser
# http://localhost:3000
```

---

## Detailed Setup

### Prerequisites
- Node.js 18+ installed
- npm or yarn
- Git configured
- GitHub account
- MongoDB Atlas account (free tier OK)
- Cloudinary account (free tier OK)
- Gmail account with app password

### Step 1: Clone/Setup Project

```bash
# Navigate to your projects directory
cd ~/projects

# Clone or download the project
git clone https://github.com/oldhsd/project.git buildnext
cd buildnext

# Or if setting up from scratch
mkdir buildnext && cd buildnext
```

### Step 2: Install Dependencies

```bash
npm install

# Or with yarn
yarn install
```

**Expected output:**
```
added 250+ packages in ~3-5 minutes
```

### Step 3: Prepare Environment Variables

```bash
# Copy example to .env.local
cp .env.example .env.local

# Open file and fill in your credentials
nano .env.local  # or use your preferred editor
```

---

## Environment Variables

### MongoDB Setup
1. Go to: https://www.mongodb.com/cloud/atlas
2. Create free cluster
3. Get connection string:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/buildnext
   ```
4. Add to `.env.local`:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/buildnext
   ```

### Cloudinary Setup
1. Go to: https://cloudinary.com
2. Sign up (free tier)
3. Dashboard → Settings → API Keys
4. Copy: Cloud Name, API Key, API Secret
5. Add to `.env.local`:
   ```env
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   ```

### Gmail Setup
1. Go to: https://myaccount.google.com/apppasswords
2. Select: Mail + Windows Device (or your device)
3. Generate password (16 characters)
4. Copy and add to `.env.local`:
   ```env
   GMAIL_USER=your-email@gmail.com
   GMAIL_PASSWORD=your-16-char-password
   ```

### NextAuth Secret
Generate a random string:
```bash
# macOS/Linux
openssl rand -base64 32

# Windows (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object {[byte](Get-Random -Maximum 256)}))
```

Add to `.env.local`:
```env
NEXTAUTH_SECRET=your-generated-string
NEXTAUTH_URL=http://localhost:3000
```

### Complete .env.local Example
```env
# MongoDB
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/buildnext

# NextAuth
NEXTAUTH_SECRET=your-32-char-random-string
NEXTAUTH_URL=http://localhost:3000

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Gmail
GMAIL_USER=your-email@gmail.com
GMAIL_PASSWORD=your-app-password

# Environment
NODE_ENV=development
```

---

## Running Locally

### Start Development Server

```bash
npm run dev

# Output:
# ▲ Next.js 14.0.0
# - Local:        http://localhost:3000
# ✓ Ready in 2.5s
```

### Access Application

Open browser: **http://localhost:3000**

You'll see the login page.

### Test Signup

1. Click "Sign up"
2. Fill form:
   - Name: Test User
   - Email: test@buildnext.com
   - Password: Test@123
   - Stream: CSE
   - Year: 1
3. Click "Sign Up"
4. Should redirect to login
5. Login with test@buildnext.com / Test@123
6. See dashboard! ✅

### Test Features

- ✅ Dashboard (stats, quick actions)
- ✅ Browse Tracks (loading sample data)
- ✅ Profile (view/edit)
- ✅ Dark Mode (toggle top-right)
- ✅ Responsive (F12 → Mobile view)
- ✅ Logout (profile → sign out)

---

## GitHub Setup

### Initialize Git Repository

```bash
# Configure git (first time only)
git config --global user.email "your-email@gmail.com"
git config --global user.name "your-username"

# Initialize repo
git init

# Add all files
git add .

# First commit
git commit -m "BuildNext MVP - Apple-style student learning platform"

# Check commit
git log --oneline
```

### Add Remote Repository

```bash
# Add your GitHub repo
git remote add origin https://github.com/YOUR-USERNAME/project.git

# Verify
git remote -v

# Output should show:
# origin  https://github.com/YOUR-USERNAME/project.git (fetch)
# origin  https://github.com/YOUR-USERNAME/project.git (push)
```

### Push to GitHub

```bash
# Push to main branch
git push -u origin main

# If using master:
git push -u origin master

# When prompted for password:
# Use your GitHub Personal Access Token (not your password)
```

### Verify on GitHub

Go to: `https://github.com/YOUR-USERNAME/project`

Should see:
- ✅ All files uploaded
- ✅ Commit history
- ✅ Folder structure intact

---

## Vercel Deployment

### Method 1: Web Dashboard (Easiest)

1. Go to: https://vercel.com
2. Click: "New Project"
3. Select: "Import Git Repository"
4. Paste: `https://github.com/YOUR-USERNAME/project.git`
5. Vercel auto-connects to your GitHub repo
6. Click: "Import"

### Method 2: CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel deploy

# Link to GitHub project
# (Follow prompts)
```

### Configure Environment Variables

After import, in Vercel dashboard:

1. Click: Settings tab
2. Click: Environment Variables
3. Add each variable:

```
MONGODB_URI = mongodb+srv://user:pass@cluster.mongodb.net/buildnext
NEXTAUTH_SECRET = (generate NEW one, don't reuse local)
NEXTAUTH_URL = https://your-vercel-url.vercel.app
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME = your-cloud-name
CLOUDINARY_API_KEY = your-api-key
CLOUDINARY_API_SECRET = your-api-secret
GMAIL_USER = your-email@gmail.com
GMAIL_PASSWORD = your-app-password
NODE_ENV = production
```

### Deploy

1. Click: "Deploy" button
2. Wait: 2-3 minutes (Vercel builds)
3. See: "Congratulations! Your site is live"
4. Copy: Vercel URL (https://xxx.vercel.app)

### Test Live Deployment

Go to your Vercel URL:
- ✅ Login page loads
- ✅ Signup works
- ✅ Dashboard accessible
- ✅ Database connected
- ✅ Images load (Cloudinary)
- ✅ No console errors

---

## Post-Deployment

### 1. Verify Everything Works

```
✅ Live URL accessible
✅ Signup/Login works
✅ Dashboard loads
✅ Dark mode toggles
✅ Responsive design
✅ No 404 errors
✅ Database connected
```

### 2. Rotate GitHub Token

⚠️ **IMPORTANT**: Your token was shared in this documentation.

```bash
# Go to: https://github.com/settings/tokens

# Find and delete the old token if it exists.
# Replace it with a fresh token generated from GitHub.
# Example placeholder: YOUR_GITHUB_TOKEN_HERE

# Generate NEW token:
# - Click: "Generate new token"
# - Name: "BuildNext Deployment"
# - Scopes: repo (full)
# - Expiration: 90 days
# - Create token
# - Copy immediately!

# Update git config:
git remote set-url origin https://NEW_TOKEN@github.com/oldhsd/project.git
```

### 3. Monitor Deployment

Check Vercel Dashboard:
- Deployments tab: See build history
- Function Logs: See API requests
- Analytics: See traffic

### 4. Share Your MVP

```
📱 Share on LinkedIn: "Just deployed BuildNext MVP!"
🐙 GitHub: Show source code
🌐 Live URL: Share with friends
📊 Portfolio: Add to resume
```

---

## Troubleshooting

### "npm install fails"
```bash
npm install --legacy-peer-deps
npm cache clean --force
```

### "MongoDB won't connect"
```
1. Check URI in .env.local
2. MongoDB Atlas → Network Access → Add 0.0.0.0/0
3. Check username/password correct
4. Check database name matches
```

### "Port 3000 already in use"
```bash
npm run dev -- -p 3001
# Or kill process using port 3000
```

### "Vercel deployment fails"
```
1. Check build logs in Vercel dashboard
2. Verify env variables added
3. Check for TypeScript errors
4. Ensure .env.local not committed
```

### "Dark mode not working"
```bash
# Clear browser cache
# Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
```

### "Images not loading"
```
1. Verify Cloudinary credentials
2. Check free tier limit not exceeded
3. See network tab (F12) for errors
```

---

## Daily Workflow

### Make Changes

```bash
# Edit files in editor
# Test locally: npm run dev

# When ready to deploy:
git add .
git commit -m "Feature: description"
git push origin main

# Vercel automatically rebuilds (2-3 mins)
# Check live URL
```

### Rollback if Needed

```bash
# See commit history
git log --oneline

# Revert to previous commit
git revert <commit-hash>
git push

# Vercel redeploys
```

---

## Performance Optimization

### Lighthouse Check

1. Deployed site → F12 → Lighthouse tab
2. Click: "Analyze page load"
3. Goal: Score >85

### If Score Low

```
1. Optimize images (Next.js Image component)
2. Enable caching (headers in next.config.js)
3. Code splitting (automatic with Next.js)
4. Database indexing (MongoDB)
```

---

## Next Steps After MVP

### Week 1: Monitor & Test
- Monitor Vercel logs
- Get user feedback
- Fix bugs

### Week 2: Enhance
- Add more features
- Improve design
- Performance optimization

### Week 3+: Scale
- AI features
- Mentor system
- Partner integrations

---

## Support

**Issues/Questions:**
- GitHub: Create issue in your repo
- Vercel: https://vercel.com/support
- MongoDB: https://www.mongodb.com/support

---

## Checklist: From Local to Live

```
□ npm install successful
□ .env.local created with all variables
□ npm run dev works
□ Local signup/login tested
□ GitHub repo initialized
□ Code committed
□ Pushed to GitHub
□ Vercel account created
□ Project imported to Vercel
□ Environment variables added
□ Deploy successful
□ Live URL working
□ All features tested
□ No console errors
□ Old token rotated
□ URL shared
□ Ready for users!
```

---

**Congratulations! Your MVP is now production-ready and live! 🎉**

Build. Ship. Scale. 🚀
