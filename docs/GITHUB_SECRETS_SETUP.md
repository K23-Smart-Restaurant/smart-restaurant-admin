# GitHub Secrets Setup Guide
# Smart Restaurant Projects - EC2 Deployment

This guide explains how to configure GitHub Secrets for both **smart-restaurant-admin** and **smart-restaurant-customer** projects.

---

## 🎯 Overview

**Approach:** GitHub Secrets → Create .env During Build

- **Frontend:** `.env` file created from GitHub Secrets during build (build-time variables)
- **Backend:** `.env` file created on EC2 from GitHub Secrets during deployment (runtime variables)
- **No .env files committed to Git** ✅

---

## 📋 GitHub Secrets Configuration

### How to Add Secrets

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add each secret from the tables below

---

## 🔧 Smart Restaurant Admin - GitHub Secrets

Repository: `smart-restaurant-admin`

### EC2 Connection (Shared Secrets - Same for both projects)

| Secret Name | Value | Example |
|-------------|-------|---------|
| `EC2_SSH_KEY` | Your EC2 private key (.pem file content) | `-----BEGIN RSA PRIVATE KEY-----\n...` |
| `EC2_HOST` | EC2 public IP or domain | `54.123.45.67` or `ec2.yourdomain.com` |
| `EC2_USER` | SSH username | `ubuntu` |

### Frontend Environment Variables

| Secret Name | Value | Example |
|-------------|-------|---------|
| `VITE_API_URL` | Admin backend API URL | `http://54.123.45.67:3001/api` |
| `VITE_WS_URL` | Admin WebSocket URL | `http://54.123.45.67:3001` |

### Backend Environment Variables

| Secret Name | Value | Example |
|-------------|-------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:pass@host:6543/postgres?pgbouncer=true` |
| `JWT_SECRET` | JWT signing secret (256-bit) | Generate with: `node -e "..."` |
| `STRIPE_SECRET_KEY` | Stripe secret key | `sk_test_...` or `sk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret | `whsec_...` |
| `CLIENT_URL` | Admin frontend URL | `http://54.123.45.67` or `https://admin.yourdomain.com` |
| `CUSTOMER_APP_URL` | Customer app URL | `http://54.123.45.67:3000` or `https://customer.yourdomain.com` |
| `SUPABASE_URL` | Supabase project URL | `https://xxxxx.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | `eyJhbGci...` |
| `REDIS_URL` | Redis connection string | `redis://default:pass@host:11529` |
| `QR_TOKEN_SECRET` | QR token secret (256-bit) | Generate with: `node -e "..."` |

### Total Secrets for Admin: **15 secrets**

---

## 🛍️ Smart Restaurant Customer - GitHub Secrets

Repository: `smart-restaurant-customer`

### EC2 Connection (Use Same Values)

| Secret Name | Value |
|-------------|-------|
| `EC2_SSH_KEY` | Same as admin |
| `EC2_HOST` | Same as admin |
| `EC2_USER` | Same as admin |

### Frontend Environment Variables

| Secret Name | Value | Example |
|-------------|-------|---------|
| `VITE_API_URL` | Customer backend API URL | `http://54.123.45.67:3002/api` |
| `VITE_WS_URL` | Customer WebSocket URL | `http://54.123.45.67:3002` |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | `pk_test_...` or `pk_live_...` |

### Backend Environment Variables

| Secret Name | Value | Example |
|-------------|-------|---------|
| `DATABASE_URL` | PostgreSQL (same as admin) | `postgresql://...` |
| `JWT_SECRET` | JWT secret (can be different from admin) | Generate new or reuse |
| `STRIPE_SECRET_KEY` | Stripe secret key (same as admin) | `sk_test_...` |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | `668722833029-...` |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | `GOCSPX-...` |
| `GOOGLE_CALLBACK_URL` | Google OAuth callback URL | `http://54.123.45.67:3002/api/auth/google/callback` |
| `CLIENT_URL` | Customer frontend URL | `http://54.123.45.67:3000` or `https://yourdomain.com` |
| `QR_TOKEN_SECRET` | QR token secret (same as admin recommended) | Same as admin |
| `REDIS_URL` | Redis URL (same as admin) | Same as admin |
| `SMTP_HOST` | SMTP server hostname | `smtp.gmail.com` |
| `SMTP_PORT` | SMTP port | `587` |
| `SMTP_SECURE` | Use TLS | `false` |
| `SMTP_USER` | Email address for sending | `your-email@gmail.com` |
| `SMTP_PASS` | Email app password | Gmail app password |
| `EMAIL_FROM_NAME` | Sender name | `Smart Restaurant` |
| `EMAIL_FROM_ADDRESS` | Sender email | `noreply@smartrestaurant.com` |

### Total Secrets for Customer: **20 secrets**

---

## 🔐 How to Get Secret Values

### 1. EC2 SSH Key

```bash
# Windows (PowerShell)
Get-Content your-key.pem | Set-Clipboard

# Mac/Linux
cat your-key.pem | pbcopy  # Mac
cat your-key.pem | xclip -selection clipboard  # Linux
```

Copy entire content including `-----BEGIN` and `-----END` lines.

### 2. Generate JWT_SECRET and QR_TOKEN_SECRET

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Output will be 64 characters (256-bit). Use different values for each or same based on security requirements.

### 3. Database URL (Supabase)

1. Go to https://supabase.com/dashboard
2. Select your project
3. Settings → Database
4. Copy **Connection string** (with pooler)
5. Format: `postgresql://postgres:[password]@[host]:6543/postgres?pgbouncer=true`

### 4. Supabase Storage

1. Settings → API
2. Copy **URL** for `SUPABASE_URL`
3. Copy **service_role** secret for `SUPABASE_SERVICE_ROLE_KEY`

### 5. Redis URL

From Redis Labs or your Redis provider:
```
redis://default:[password]@[host]:[port]
```

### 6. Stripe Keys

1. Go to https://dashboard.stripe.com
2. Developers → API keys
3. For testing: Use test keys (`sk_test_...`, `pk_test_...`)
4. For production: Toggle to "Live mode" and use live keys

### 7. Google OAuth (Customer App)

1. Go to https://console.cloud.google.com
2. Create or select project
3. APIs & Services → Credentials
4. Create OAuth 2.0 Client ID
5. Set redirect URI: `http://your-ec2-ip:3002/api/auth/google/callback`

### 8. Gmail SMTP (Customer App)

1. Enable 2-Step Verification in your Google Account
2. Go to App Passwords: https://myaccount.google.com/apppasswords
3. Generate app password
4. Use your email for `SMTP_USER`
5. Use generated password for `SMTP_PASS`

---

## 📍 URL Configuration Examples

### Option 1: Using EC2 Public IP

```bash
# Admin URLs
VITE_API_URL=http://54.123.45.67:3001/api
VITE_WS_URL=http://54.123.45.67:3001
CLIENT_URL=http://54.123.45.67

# Customer URLs
VITE_API_URL=http://54.123.45.67:3002/api
VITE_WS_URL=http://54.123.45.67:3002
CLIENT_URL=http://54.123.45.67:3000
GOOGLE_CALLBACK_URL=http://54.123.45.67:3002/api/auth/google/callback
```

### Option 2: Using Custom Domains

```bash
# Admin URLs
VITE_API_URL=https://admin-api.yourdomain.com/api
VITE_WS_URL=https://admin-api.yourdomain.com
CLIENT_URL=https://admin.yourdomain.com

# Customer URLs
VITE_API_URL=https://api.yourdomain.com/api
VITE_WS_URL=https://api.yourdomain.com
CLIENT_URL=https://yourdomain.com
GOOGLE_CALLBACK_URL=https://api.yourdomain.com/api/auth/google/callback
```

---

## ✅ Secrets Checklist

### Admin Project (`smart-restaurant-admin`)

**EC2 Connection:**
- [ ] EC2_SSH_KEY
- [ ] EC2_HOST
- [ ] EC2_USER

**Frontend:**
- [ ] VITE_API_URL
- [ ] VITE_WS_URL

**Backend:**
- [ ] DATABASE_URL
- [ ] JWT_SECRET
- [ ] STRIPE_SECRET_KEY
- [ ] STRIPE_WEBHOOK_SECRET
- [ ] CLIENT_URL
- [ ] CUSTOMER_APP_URL
- [ ] SUPABASE_URL
- [ ] SUPABASE_SERVICE_ROLE_KEY
- [ ] REDIS_URL
- [ ] QR_TOKEN_SECRET

---

### Customer Project (`smart-restaurant-customer`)

**EC2 Connection:**
- [ ] EC2_SSH_KEY (same)
- [ ] EC2_HOST (same)
- [ ] EC2_USER (same)

**Frontend:**
- [ ] VITE_API_URL
- [ ] VITE_WS_URL
- [ ] VITE_STRIPE_PUBLISHABLE_KEY

**Backend:**
- [ ] DATABASE_URL
- [ ] JWT_SECRET
- [ ] STRIPE_SECRET_KEY
- [ ] GOOGLE_CLIENT_ID
- [ ] GOOGLE_CLIENT_SECRET
- [ ] GOOGLE_CALLBACK_URL
- [ ] CLIENT_URL
- [ ] QR_TOKEN_SECRET
- [ ] REDIS_URL
- [ ] SMTP_HOST
- [ ] SMTP_PORT
- [ ] SMTP_SECURE
- [ ] SMTP_USER
- [ ] SMTP_PASS
- [ ] EMAIL_FROM_NAME
- [ ] EMAIL_FROM_ADDRESS

---

## 🚀 Deployment Process

Once all secrets are configured:

### 1. Push to Trigger Deployment

```bash
git add .
git commit -m "Deploy to production"
git push origin main
```

### 2. GitHub Actions Will:

✅ Build frontend with production `VITE_API_URL`
✅ SSH into EC2
✅ Create backend `.env` from secrets
✅ Deploy code
✅ Run database migrations
✅ Restart PM2 processes
✅ Deploy frontend build files
✅ Reload Nginx
✅ Run health checks

### 3. Monitor Deployment

Go to: `https://github.com/your-username/your-repo/actions`

---

## 🐛 Troubleshooting

### "Secret not found" Error

**Cause:** Secret name mismatch (case-sensitive)
**Fix:** Verify secret names match exactly: `VITE_API_URL` not `vite_api_url`

### "Permission denied" SSH Error

**Cause:** Wrong SSH key or EC2_USER
**Fix:**
1. Test manually: `ssh -i your-key.pem ubuntu@your-ec2-ip`
2. Verify `EC2_SSH_KEY` includes full content
3. Check `EC2_USER` is correct (usually `ubuntu`)

### Build Fails - "VITE_API_URL is undefined"

**Cause:** Secret not set
**Fix:** Add `VITE_API_URL` to GitHub Secrets

### Backend Health Check Fails

**Cause:** Backend not running or wrong URL
**Fix:**
```bash
ssh -i your-key.pem ubuntu@your-ec2-ip
pm2 status
pm2 logs smart-restaurant-admin-api
```

---

## 🔒 Security Best Practices

1. ✅ **Never commit** `.env` files to Git
2. ✅ **Use different** JWT secrets for admin vs customer (recommended)
3. ✅ **Rotate secrets** every 90 days
4. ✅ **Use test keys** during development
5. ✅ **Enable 2FA** on GitHub, AWS, Supabase accounts
6. ✅ **Limit SSH access** by IP in EC2 security groups
7. ✅ **Use HTTPS** in production (setup SSL)
8. ✅ **Review logs** regularly for unauthorized access

---

## 📞 Support

**If deployment fails:**
1. Check GitHub Actions logs
2. SSH into EC2 and check PM2 logs
3. Verify all secrets are set correctly
4. Ensure EC2 security groups allow required ports

---

**Ready to deploy! 🚀**
