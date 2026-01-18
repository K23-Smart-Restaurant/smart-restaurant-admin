# GitHub Secrets Setup Guide (Simplified)
# Smart Restaurant Projects - EC2 Deployment

**Maximum Simplicity Approach:**
- ✅ **All .env files created manually on EC2**
- ✅ **Only 3 GitHub Secrets needed for EC2 connection**
- ✅ **No frontend/backend secrets in GitHub at all**

---

## 🎯 Philosophy

**All configuration stays on the server:**
- Frontend build variables → Created once on EC2
- Backend runtime variables → Created once on EC2
- GitHub only needs SSH access to deploy code

**Benefits:**
- 🔒 Maximum security - no secrets in GitHub
- ⚡ Simplest setup - only 3 secrets total
- 🎯 Clear separation - all config on server
- 🔄 Easy updates - SSH and edit files directly

---

## 📋 Required GitHub Secrets

### For BOTH Repositories (Same 3 Secrets)

| Secret Name | Purpose | Example |
|-------------|---------|---------|
| `EC2_SSH_KEY` | SSH private key for EC2 access | `-----BEGIN RSA PRIVATE KEY-----...` |
| `EC2_HOST` | EC2 public IP or domain | `54.123.45.67` |
| `EC2_USER` | SSH username | `ubuntu` |

**Total: 3 secrets (shared across both repos)** ✅

---

## 🔑 How to Get EC2 Secrets

### 1. EC2_SSH_KEY

```bash
# Windows (PowerShell)
Get-Content your-key.pem | Set-Clipboard

# Mac
cat your-key.pem | pbcopy

# Linux
cat your-key.pem | xclip -selection clipboard
```

Copy **entire content** including `-----BEGIN RSA PRIVATE KEY-----` and `-----END RSA PRIVATE KEY-----`

### 2. EC2_HOST

Find in AWS Console:
- EC2 Dashboard → Instances → Select your instance
- Copy **Public IPv4 address** (e.g., `54.123.45.67`)
- Or use your domain if configured (e.g., `ec2.yourdomain.com`)

### 3. EC2_USER

- For Ubuntu AMI: `ubuntu`
- For Amazon Linux: `ec2-user`
- For other AMIs: Check  AMI documentation

---

## 🖥️ Manual .env File Setup on EC2

### Admin Project

#### 1. Backend .env

```bash
ssh -i your-key.pem ubuntu@your-ec2-ip
nano ~/smart-restaurant/smart-restaurant-admin/server/.env
```

**Content:**
```env
# Server Configuration
PORT=3001
NODE_ENV=production

# Database
DATABASE_URL=postgresql://postgres.pkpnqgwptlemdaedxtxu:dQkOxguUTVevNXmm@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true

# JWT Authentication
JWT_SECRET=your-256-bit-secret-key-change-in-production
JWT_EXPIRES_IN=7d

# Stripe Payment Integration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# CORS - Client URLs
CLIENT_URL=http://54.123.45.67
CUSTOMER_APP_URL=http://54.123.45.67:3000

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_DIR=./uploads

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Supabase Storage
SUPABASE_URL=https://pkpnqgwptlemdaedxtxu.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBrcG5xZ3dwdGxlbWRhZWR4dHh1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTc4NTQyOSwiZXhwIjoyMDgxMzYxNDI5fQ.4VqPrAw6cPPb0NGhq8f9S3gwQeeSwBLc9Clp34_2oik

# Tax and Service Charges
TAX_RATE=0.10
SERVICE_CHARGE_RATE=0.05

# Kitchen Alert Threshold
PREP_TIME_THRESHOLD_MINUTES=30

# QR Token Secret
QR_TOKEN_SECRET=your-256-bit-secret-key-change-in-production

# Redis
REDIS_URL=redis://default:QHxNReWHlJa81Ue1YGAWNIdBb3KjRQpG@redis-11529.c273.us-east-1-2.ec2.cloud.redislabs.com:11529
```

**Save:** Ctrl+O, Enter, Ctrl+X

#### 2. Frontend .env

```bash
nano ~/smart-restaurant/smart-restaurant-admin/.env
```

**Content:**
```env
# Frontend Build Variables
VITE_API_URL=http://54.123.45.67/api
VITE_WS_URL=http://54.123.45.67
```

**Save:** Ctrl+O, Enter, Ctrl+X

---

### Customer Project

#### 1. Backend .env

```bash
nano ~/smart-restaurant/smart-restaurant-customer/server/.env
```

**Content:**
```env
# Server Configuration
PORT=3002
NODE_ENV=production

# Database
DATABASE_URL=postgresql://postgres.pkpnqgwptlemdaedxtxu:dQkOxguUTVevNXmm@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres

# JWT Authentication
JWT_SECRET=dev_secret_key_123456789

# Stripe Payment
STRIPE_SECRET_KEY=sk_test_51S1Pd0AHPawL0kSb3PKHgaRAL9kHGPIbP44ZMLdtaciCkthThym4Z3MRJr1uhDwP2ezov8CFounVdmr4bqWXwrIH00QvMnI5BU

# Google OAuth
GOOGLE_CLIENT_ID=668722833029-96j6eq3bu70btlu9kva0nrpit4sk7dq7.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
GOOGLE_CALLBACK_URL=http://54.123.45.67:3002/api/auth/google/callback

# CORS
CLIENT_URL=http://54.123.45.67:3000

# QR Token
QR_TOKEN_SECRET=your-256-bit-secret-key-change-in-production

# Redis
REDIS_URL=redis://default:QHxNReWHlJa81Ue1YGAWNIdBb3KjRQpG@redis-11529.c273.us-east-1-2.ec2.cloud.redislabs.com:11529

# Email (Gmail SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=smart.restaurant.table@gmail.com
SMTP_PASS=sved thhh ytgy hhjw
EMAIL_FROM_NAME=Smart Restaurant
EMAIL_FROM_ADDRESS=noreply@smartrestaurant.com

# Email verification
EMAIL_VERIFICATION_EXPIRATION_HOURS=24
```

**Save:** Ctrl+O, Enter, Ctrl+X

#### 2. Frontend .env

```bash
nano ~/smart-restaurant/smart-restaurant-customer/.env
```

**Content:**
```env
# Frontend Build Variables
NODE_ENV=production
VITE_API_URL=http://54.123.45.67:3000/api
VITE_WS_URL=http://54.123.45.67:3000
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51S1Pd0AHPawL0kSbWH2huAO2eUZFs2WPIkJS1qoGMeMfMMnMrBQS1CUXWALo40MJpYTeiyWKLqY5rgKGqAPtdrpQ00CcNGR0se
```

**Save:** Ctrl+O, Enter, Ctrl+X

---

## 📁 File Structure on EC2

```
~/smart-restaurant/
├── smart-restaurant-admin/
│   ├── .env                        ← Frontend build variables
│   ├── server/
│   │   └── .env                    ← Backend runtime variables
│   ├── docker-compose.yaml
│   └── .git/
│
└── smart-restaurant-customer/
    ├── .env                        ← Frontend build variables
    ├── server/
    │   └── .env                    ← Backend runtime variables
    ├── docker-compose.yaml
    └── .git/
```

---

## 🚀 Deployment Workflow

### What Happens When You Push?

```
git push origin production
         ↓
GitHub Actions:
├─ SSH into EC2 (using EC2_SSH_KEY, EC2_HOST, EC2_USER)
├─ cd ~/smart-restaurant/smart-restaurant-admin
├─ git pull origin production
├─ docker-compose down
├─ docker-compose up -d --build
│   ├─ Reads .env for frontend build args
│   └─ Reads server/.env for backend runtime
└─ docker image prune -f
```

**No secrets passed from GitHub!** ✅
**All configuration read from EC2!** ✅

---

## 🔄 When to Update .env Files

### Update Frontend .env When:
- API URL changes (new domain, different port)
- WebSocket URL changes
- Stripe publishable key changes

```bash
ssh -i your-key.pem ubuntu@your-ec2-ip
nano ~/smart-restaurant/smart-restaurant-admin/.env
# Make changes, save

# Rebuild frontend container
cd ~/smart-restaurant/smart-restaurant-admin
docker-compose up -d --build frontend
```

### Update Backend .env When:
- Database credentials change
- API keys are rotated
- Environment variables change

```bash
ssh -i your-key.pem ubuntu@your-ec2-ip
nano ~/smart-restaurant/smart-restaurant-admin/server/.env
# Make changes, save

# Restart backend container
cd ~/smart-restaurant/smart-restaurant-admin
docker-compose restart backend
```

---

## ✅ Setup Checklist

### One-Time EC2 Setup:

- [ ] Install Docker and Docker Compose
- [ ] Clone both repositories
- [ ] Create admin backend .env (`server/.env`)
- [ ] Create admin frontend .env (`.env`)
- [ ] Create customer backend .env (`server/.env`)
- [ ] Create customer frontend .env (`.env`)

### GitHub Configuration:

- [ ] Add `EC2_SSH_KEY` to admin repo
- [ ] Add `EC2_HOST` to admin repo
- [ ] Add `EC2_USER` to admin repo
- [ ] Add same 3 secrets to customer repo

### Deploy:

- [ ] Push to `production` branch
- [ ] Monitor GitHub Actions
- [ ] Verify deployment

---

## 🎁 Benefits of This Approach

| Feature | Value |
|---------|-------|
| **GitHub Secrets** | Only 3 (EC2 connection) ✅ |
| **Security** | All secrets stay on EC2 ✅ |
| **Simplicity** | Minimal GitHub configuration ✅ |
| **Control** | Direct access via SSH ✅ |
| **Transparency** | Clear where config lives ✅ |
| **Updates** | SSH and edit - no GitHub changes ✅ |

---

## 📞 Need Help?

**Can't SSH into EC2?**
```bash
# Test SSH connection
ssh -i your-key.pem ubuntu@your-ec2-ip

# Check key permissions
chmod 400 your-key.pem
```

**.env file syntax error?**
```bash
# Check logs
cd ~/smart-restaurant/smart-restaurant-admin
docker-compose logs backend
```

**Deployment fails?**
- Check GitHub Actions logs
- Verify all 4 .env files exist on EC2
- Ensure EC2_SSH_KEY includes full key content

---

**Ready to deploy with maximum simplicity! 🚀**

**Total GitHub Secrets needed: 3** (same for both repos!)
