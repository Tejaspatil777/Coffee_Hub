# 🚀 Push to GitHub - Step by Step Guide

## Step 1: Initialize Git Repository

Open terminal in project root (`G:\coffee\javabits`):

```bash
cd G:\coffee\javabits
git init
```

## Step 2: Configure Git (First Time Only)

If you haven't set up git yet:

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

## Step 3: Add All Files

```bash
git add .
```

## Step 4: Commit Changes

```bash
git commit -m "Initial commit: React + Spring Boot Coffee Hub application

- Complete API integration layer
- Backend: Java Spring Boot REST APIs
- Frontend: React with TypeScript
- Features: Auth, Menu, Orders, Cart, Payments, Admin
- Database: MySQL with Flyway migrations
- Documentation: API guides and quick start"
```

## Step 5: Create GitHub Repository

### Option A: Using GitHub Website

1. Go to https://github.com
2. Click **"+"** icon → **"New repository"**
3. Repository name: `coffee-hub` (or your preferred name)
4. Description: "Coffee shop management system with React frontend and Spring Boot backend"
5. Choose **Public** or **Private**
6. **DO NOT** initialize with README, .gitignore, or license
7. Click **"Create repository"**

### Option B: Using GitHub CLI (if installed)

```bash
gh repo create coffee-hub --public --source=. --remote=origin
```

## Step 6: Add Remote and Push

After creating the repository, GitHub will show you commands. Use these:

```bash
# Add remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/coffee-hub.git

# Rename branch to main (if needed)
git branch -M main

# Push to GitHub
git push -u origin main
```

**Example:**
```bash
git remote add origin https://github.com/johndoe/coffee-hub.git
git branch -M main
git push -u origin main
```

## Step 7: Verify

Visit your GitHub repository URL to see your code!

---

## 🔐 Important: Protect Sensitive Data

### Files Already Protected (.gitignore):

✅ `backend/.env` - Database passwords  
✅ `backend/application-local.yml` - Local config  
✅ `frontend/.env` - API keys  
✅ `node_modules/` - Dependencies  
✅ `target/` - Compiled files  
✅ `.idea/`, `.vscode/` - IDE files  

### Create Example Files (Instead of Real Ones):

The project already has:
- ✅ `backend/.env.example` 
- ✅ `frontend/.env.example`

These are safe to push and help other developers know what variables are needed.

---

## 📝 Complete Command Sequence

Copy and paste these commands (update YOUR_USERNAME):

```bash
# Navigate to project root
cd G:\coffee\javabits

# Initialize git
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: Coffee Hub application"

# Add remote (UPDATE THIS LINE!)
git remote add origin https://github.com/YOUR_USERNAME/coffee-hub.git

# Push
git branch -M main
git push -u origin main
```

---

## 🌿 Working with Branches

### Create a New Branch

```bash
# Create and switch to new branch
git checkout -b feature/new-feature

# Make changes, then add and commit
git add .
git commit -m "Add new feature"

# Push branch to GitHub
git push -u origin feature/new-feature
```

### Switch Between Branches

```bash
# Switch to existing branch
git checkout main

# Switch to another branch
git checkout feature/new-feature
```

### List All Branches

```bash
# Local branches
git branch

# All branches (including remote)
git branch -a
```

---

## 🔄 Daily Workflow

### Making Changes

```bash
# Check status
git status

# Add changes
git add .

# Commit with message
git commit -m "Your commit message"

# Push to GitHub
git push
```

### Pull Latest Changes

```bash
# Pull from GitHub
git pull origin main
```

---

## 📋 Project Structure for GitHub

Your repository will look like this:

```
coffee-hub/
├── backend/
│   ├── src/
│   ├── pom.xml
│   ├── .env.example
│   └── .gitignore
├── frontend/
│   ├── src/
│   ├── package.json
│   ├── .env.example
│   └── .gitignore
├── API_INTEGRATION.md
├── QUICK_START.md
├── CONNECTION_STATUS.md
└── README.md (create this!)
```

---

## 📖 Recommended: Create README.md

Create a file `README.md` in project root:

```markdown
# ☕ Coffee Hub

Coffee shop management system with React frontend and Spring Boot backend.

## Features
- 🔐 User authentication (JWT)
- 📋 Menu management
- 🛒 Shopping cart
- 📦 Order management
- 💳 Stripe payments
- 👥 Admin dashboard
- 🪑 Table management

## Tech Stack
- **Frontend:** React, TypeScript, Vite, Axios
- **Backend:** Java Spring Boot, MySQL, Flyway
- **Payments:** Stripe
- **Security:** JWT

## Quick Start

See [QUICK_START.md](./QUICK_START.md) for detailed setup instructions.

### Backend
```bash
cd backend
./mvnw spring-boot:run
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Documentation
- [API Integration Guide](./API_INTEGRATION.md)
- [Connection Status](./CONNECTION_STATUS.md)
- [Quick Start Guide](./QUICK_START.md)

## License
MIT
```

---

## ✅ Verification Checklist

After pushing:

- [ ] Visit GitHub repository URL
- [ ] Check all files are present
- [ ] Verify .env files are NOT pushed (only .env.example)
- [ ] Check README displays correctly
- [ ] Confirm branch is set to 'main'
- [ ] Test clone on another machine (optional)

---

## 🆘 Troubleshooting

**Error: "remote origin already exists"**
```bash
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/coffee-hub.git
```

**Error: "failed to push"**
```bash
git pull origin main --rebase
git push origin main
```

**Want to undo last commit (before push)?**
```bash
git reset --soft HEAD~1
```

**Remove file from git but keep locally:**
```bash
git rm --cached filename
```

---

## 📌 Quick Reference

```bash
# Status
git status

# Add files
git add .
git add filename

# Commit
git commit -m "message"

# Push
git push

# Pull
git pull

# Create branch
git checkout -b branch-name

# Switch branch
git checkout branch-name

# View remotes
git remote -v

# View history
git log --oneline
```

---

**You're ready to push! 🎉**

Replace `YOUR_USERNAME` in the commands above and execute them one by one.
