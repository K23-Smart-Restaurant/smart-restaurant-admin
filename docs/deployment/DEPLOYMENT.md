# Deployment Guide
# Smart Restaurant Admin

> **Version:** 1.0.0
> **Last Updated:** January 17, 2026
> **Maintainer:** Smart Restaurant Team

---

## 📋 Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Environment Configuration](#environment-configuration)
- [Local Development Setup](#local-development-setup)
- [Docker Deployment](#docker-deployment)
- [Production Deployment](#production-deployment)
  - [Vercel (Frontend)](#vercel-frontend)
  - [Render (Backend)](#render-backend)
  - [AWS Deployment](#aws-deployment)
  - [DigitalOcean Deployment](#digitalocean-deployment)
- [Database Setup](#database-setup)
- [SSL/TLS Configuration](#ssltls-configuration)
- [CI/CD Pipeline](#cicd-pipeline)
- [Monitoring & Logging](#monitoring--logging)
- [Troubleshooting](#troubleshooting)
- [Security Best Practices](#security-best-practices)

---

## 🎯 Overview

The Smart Restaurant Admin application is a full-stack solution consisting of:

- **Frontend:** React 19 + TypeScript + Vite (Client)
- **Backend:** Node.js + Express + Prisma (Server)
- **Database:** PostgreSQL 14+
- **Cache/Pub-Sub:** Redis
- **Storage:** Supabase Storage
- **Real-time:** Socket.IO

This guide provides step-by-step instructions for deploying the application in various environments.

---

## 📦 Prerequisites

### Required Software

| Software | Version | Purpose |
|----------|---------|---------|
| **Node.js** | 18.x or higher | Runtime environment |
| **npm** | 9.x or higher | Package manager |
| **PostgreSQL** | 14.x or higher | Database |
| **Redis** | 6.x or higher | Cache & Pub/Sub |
| **Docker** | 20.x or higher (optional) | Containerization |
| **Git** | Latest | Version control |

### Cloud Services (Production)

- **Supabase** - Database & Storage
- **Redis Labs** - Redis hosting
- **Stripe** - Payment processing
- **Vercel/Render** - Hosting (or alternatives)

---

## ⚙️ Environment Configuration

### Backend Environment Variables

Create a `.env` file in the `server/` directory:

```env
# Server Configuration
PORT=3001
NODE_ENV=production

# Database
DATABASE_URL=postgresql://[user]:[password]@[host]:[port]/[database]?pgbouncer=true

# JWT Authentication
JWT_SECRET=your-256-bit-secret-key-change-in-production
JWT_EXPIRES_IN=7d

# Stripe Payment Integration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# CORS - Client URLs
CLIENT_URL=http://localhost:5173
CUSTOMER_APP_URL=http://localhost:5174

# Production URLs
RENDER_ADMIN_URL=https://your-app.onrender.com
VERCEL_ADMIN_URL=https://your-app.vercel.app

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_DIR=./uploads

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Supabase Storage
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Tax and Service Charges
TAX_RATE=0.10
SERVICE_CHARGE_RATE=0.05

# Kitchen Alert Threshold
PREP_TIME_THRESHOLD_MINUTES=30

# QR Token Secret
QR_TOKEN_SECRET=your-256-bit-secret-key-change-in-production

# Redis
REDIS_URL=redis://default:[password]@[host]:[port]
```

### Frontend Environment Variables

Create a `.env` file in the `client/` directory:

```env
# API Configuration
VITE_API_URL=http://localhost:3001
VITE_WS_URL=http://localhost:3001

# Production URLs
# VITE_API_URL=https://your-api.onrender.com
# VITE_WS_URL=https://your-api.onrender.com

# Stripe (Public Key)
VITE_STRIPE_PUBLIC_KEY=pk_test_your_stripe_public_key

# App Configuration
VITE_APP_NAME=Smart Restaurant Admin
VITE_APP_VERSION=1.0.0
```

---

## 💻 Local Development Setup

### Step 1: Clone the Repository

```bash
git clone https://github.com/your-org/smart-restaurant-admin.git
cd smart-restaurant-admin
```

### Step 2: Install Dependencies

**Backend:**
```bash
cd server
npm install
```

**Frontend:**
```bash
cd client
npm install
```

### Step 3: Database Setup

**Generate Prisma Client:**
```bash
cd server
npx prisma generate
```

**Run Migrations:**
```bash
npx prisma migrate deploy
```

**Seed Database (Optional):**
```bash
npm run db-seed
```

### Step 4: Start Development Servers

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```

The application will be available at:
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3001
- **API Docs:** http://localhost:3001/api-docs

---

## 🐳 Docker Deployment

### Docker Compose Setup

The project includes a `docker-compose.yaml` for easy deployment.

### Step 1: Update Docker Compose

Edit `docker-compose.yaml` to ensure correct paths:

```yaml
services:
  # Client
  client:
    build: ./client
    container_name: smart-restaurant-client
    ports:
      - "5173:80"
    env_file:
      - ./client/.env
    networks:
      - smart-restaurant-network
    restart: unless-stopped

  # Server
  backend:
    build: ./server
    container_name: smart-restaurant-backend
    ports:
      - "3001:3001"
    env_file:
      - ./server/.env
    depends_on:
      - postgres
      - redis
    networks:
      - smart-restaurant-network
    restart: unless-stopped

  # PostgreSQL Database
  postgres:
    image: postgres:14-alpine
    container_name: smart-restaurant-postgres
    environment:
      POSTGRES_USER: ${POSTGRES_USER:-postgres}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-postgres}
      POSTGRES_DB: ${POSTGRES_DB:-smart_restaurant}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    networks:
      - smart-restaurant-network
    restart: unless-stopped

  # Redis
  redis:
    image: redis:7-alpine
    container_name: smart-restaurant-redis
    ports:
      - "6379:6379"
    networks:
      - smart-restaurant-network
    restart: unless-stopped

networks:
  smart-restaurant-network:
    driver: bridge

volumes:
  postgres_data:
```

### Step 2: Create Dockerfiles

**Backend Dockerfile** (`server/Dockerfile`):

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy Prisma schema
COPY prisma ./prisma/

# Generate Prisma client
RUN npx prisma generate

# Copy source code
COPY . .

# Expose port
EXPOSE 3001

# Start application
CMD ["npm", "start"]
```

**Frontend Dockerfile** (`client/Dockerfile`):

```dockerfile
FROM node:18-alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx config (optional)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

**Frontend Nginx Config** (`client/nginx.conf`):

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Enable gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;

    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### Step 3: Build and Run

```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Step 4: Run Database Migrations

```bash
docker-compose exec backend npx prisma migrate deploy
```

---

## 🚀 Production Deployment

### Vercel (Frontend)

#### Prerequisites
- Vercel account
- GitHub repository

#### Deployment Steps

**1. Install Vercel CLI:**
```bash
npm install -g vercel
```

**2. Login to Vercel:**
```bash
vercel login
```

**3. Deploy from Client Directory:**
```bash
cd client
vercel
```

**4. Configure Build Settings:**

- **Framework Preset:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

**5. Add Environment Variables:**

Navigate to Vercel Dashboard → Settings → Environment Variables:

```
VITE_API_URL=https://your-backend.onrender.com
VITE_WS_URL=https://your-backend.onrender.com
VITE_STRIPE_PUBLIC_KEY=pk_live_your_stripe_public_key
```

**6. Deploy:**
```bash
vercel --prod
```

**Alternative: GitHub Integration**

1. Connect GitHub repository to Vercel
2. Select `client` as root directory
3. Configure environment variables
4. Auto-deploy on push to main branch

---

### Render (Backend)

#### Prerequisites
- Render account
- GitHub repository

#### Deployment Steps

**1. Create New Web Service:**
- Go to Render Dashboard → New → Web Service
- Connect GitHub repository
- Select `server` directory

**2. Configure Service:**

| Setting | Value |
|---------|-------|
| **Name** | smart-restaurant-api |
| **Region** | Select nearest region |
| **Branch** | main |
| **Root Directory** | server |
| **Runtime** | Node |
| **Build Command** | `npm install && npx prisma generate` |
| **Start Command** | `npm start` |

**3. Add Environment Variables:**

Add all backend environment variables from `.env` file.

**4. Add PostgreSQL Database:**

- Create Render PostgreSQL database
- Copy `External Database URL`
- Set as `DATABASE_URL` environment variable

**5. Add Redis:**

- Use Redis Labs or Render Redis
- Set `REDIS_URL` environment variable

**6. Deploy:**

Render will automatically deploy on push to main branch.

**7. Run Migrations:**

```bash
# Using Render Shell
npx prisma migrate deploy
```

**Alternative: `render.yaml` Configuration**

Create `server/render.yaml`:

```yaml
services:
  - type: web
    name: smart-restaurant-api
    env: node
    region: oregon
    plan: starter
    buildCommand: npm install && npx prisma generate
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        fromDatabase:
          name: smart-restaurant-db
          property: connectionString
```

---

### AWS Deployment

#### Architecture

- **EC2:** Backend server
- **RDS:** PostgreSQL database
- **ElastiCache:** Redis
- **S3:** File storage (alternative to Supabase)
- **CloudFront:** CDN for frontend
- **Route53:** DNS management
- **Certificate Manager:** SSL certificates

#### Step 1: Setup RDS PostgreSQL

```bash
# Create RDS instance
aws rds create-db-instance \
  --db-instance-identifier smart-restaurant-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --engine-version 14.7 \
  --master-username admin \
  --master-user-password YourPassword123 \
  --allocated-storage 20
```

#### Step 2: Setup ElastiCache Redis

```bash
# Create Redis cluster
aws elasticache create-cache-cluster \
  --cache-cluster-id smart-restaurant-redis \
  --cache-node-type cache.t3.micro \
  --engine redis \
  --num-cache-nodes 1
```

#### Step 3: Setup EC2 Instance

**Launch EC2 instance:**
- AMI: Ubuntu 22.04 LTS
- Instance Type: t3.small or larger
- Security Group: Allow ports 22, 80, 443, 3001

**SSH into instance:**
```bash
ssh -i your-key.pem ubuntu@your-ec2-ip
```

**Install dependencies:**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx

# Install Git
sudo apt install -y git
```

**Clone and setup application:**
```bash
# Clone repository
git clone https://github.com/your-org/smart-restaurant-admin.git
cd smart-restaurant-admin/server

# Install dependencies
npm install

# Setup environment variables
nano .env

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Start with PM2
pm2 start src/index.js --name smart-restaurant-api
pm2 save
pm2 startup
```

#### Step 4: Configure Nginx as Reverse Proxy

```bash
sudo nano /etc/nginx/sites-available/smart-restaurant
```

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/smart-restaurant /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

#### Step 5: Setup SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d api.yourdomain.com

# Auto-renewal
sudo certbot renew --dry-run
```

#### Step 6: Deploy Frontend to S3 + CloudFront

**Build frontend:**
```bash
cd client
npm run build
```

**Create S3 bucket:**
```bash
aws s3 mb s3://smart-restaurant-frontend
```

**Upload build files:**
```bash
aws s3 sync dist/ s3://smart-restaurant-frontend --delete
```

**Create CloudFront distribution:**
```bash
aws cloudfront create-distribution \
  --origin-domain-name smart-restaurant-frontend.s3.amazonaws.com \
  --default-root-object index.html
```

---

### DigitalOcean Deployment

#### Using App Platform

**1. Create New App:**
- Go to DigitalOcean → Apps → Create App
- Connect GitHub repository

**2. Configure Backend Service:**

| Setting | Value |
|---------|-------|
| **Type** | Web Service |
| **Source Directory** | server |
| **Build Command** | `npm install && npx prisma generate` |
| **Run Command** | `npm start` |
| **HTTP Port** | 3001 |

**3. Configure Frontend Service:**

| Setting | Value |
|---------|-------|
| **Type** | Static Site |
| **Source Directory** | client |
| **Build Command** | `npm run build` |
| **Output Directory** | dist |

**4. Add Managed Database:**
- Create PostgreSQL database
- Link to backend service

**5. Add Environment Variables:**
- Add all required environment variables

**6. Deploy:**
- Click "Create Resources"

---

## 🗄️ Database Setup

### Supabase (Recommended)

**1. Create Supabase Project:**
- Go to https://supabase.com
- Create new project
- Note database credentials

**2. Get Connection String:**
```
postgresql://postgres:[password]@[host]:6543/postgres?pgbouncer=true
```

**3. Setup Storage:**
- Enable Storage in Supabase dashboard
- Create bucket: `menu-images`
- Set public access policies

**4. Run Migrations:**
```bash
DATABASE_URL="your-supabase-url" npx prisma migrate deploy
```

### Self-Hosted PostgreSQL

**1. Install PostgreSQL:**
```bash
sudo apt install postgresql postgresql-contrib
```

**2. Create Database:**
```bash
sudo -u postgres psql
CREATE DATABASE smart_restaurant;
CREATE USER admin WITH PASSWORD 'yourpassword';
GRANT ALL PRIVILEGES ON DATABASE smart_restaurant TO admin;
\q
```

**3. Configure Remote Access:**

Edit `/etc/postgresql/14/main/postgresql.conf`:
```
listen_addresses = '*'
```

Edit `/etc/postgresql/14/main/pg_hba.conf`:
```
host    all             all             0.0.0.0/0            md5
```

**4. Restart PostgreSQL:**
```bash
sudo systemctl restart postgresql
```

---

## 🔒 SSL/TLS Configuration

### Using Let's Encrypt (Free)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
sudo systemctl enable certbot.timer
```

### Using AWS Certificate Manager

1. Request certificate in ACM
2. Validate domain ownership
3. Attach to Load Balancer or CloudFront

### Manual SSL Configuration

```nginx
server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384';
    ssl_prefer_server_ciphers on;

    # ... rest of configuration
}
```

---

## 🔄 CI/CD Pipeline

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy Smart Restaurant Admin

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        working-directory: ./server
        run: npm ci

      - name: Run linter
        working-directory: ./server
        run: npm run lint

      - name: Run tests
        working-directory: ./server
        run: npm test

  test-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        working-directory: ./client
        run: npm ci

      - name: Run linter
        working-directory: ./client
        run: npm run lint

      - name: Build
        working-directory: ./client
        run: npm run build

  deploy-backend:
    needs: [test-backend, test-frontend]
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Deploy to Render
        env:
          RENDER_API_KEY: ${{ secrets.RENDER_API_KEY }}
        run: |
          curl -X POST https://api.render.com/v1/services/${{ secrets.RENDER_SERVICE_ID }}/deploys \
            -H "Authorization: Bearer $RENDER_API_KEY"

  deploy-frontend:
    needs: [test-backend, test-frontend]
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: ./client
```

---

## 📊 Monitoring & Logging

### Application Logging (Winston)

The backend uses Winston for structured logging:

```javascript
// Already configured in server/src/config/winston.js
import logger from './config/winston.js';

logger.info('Application started');
logger.error('Error occurred', { error });
```

**Log Locations:**
- **Development:** Console
- **Production:** `server/logs/combined.log` and `server/logs/error.log`

### PM2 Monitoring

```bash
# View logs
pm2 logs smart-restaurant-api

# Monitor resources
pm2 monit

# View process info
pm2 info smart-restaurant-api
```

### External Monitoring Services

**Recommended Services:**
- **Sentry:** Error tracking
- **LogRocket:** Session replay
- **DataDog:** Infrastructure monitoring
- **New Relic:** APM

**Setup Sentry:**

```bash
npm install @sentry/node
```

```javascript
// server/src/index.js
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

### Health Check Endpoint

Add to `server/src/index.js`:

```javascript
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});
```

---

## 🔧 Troubleshooting

### Common Issues

#### 1. Database Connection Errors

**Error:** `Connection refused to PostgreSQL`

**Solution:**
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Check connection string
echo $DATABASE_URL

# Test connection
npx prisma db pull
```

#### 2. Prisma Migration Issues

**Error:** `Migration failed`

**Solution:**
```bash
# Reset database (development only)
npx prisma migrate reset

# Force deploy
npx prisma migrate deploy --force
```

#### 3. Port Already in Use

**Error:** `Port 3001 is already in use`

**Solution:**
```bash
# Find process
lsof -i :3001

# Kill process
kill -9 <PID>
```

#### 4. CORS Errors

**Error:** `CORS policy blocked`

**Solution:**

Check `CLIENT_URL` and `CUSTOMER_APP_URL` in `.env`:

```env
CLIENT_URL=https://your-frontend-url.com
CUSTOMER_APP_URL=https://your-customer-app-url.com
```

#### 5. WebSocket Connection Failed

**Error:** `WebSocket connection failed`

**Solution:**

Ensure Nginx allows WebSocket upgrades:

```nginx
location / {
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
}
```

#### 6. File Upload Errors

**Error:** `File upload failed`

**Solution:**

Check Supabase credentials and bucket permissions:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

---

## 🔐 Security Best Practices

### 1. Environment Variables

**Never commit `.env` files to Git:**

```bash
# Add to .gitignore
.env
.env.local
.env.production
```

### 2. JWT Security

**Use strong secret keys:**

```bash
# Generate secure random key
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Database Security

- Use connection pooling (pgBouncer)
- Enable SSL for database connections
- Regularly update Prisma and dependencies
- Use prepared statements (automatic with Prisma)

### 4. API Security

**Rate Limiting:**
```javascript
// Already configured in server
RATE_LIMIT_WINDOW_MS=900000  // 15 minutes
RATE_LIMIT_MAX_REQUESTS=100
```

**Helmet.js Security Headers:**
```javascript
// Already configured in server/src/index.js
import helmet from 'helmet';
app.use(helmet());
```

### 5. HTTPS Only

**Force HTTPS in production:**

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$host$request_uri;
}
```

### 6. Dependency Security

**Regular audits:**

```bash
# Check for vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix

# Update dependencies
npm update
```

### 7. CORS Configuration

Whitelist specific origins:

```javascript
// server/src/index.js
const allowedOrigins = [
  process.env.CLIENT_URL,
  process.env.CUSTOMER_APP_URL,
  process.env.RENDER_ADMIN_URL,
  process.env.VERCEL_ADMIN_URL,
].filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
```

---

## 📚 Additional Resources

### Documentation
- [Architecture Guide](./ARCHITECTURE.md)
- [API Documentation](../server/src/docs/openapi.yaml)
- [Multilingual Guide](../MULTILINGUAL_GUIDE.md)

### External Links
- [Prisma Documentation](https://www.prisma.io/docs)
- [Express.js Guide](https://expressjs.com)
- [React Documentation](https://react.dev)
- [Vite Guide](https://vitejs.dev)
- [Socket.IO Documentation](https://socket.io/docs)

---

## 🆘 Support

For issues or questions:
- **GitHub Issues:** [Create an issue](https://github.com/your-org/smart-restaurant-admin/issues)
- **Email:** support@smartrestaurant.com
- **Documentation:** https://docs.smartrestaurant.com

---

## 📝 Deployment Checklist

Before deploying to production, ensure:

- [ ] All environment variables are set correctly
- [ ] Database migrations are up to date
- [ ] SSL certificates are configured
- [ ] CORS origins are whitelisted
- [ ] Rate limiting is enabled
- [ ] Logging and monitoring are configured
- [ ] Health check endpoint is working
- [ ] Backup strategy is in place
- [ ] Security headers are enabled
- [ ] Dependencies are updated and audited
- [ ] WebSocket connections are working
- [ ] File uploads to Supabase are working
- [ ] Redis connection is established
- [ ] PM2 or process manager is configured
- [ ] Domain DNS is configured correctly
- [ ] Payment gateway (Stripe) is in production mode

---

**Happy Deploying! 🚀**
