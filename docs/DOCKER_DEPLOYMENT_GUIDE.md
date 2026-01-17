# Docker Deployment Guide
# Smart Restaurant Admin & Customer Apps

Complete guide for deploying both applications using Docker and docker-compose on AWS EC2.

---

## 🎯 Overview

**Deployment Strategy:**
- ✅ **Frontend:** Built with Docker using build-time environment variables
- ✅ **Backend:** Runs in Docker container with `.env` file from EC2
- ✅ **Orchestration:** docker-compose manages both containers
- ✅ **No PM2 needed** - Docker handles process management

---

## 📋 Prerequisites

### On EC2:
- Docker installed
- Docker Compose installed
- Git installed
- Repositories cloned

### GitHub Secrets:
- Only **5-6 secrets** needed per repository
- See [GITHUB_SECRETS_SETUP.md](./GITHUB_SECRETS_SETUP.md)

---

## 🚀 Initial EC2 Setup

### Step 1: Connect to EC2

```bash
chmod 400 your-key.pem
ssh -i your-key.pem ubuntu@your-ec2-ip
```

### Step 2: Install Docker

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add ubuntu user to docker group
sudo usermod -aG docker ubuntu

# Start Docker
sudo systemctl enable docker
sudo systemctl start docker

# Logout and login again for group changes to take effect
exit
ssh -i your-key.pem ubuntu@your-ec2-ip
```

### Step 3: Install Docker Compose

```bash
# Install docker-compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# Make executable
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version
```

### Step 4: Clone Repositories

```bash
# Create project directory
mkdir -p ~/smart-restaurant
cd ~/smart-restaurant

# Clone Admin repo
git clone https://github.com/your-username/smart-restaurant-admin.git

# Clone Customer repo
git clone https://github.com/your-username/smart-restaurant-customer.git
```

### Step 5: Create Backend .env Files

**Admin Backend:**
```bash
nano ~/smart-restaurant/smart-restaurant-admin/server/.env
```

Paste content from [GITHUB_SECRETS_SETUP.md](./GITHUB_SECRETS_SETUP.md#admin-backend-env)

**Customer Backend:**
```bash
nano ~/smart-restaurant/smart-restaurant-customer/server/.env
```

Paste content from [GITHUB_SECRETS_SETUP.md](./GITHUB_SECRETS_SETUP.md#customer-backend-env)

### Step 6: Configure Firewall

```bash
# Allow required ports
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # Admin frontend
sudo ufw allow 3000/tcp  # Customer frontend
sudo ufw allow 3001/tcp  # Admin API (optional if using reverse proxy)
sudo ufw allow 3002/tcp  # Customer API (optional if using reverse proxy)
sudo ufw --force enable
```

---

## 🐳 Docker Architecture

### Directory Structure

```
~/smart-restaurant/
├── smart-restaurant-admin/
│   ├── client/
│   │   ├── Dockerfile              ← Multi-stage build with build args
│   │   ├── nginx.conf              ← Nginx configuration
│   │   └── src/
│   ├── server/
│   │   ├── Dockerfile              ← Backend Docker image
│   │   ├── .env                    ← Created manually (runtime vars)
│   │   └── src/
│   ├── docker-compose.yaml         ← Orchestrates both containers
│   └── .env.production             ← Created by GitHub Actions (build vars)
│
└── smart-restaurant-customer/
    ├── client/
    │   ├── Dockerfile
    │   ├── nginx.conf
    │   └── src/
    ├── server/
    │   ├── Dockerfile
    │   ├── .env                    ← Created manually
    │   └── src/
    ├── docker-compose.yaml
    └── .env.production             ← Created by GitHub Actions
```

### Container Architecture

```
┌─────────────────────────────────────────────────────────┐
│  Admin App (Port 80, 3001)                               │
│  ────────────────────────────────────────                │
│  ┌─────────────┐           ┌──────────────┐             │
│  │  Frontend   │           │  Backend     │             │
│  │  (Nginx)    │◄─────────►│  (Node.js)   │             │
│  │  Port 80    │           │  Port 3001   │             │
│  └─────────────┘           └──────────────┘             │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  Customer App (Port 3000, 3002)                          │
│  ────────────────────────────────────────────────────    │
│  ┌─────────────┐           ┌──────────────┐             │
│  │  Frontend   │           │  Backend     │             │
│  │  (Nginx)    │◄─────────►│  (Node.js)   │             │
│  │  Port 3000  │           │  Port 3002   │             │
│  └─────────────┘           └──────────────┘             │
└─────────────────────────────────────────────────────────┘

         Both connect to external:
         ├─ PostgreSQL (Supabase)
         └─ Redis
```

---

## 🔧 How It Works

### Build Process

**Frontend Dockerfile with Build Args:**
```dockerfile
FROM node:18-alpine AS build

# Accept build arguments (from .env.production)
ARG VITE_API_URL
ARG VITE_WS_URL

# Set as environment variables during build
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_WS_URL=$VITE_WS_URL

# Build the app
RUN npm run build

# Production stage - Nginx serves built files
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
```

**Backend Dockerfile:**
```dockerfile
FROM node:18-alpine

# Install dependencies and generate Prisma client
RUN npm ci --only=production
RUN npx prisma generate

# Runtime uses .env file from EC2
CMD ["npm", "start"]
```

---

## 🚀 Deployment Workflow

### On Push to `production` Branch:

1. **GitHub Actions:**
   - Checks out code
   - SSH into EC2
   - Creates `.env.production` file with `VITE_*` vars
   - Pulls latest code
   - Runs `docker-compose --env-file .env.production up -d --build`

2. **Docker Compose:**
   - Reads `.env.production` for build args
   - Builds frontend with correct API URLs
   - Builds backend container
   - Starts both containers
   - Maps ports to host

3. **Result:**
   - Frontend: Production build with correct API URLs
   - Backend: Running with `.env` from EC2
   - Both containers networked together

---

## 📦 Docker Commands

### View Running Containers

```bash
docker ps
```

### View Logs

```bash
# Admin backend
docker logs smart-restaurant-admin-backend -f

# Admin frontend
docker logs smart-restaurant-admin-frontend -f

# Customer backend
docker logs smart-restaurant-customer-backend -f

# Customer frontend
docker logs smart-restaurant-customer-frontend -f

# Or use docker-compose
cd ~/smart-restaurant/smart-restaurant-admin
docker-compose logs -f
```

### Restart Containers

```bash
cd ~/smart-restaurant/smart-restaurant-admin
docker-compose restart

# Or restart specific service
docker-compose restart backend
docker-compose restart frontend
```

### Stop/Start Containers

```bash
# Stop
docker-compose down

# Start
docker-compose up -d

# Rebuild and start
docker-compose up -d --build
```

### View Container Stats

```bash
docker stats
```

### Access Container Shell

```bash
# Backend shell
docker exec -it smart-restaurant-admin-backend /bin/sh

# Frontend shell
docker exec -it smart-restaurant-admin-frontend /bin/sh
```

---

## 🗄️ Database Migrations

Migrations run automatically inside the backend container on startup, but you can run them manually:

```bash
# Admin
docker exec smart-restaurant-admin-backend npx prisma migrate deploy

# Customer
docker exec smart-restaurant-customer-backend npx prisma migrate deploy
```

---

## 🔄 Manual Deployment

If GitHub Actions isn't working, deploy manually:

```bash
# SSH into EC2
ssh -i your-key.pem ubuntu@your-ec2-ip

# Navigate to project
cd ~/smart-restaurant/smart-restaurant-admin

# Create .env.production manually
cat > .env.production << 'EOF'
VITE_API_URL=http://your-ec2-ip/api
VITE_WS_URL=http://your-ec2-ip
EOF

# Pull latest code
git pull origin production

# Deploy with docker-compose
docker-compose --env-file .env.production up -d --build

# Clean up old images
docker image prune -f
```

---

## 🔍 Troubleshooting

### Container Won't Start

```bash
# Check logs
docker-compose logs backend

# Common issues:
# 1. Missing .env file
ls -la server/.env

# 2. Port already in use
sudo lsof -i :3001

# 3. Docker daemon not running
sudo systemctl status docker
sudo systemctl start docker
```

### Build Fails

```bash
# Clear Docker cache and rebuild
docker-compose down
docker system prune -a -f
docker-compose up -d --build
```

### Frontend Shows Wrong API URL

```bash
# Check .env.production
cat .env.production

# Rebuild frontend container
docker-compose up -d --build frontend
```

### Database Connection Error

```bash
# Check backend .env
docker exec smart-restaurant-admin-backend cat /app/.env | grep DATABASE_URL

# Test connection
docker exec smart-restaurant-admin-backend npx prisma db pull
```

---

## 📊 Health Checks

Both containers have health checks configured:

```yaml
healthcheck:
  test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:3001/health"]
  interval: 30s
  timeout: 10s
  retries: 3
```

Check health status:

```bash
docker ps
# Look at STATUS column - should show "healthy"
```

---

## 🔐 Security Best Practices

1. ✅ **Run as non-root user** in containers (already configured)
2. ✅ **Use multi-stage builds** to reduce image size
3. ✅ **No secrets in images** - use .env files
4. ✅ **Regular updates:** `docker-compose pull && docker-compose up -d`
5. ✅ **Limit resources:** Add resource limits in docker-compose.yaml
6. ✅ **Enable firewall:** Restrict ports to necessary only

---

## 🎯 Benefits of Docker Deployment

| Feature | PM2 | Docker |
|---------|-----|--------|
| **Process Management** | PM2 daemon | Docker engine |
| **Isolation** | ❌ Shared system | ✅ Containerized |
| **Reproducibility** | ⚠️ Env-dependent | ✅ Consistent |
| **Health Checks** | Manual | ✅ Built-in |
| **Resource Limits** | Manual | ✅ Easy to configure |
| **Portability** | ⚠️ OS-dependent | ✅ Cross-platform |
| **Rollback** | Manual | ✅ Easy with images |

---

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [GITHUB_SECRETS_SETUP.md](./GITHUB_SECRETS_SETUP.md) - Secrets configuration
- [QUICK_START.md](./QUICK_START.md) - Quick reference

---

**Docker deployment ready! 🐳**
