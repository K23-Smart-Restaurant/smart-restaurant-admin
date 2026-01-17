# Quick Start: EC2 Deployment with GitHub Actions

## ✅ What Was Implemented

**Approach 1:** GitHub Secrets → Create .env During Build

### How It Works

```
Local Development
├─ client/.env (gitignored)
└─ server/.env (gitignored)
         ↓
    git push origin main
         ↓
GitHub Actions
├─ Creates client/.env from SECRETS → Builds Frontend
└─ SSH to EC2 → Creates server/.env → Deploys Backend
         ↓
EC2 Production
├─ Frontend: Nginx serves built files
└─ Backend: PM2 runs with .env from secrets
```

---

## 🚀 Quick Setup Steps

### 1. Add GitHub Secrets (One-Time)

**For both repositories:**

Go to Settings → Secrets → Actions → New secret

**Minimum required:**
```
EC2_SSH_KEY          = <content of your .pem file>
EC2_HOST             = 54.123.45.67
EC2_USER             = ubuntu
VITE_API_URL         = http://54.123.45.67:PORT/api
VITE_WS_URL          = http://54.123.45.67:PORT
DATABASE_URL         = postgresql://...
JWT_SECRET           = <generate>
REDIS_URL            = redis://...
```

See [GITHUB_SECRETS_SETUP.md](./GITHUB_SECRETS_SETUP.md) for complete list.

### 2. Setup EC2 (One-Time)

```bash
# SSH into EC2
ssh -i your-key.pem ubuntu@your-ec2-ip

# Install Node.js, PM2, Nginx
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs nginx git
sudo npm install -g pm2

# Clone repositories
mkdir -p ~/smart-restaurant
cd ~/smart-restaurant
git clone <admin-repo-url> smart-restaurant-admin
git clone <customer-repo-url> smart-restaurant-customer

# Setup and start services (see EC2_DEPLOYMENT_GUIDE.md)
```

### 3. Configure Nginx

See [EC2_DEPLOYMENT_GUIDE.md](./EC2_DEPLOYMENT_GUIDE.md) for complete Nginx configuration.

### 4. Deploy

```bash
# Just push to main!
git push origin main
```

GitHub Actions will automatically:
1. ✅ Build frontend with production URLs
2. ✅ Create backend .env on EC2
3. ✅ Deploy code
4. ✅ Run migrations
5. ✅ Restart services

---

## 📁 Files Created

### Admin Project

```
smart-restaurant-admin/
├── .github/workflows/
│   └── deploy-ec2.yml              ← GitHub Actions workflow
└── docs/
    ├── GITHUB_SECRETS_SETUP.md     ← How to configure secrets
    ├── EC2_DEPLOYMENT_GUIDE.md     ← EC2 setup instructions
    └── QUICK_START.md              ← This file
```

### Customer Project

```
smart-restaurant-customer/
└── .github/workflows/
    └── deploy-ec2.yml              ← GitHub Actions workflow
```

---

## 🌐 URLs After Deployment

### Admin App
- **Frontend:** `http://your-ec2-ip` (port 80)
- **Backend:** `http://your-ec2-ip:3001`
- **API:** `http://your-ec2-ip/api`

### Customer App
- **Frontend:** `http://your-ec2-ip:3000`
- **Backend:** `http://your-ec2-ip:3002`
- **API:** `http://your-ec2-ip:3000/api`

---

## 💡 Key Benefits

✅ **No .env files in Git** - Everything from GitHub Secrets
✅ **Automatic deployment** - Push to deploy
✅ **Build-time injection** - Frontend gets correct API URLs
✅ **Secure** - Secrets stored in GitHub, never exposed
✅ **Consistent** - Same process for admin and customer apps

---

## 📖 Documentation

1. **[GITHUB_SECRETS_SETUP.md](./GITHUB_SECRETS_SETUP.md)** - Complete list of required secrets
2. **[EC2_DEPLOYMENT_GUIDE.md](./EC2_DEPLOYMENT_GUIDE.md)** - EC2 initial setup and Nginx config
3. **[DEPLOYMENT.md](./DEPLOYMENT.md)** - General deployment strategies

---

## 🎯 Next Steps

1. [ ] Configure all GitHub Secrets
2. [ ] Setup EC2 instance (install Node.js, PM2, Nginx)
3. [ ] Clone repositories on EC2
4. [ ] Configure Nginx
5. [ ] Push to main branch
6. [ ] Monitor GitHub Actions deployment
7. [ ] Test applications

---

**Ready to deploy! 🚀**
