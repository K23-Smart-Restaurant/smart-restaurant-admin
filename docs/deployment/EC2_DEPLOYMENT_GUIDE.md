# EC2 Deployment Guide
# Smart Restaurant Admin & Customer Apps

This guide covers deploying both applications to AWS EC2 using GitHub Actions.

---

## 📁 EC2 Directory Structure

```
~/smart-restaurant/
├── smart-restaurant-admin/
│   ├── client/
│   │   └── dist/          # Built frontend files
│   ├── server/
│   │   ├── .env           # Created by GitHub Actions
│   │   └── src/
│   └── .git/
│
└── smart-restaurant-customer/
    ├── client/
    │   └── dist/          # Built frontend files
    ├── server/
    │   ├── .env           # Created by GitHub Actions
    │   └── src/
    └── .git/
```

---

## 🚀 Initial EC2 Setup (One-Time)

### Step 1: Connect to EC2

```bash
chmod 400 your-key.pem
ssh -i your-key.pem ubuntu@your-ec2-ip
```

### Step 2: Install Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx

# Install Git
sudo apt install -y git
```

### Step 3: Clone Repositories

```bash
# Create project directory
mkdir -p ~/smart-restaurant
cd ~/smart-restaurant

# Clone Admin repo
git clone https://github.com/your-username/smart-restaurant-admin.git

# Clone Customer repo
git clone https://github.com/your-username/smart-restaurant-customer.git
```

### Step 4: Setup Admin Backend

```bash
cd ~/smart-restaurant/smart-restaurant-admin/server

# Install dependencies
npm ci --only=production

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Start with PM2
pm2 start src/index.js --name smart-restaurant-admin-api
```

### Step 5: Setup Customer Backend

```bash
cd ~/smart-restaurant/smart-restaurant-customer/server

# Install dependencies
npm ci --only=production

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Start with PM2
pm2 start src/index.js --name smart-restaurant-customer-api
```

### Step 6: Save PM2 Configuration

```bash
pm2 save
pm2 startup
# Follow the instructions from the command output
```

---

## 🌐 Nginx Configuration

### Admin App Configuration

Create `/etc/nginx/sites-available/admin`:

```nginx
# Admin Backend API
server {
    listen 80;
    server_name _;  # Replace with admin.yourdomain.com if using domain

    # Backend API
    location /api {
        proxy_pass http://localhost:3001/api;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket (Socket.IO)
    location /socket.io {
        proxy_pass http://localhost:3001/socket.io;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    # Admin Frontend
    location / {
        root /home/ubuntu/smart-restaurant/smart-restaurant-admin/client/dist;
        try_files $uri $uri/ /index.html;

        # Caching
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
}
```

### Customer App Configuration

Create `/etc/nginx/sites-available/customer`:

```nginx
# Customer Backend API (Port 3002)
server {
    listen 3000;  # Customer frontend port
    server_name _;  # Replace with yourdomain.com if using domain

    # Backend API
    location /api {
        proxy_pass http://localhost:3002/api;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket (Socket.IO)
    location /socket.io {
        proxy_pass http://localhost:3002/socket.io;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    # Customer Frontend
    location / {
        root /home/ubuntu/smart-restaurant/smart-restaurant-customer/client/dist;
        try_files $uri $uri/ /index.html;

        # Caching
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
}
```

### Enable Sites and Restart Nginx

```bash
# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Enable both sites
sudo ln -s /etc/nginx/sites-available/admin /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/customer /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

---

## 🔒 Security Group Configuration

Ensure your EC2 security group allows:

| Port | Protocol | Source | Purpose |
|------|----------|--------|---------|
| 22 | TCP | Your IP | SSH access |
| 80 | TCP | 0.0.0.0/0 | HTTP (Admin) |
| 443 | TCP | 0.0.0.0/0 | HTTPS |
| 3000 | TCP | 0.0.0.0/0 | Customer App |
| 3001 | TCP | 0.0.0.0/0 | Admin API (optional if using Nginx proxy) |
| 3002 | TCP | 0.0.0.0/0 | Customer API (optional if using Nginx proxy) |

---

## 📦 GitHub Secrets Setup

### For smart-restaurant-admin Repository

```bash
# EC2 Connection
EC2_SSH_KEY=<your-pem-file-content>
EC2_HOST=54.123.45.67
EC2_USER=ubuntu

# Frontend
VITE_API_URL=http://54.123.45.67/api
VITE_WS_URL=http://54.123.45.67

# Backend
DATABASE_URL=postgresql://...
JWT_SECRET=<generate-with-crypto>
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
CLIENT_URL=http://54.123.45.67
CUSTOMER_APP_URL=http://54.123.45.67:3000
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJh...
REDIS_URL=redis://...
QR_TOKEN_SECRET=<generate-with-crypto>
```

### For smart-restaurant-customer Repository

```bash
# EC2 Connection (same as admin)
EC2_SSH_KEY=<same-as-admin>
EC2_HOST=54.123.45.67
EC2_USER=ubuntu

# Frontend
VITE_API_URL=http://54.123.45.67:3000/api
VITE_WS_URL=http://54.123.45.67:3000
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Backend
DATABASE_URL=postgresql://...
JWT_SECRET=<can-be-different>
STRIPE_SECRET_KEY=sk_test_...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_CALLBACK_URL=http://54.123.45.67:3002/api/auth/google/callback
CLIENT_URL=http://54.123.45.67:3000
QR_TOKEN_SECRET=<same-as-admin-recommended>
REDIS_URL=redis://...
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=<gmail-app-password>
EMAIL_FROM_NAME=Smart Restaurant
EMAIL_FROM_ADDRESS=noreply@smartrestaurant.com
```

---

## 🔄 Deployment Workflow

### Automatic Deployment

1. **Make changes locally**
2. **Commit and push:**
   ```bash
   git add .
   git commit -m "Your changes"
   git push origin main
   ```
3. **GitHub Actions automatically:**
   - Builds frontend with production env vars
   - Creates backend .env on EC2
   - Deploys code
   - Runs migrations
   - Restarts services

### Manual Deployment (if needed)

```bash
# SSH into EC2
ssh -i your-key.pem ubuntu@your-ec2-ip

# Deploy Admin
cd ~/smart-restaurant/smart-restaurant-admin/server
git pull origin main
npm ci --only=production
npx prisma migrate deploy
pm2 restart smart-restaurant-admin-api

# Deploy Customer
cd ~/smart-restaurant/smart-restaurant-customer/server
git pull origin main
npm ci --only=production
npx prisma migrate deploy
pm2 restart smart-restaurant-customer-api

# Reload Nginx
sudo systemctl reload nginx
```

---

## 🧪 Testing Deployment

### Test Admin App

```bash
# Backend health check
curl http://your-ec2-ip/api/health

# Frontend
curl http://your-ec2-ip

# WebSocket (if health endpoint exists)
curl http://your-ec2-ip/socket.io
```

### Test Customer App

```bash
# Backend health check
curl http://your-ec2-ip:3002/api/health

# Frontend
curl http://your-ec2-ip:3000

# WebSocket
curl http://your-ec2-ip:3000/socket.io
```

### View Logs

```bash
# PM2 logs
pm2 logs smart-restaurant-admin-api
pm2 logs smart-restaurant-customer-api

# Nginx logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log

# Application logs (if Winston is configured)
tail -f ~/smart-restaurant/smart-restaurant-admin/server/logs/combined.log
tail -f ~/smart-restaurant/smart-restaurant-customer/server/logs/combined.log
```

---


## 📊 Monitoring

### PM2 Commands

```bash
# Status of all processes
pm2 status

# Monitor resources
pm2 monit

# View specific logs
pm2 logs smart-restaurant-admin-api --lines 100
pm2 logs smart-restaurant-customer-api --lines 100

# Restart services
pm2 restart smart-restaurant-admin-api
pm2 restart smart-restaurant-customer-api

# Stop services
pm2 stop smart-restaurant-admin-api
pm2 stop smart-restaurant-customer-api
```

---

## 🐛 Troubleshooting

### Backend Not Running

```bash
# Check PM2 status
pm2 status

# View logs for errors
pm2 logs smart-restaurant-admin-api --err
pm2 logs smart-restaurant-customer-api --err

# Restart
pm2 restart all
```

### Frontend Not Loading

```bash
# Check if dist folder exists
ls -la ~/smart-restaurant/smart-restaurant-admin/client/dist
ls -la ~/smart-restaurant/smart-restaurant-customer/client/dist

# Check Nginx configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### Database Connection Errors

```bash
# Verify DATABASE_URL in .env
cat ~/smart-restaurant/smart-restaurant-admin/server/.env | grep DATABASE_URL
cat ~/smart-restaurant/smart-restaurant-customer/server/.env | grep DATABASE_URL

# Test Prisma connection
cd ~/smart-restaurant/smart-restaurant-admin/server
npx prisma db pull
```

### Port Already in Use

```bash
# Find process using port 3001
sudo lsof -i :3001

# Kill process
sudo kill -9 <PID>

# Restart PM2
pm2 restart smart-restaurant-admin-api
```

---

## 🔐 Security Best Practices

1. ✅ Change default SSH port from 22
2. ✅ Use SSH key authentication only (disable password auth)
3. ✅ Setup firewall rules (UFW)
4. ✅ Enable automatic security updates
5. ✅ Use HTTPS with Let's Encrypt
6. ✅ Rotate credentials regularly
7. ✅ Monitor logs for suspicious activity
8. ✅ Keep Node.js and dependencies updated

---

## 📚 Additional Resources

- [GITHUB_SECRETS_SETUP.md](./GITHUB_SECRETS_SETUP.md) - Complete secrets configuration
- [DEPLOYMENT.md](./DEPLOYMENT.md) - General deployment guide
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture

---

**Your EC2 deployment is ready! 🚀**
