# GitHub Actions Workflows - Admin Repository

This directory contains CI/CD workflows for the **SmartRestaurant Admin** repository.

## 📋 Repository Structure

```
smart-restaurant-admin/
├── server/          # Node.js + Express backend
├── client/          # React + TypeScript frontend
└── .github/
    └── workflows/   # CI/CD workflows
```

## 🚀 Available Workflows

### 1. **Code Quality** (`code-quality.yml`)
**Triggers:** Push to `main`/`develop`, Pull Requests

**What it checks:**
- ✅ ESLint on server (Node.js)
- ✅ ESLint on client (React + TypeScript)
- ✅ Prettier formatting on both
- ✅ TypeScript type checking (client)

---

### 2. **Security Audit** (`security-audit.yml`)
**Triggers:** Push, PRs, Weekly (Mondays 9 AM UTC)

**What it does:**
- 🔒 Runs `npm audit` on server and client
- 🚨 Checks for vulnerabilities
- 📊 Fails on high-severity issues

---

### 3. **Build & Test** (`build-test.yml`)
**Triggers:** Push, Pull Requests

**What it does:**
- 🏗️ Builds server (generates Prisma client)
- 🏗️ Builds client (production bundle)
- 🧪 Runs tests
- 💾 Uploads client build artifacts

---

### 4. **Docker Build & Push** (`docker-build.yml`)
**Triggers:** Push to `main`, Version tags, PRs (build only)

**What it does:**
- 🐳 Builds Docker images for server and client
- 📤 Pushes to GitHub Container Registry
- 🏷️ Tags: `latest`, branch name, SHA, version

**Images:**
- `ghcr.io/<owner>/smart-restaurant-admin-server`
- `ghcr.io/<owner>/smart-restaurant-admin-client`

---

## 📊 Status Badges

Add to your README.md:

```markdown
![Code Quality](https://github.com/<owner>/smart-restaurant-admin/actions/workflows/code-quality.yml/badge.svg)
![Security](https://github.com/<owner>/smart-restaurant-admin/actions/workflows/security-audit.yml/badge.svg)
![Build](https://github.com/<owner>/smart-restaurant-admin/actions/workflows/build-test.yml/badge.svg)
![Docker](https://github.com/<owner>/smart-restaurant-admin/actions/workflows/docker-build.yml/badge.svg)
```

---

## 💡 Local Development

Before pushing:

```bash
# Server
cd server
npm run lint && npm run format:check

# Client
cd client
npm run lint && npm run format:check
```

Auto-fix issues:

```bash
npm run lint:fix && npm run format
```

---

## 🔧 Setup

1. Enable GitHub Actions in repository settings
2. Enable GitHub Container Registry
3. Commit and push workflows
4. Create a test PR to verify

---

**Questions?** See the main project documentation!
