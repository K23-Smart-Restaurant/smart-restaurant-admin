# Smart Restaurant Admin - Installation & Setup Guide

> **Version:** 1.0.0  
> **Last Updated:** January 2026

---

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Manual Installation](#manual-installation)
  - [1. Clone the Repository](#1-clone-the-repository)
  - [2. Backend Setup](#2-backend-setup)
  - [3. Frontend Setup](#3-frontend-setup)
  - [4. Running the Application](#4-running-the-application)
- [Environment Configuration](#environment-configuration)
  - [Server Environment Variables](#server-environment-variables)
  - [Client Environment Variables](#client-environment-variables)
- [Database Setup](#database-setup)
- [Docker Deployment](#docker-deployment)
- [Available Scripts](#available-scripts)
- [Troubleshooting](#troubleshooting)

---

## 🔧 Prerequisites

Ensure the following software is installed on your system:

| Software | Version | Download |
|----------|---------|----------|
| **Node.js** | 18.x or higher | [nodejs.org](https://nodejs.org/) |
| **npm** | 9.x or higher | Included with Node.js |
| **PostgreSQL** | 14.x or higher | [postgresql.org](https://www.postgresql.org/download/) |
| **Git** | Latest | [git-scm.com](https://git-scm.com/) |

### Optional (for containerized deployment)
| Software | Version | Download |
|----------|---------|----------|
| **Docker** | Latest | [docker.com](https://www.docker.com/) |
| **Docker Compose** | v2.x | Included with Docker Desktop |

### External Services (Required)
- **PostgreSQL Database** – Local or cloud (Supabase recommended)
- **Redis** – For real-time event pub/sub (Redis Cloud or local)
- **Supabase** – For file storage (avatars, menu images)

---

## ⚡ Quick Start

```bash
# 1. Clone the repository
git clone <repository-url>
cd smart-restaurant-admin

# 2. Install backend dependencies
cd server
npm install

# 3. Configure backend environment (see Environment Configuration section)
# Create server/.env file with required variables

# 4. Generate Prisma client and run migrations
npm run build
npm run migrate

# 5. Seed the database (optional)
npm run db-seed

# 6. Start the backend server
npm run dev

# 7. In a new terminal, install frontend dependencies
cd ../client
npm install

# 8. Configure frontend environment
# Create client/.env file with required variables

# 9. Start the frontend
npm run dev
```

**Access the application:**
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3001/api`

---

## 📦 Manual Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd smart-restaurant-admin
```

### 2. Backend Setup

Navigate to the server directory:

```bash
cd server
```

#### Install Dependencies

```bash
npm install
```

This will automatically run `prisma generate` as a post-install script.

#### Configure Environment

Create a `.env` file in the `server/` directory:

```bash
# Create the file
touch .env
```

Add the required environment variables (see [Server Environment Variables](#server-environment-variables)).

#### Generate Prisma Client

```bash
npm run build
```

#### Run Database Migrations

```bash
# For development (creates migration files)
npm run migrate-dev

# For production (applies existing migrations)
npm run migrate
```

#### Seed Database (Optional)

Populate the database with sample data:

```bash
npm run db-seed
```

### 3. Frontend Setup

Navigate to the client directory:

```bash
cd ../client
```

#### Install Dependencies

```bash
npm install
```

#### Configure Environment

Create a `.env` file in the `client/` directory:

```bash
touch .env
```

Add the required environment variables (see [Client Environment Variables](#client-environment-variables)).

### 4. Running the Application

You need to run both the backend and frontend simultaneously.

#### Terminal 1 - Backend Server

```bash
cd server
npm run dev
```

✅ Server starts at `http://localhost:3001`

#### Terminal 2 - Frontend Client

```bash
cd client
npm run dev
```

✅ Client starts at `http://localhost:5173`

---

## 🔐 Environment Configuration

### Server Environment Variables

Create `server/.env` with the following variables:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Database (PostgreSQL)
DATABASE_URL=postgresql://user:password@localhost:5432/smart_restaurant

# JWT Authentication
JWT_SECRET=your-256-bit-secret-key-change-in-production
JWT_EXPIRES_IN=7d

# QR Code Token Secret
QR_TOKEN_SECRET=your-256-bit-secret-key-change-in-production

# Stripe Payment Integration (Optional)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# CORS - Allowed Client URLs
CLIENT_URL=http://localhost:5173
CUSTOMER_APP_URL=http://localhost:5174

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_DIR=./uploads

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Supabase Storage (Required for image uploads)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Redis (Required for real-time pub/sub)
REDIS_URL=redis://default:password@your-redis-host:6379

# Tax and Service Charges (Optional - defaults provided)
TAX_RATE=0.10
SERVICE_CHARGE_RATE=0.05

# Kitchen Alert Threshold (Optional)
PREP_TIME_THRESHOLD_MINUTES=30
```

#### Required Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret key for JWT token signing |
| `QR_TOKEN_SECRET` | Secret key for QR code token generation |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key for storage |
| `REDIS_URL` | Redis connection URL for real-time events |
| `CLIENT_URL` | Frontend URL for CORS |

### Client Environment Variables

Create `client/.env` with the following variables:

```env
# API Configuration
VITE_API_URL=http://localhost:3001/api

# WebSocket Configuration
VITE_WS_URL=http://localhost:3001
```

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API base URL |
| `VITE_WS_URL` | WebSocket server URL for real-time updates |

---

## 🗄️ Database Setup

### Using Supabase (Recommended)

1. Create a project at [supabase.com](https://supabase.com)
2. Get the connection string from **Settings > Database > Connection string**
3. Use the **Transaction pooler** connection string for `DATABASE_URL`
4. Enable **Storage** for image uploads
5. Create a storage bucket named `menu-images` (public) and `avatars` (public)

### Using Local PostgreSQL

1. Install PostgreSQL
2. Create a database:
   ```bash
   createdb smart_restaurant
   ```
3. Set `DATABASE_URL`:
   ```
   DATABASE_URL=postgresql://postgres:password@localhost:5432/smart_restaurant
   ```

### Database Commands

```bash
# Generate Prisma client
npm run build

# Create and apply migrations (development)
npm run migrate-dev

# Apply existing migrations (production)
npm run migrate

# Reset database (WARNING: deletes all data)
npm run db-reset

# Seed database with sample data
npm run db-seed
```

---

## 🐳 Docker Deployment

The project includes Docker configuration for containerized deployment.

### Build and Run with Docker Compose

```bash
# From the project root directory
docker-compose up --build
```

This starts:
- **Backend** on port `3001`
- **Frontend** on port `5173`

### Docker Services

| Service | Container Name | Port |
|---------|---------------|------|
| Backend | `smart-restaurant-admin-backend` | 3001 |
| Frontend | `smart-restaurant-admin-frontend` | 5173 |

### Environment Variables for Docker

The Docker Compose file reads from:
- `server/.env` for backend configuration
- `client/.env` for frontend configuration

Ensure both `.env` files are properly configured before running Docker.

### Stopping Containers

```bash
docker-compose down
```

---

## 📜 Available Scripts

### Server Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `npm run dev` | Start development server with hot reload (nodemon) |
| `start` | `npm start` | Start production server |
| `build` | `npm run build` | Generate Prisma client |
| `migrate` | `npm run migrate` | Apply database migrations (production) |
| `migrate-dev` | `npm run migrate-dev` | Create and apply migrations (development) |
| `db-reset` | `npm run db-reset` | Reset database (deletes all data) |
| `db-seed` | `npm run db-seed` | Seed database with sample data |
| `lint` | `npm run lint` | Run ESLint |
| `lint:fix` | `npm run lint:fix` | Fix ESLint issues |
| `format` | `npm run format` | Format code with Prettier |
| `format:check` | `npm run format:check` | Check code formatting |
| `test` | `npm test` | Run tests |

### Client Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `npm run dev` | Start Vite development server |
| `build` | `npm run build` | Build for production |
| `preview` | `npm run preview` | Preview production build |
| `lint` | `npm run lint` | Run ESLint |
| `lint:fix` | `npm run lint:fix` | Fix ESLint issues |
| `format` | `npm run format` | Format code with Prettier |
| `format:check` | `npm run format:check` | Check code formatting |
| `test` | `npm test` | Run tests with Vitest |
| `test:run` | `npm run test:run` | Run tests once |
| `test:coverage` | `npm run test:coverage` | Run tests with coverage |

---

## 🐛 Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| **Database connection fails** | Verify `DATABASE_URL` is correct and PostgreSQL is running |
| **Prisma client not found** | Run `npm run build` in the server directory |
| **CORS errors** | Ensure `CLIENT_URL` matches the frontend URL exactly |
| **Port already in use** | Change `PORT` in server `.env` and update `VITE_API_URL` |
| **WebSocket not connecting** | Verify `VITE_WS_URL` matches the server URL |
| **Images not uploading** | Check Supabase configuration and storage bucket permissions |
| **Real-time updates not working** | Verify Redis connection with `REDIS_URL` |
| **npm install fails** | Delete `node_modules` and `package-lock.json`, then run `npm install` |

### Checking Server Logs

```bash
# Development mode shows detailed logs
cd server
npm run dev
```

Logs are also saved to `server/logs/` directory.

### Verifying Database Connection

```bash
cd server
npx prisma db pull
```

If successful, the connection is working.

### Clearing Cache

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

## 🔗 Default Ports

| Service | URL |
|---------|-----|
| Frontend (Vite) | `http://localhost:5173` |
| Backend API | `http://localhost:3001/api` |
| WebSocket | `ws://localhost:3001` |

---

## 📞 Support

If you encounter issues not covered in this guide:
1. Check the [Troubleshooting](#troubleshooting) section
2. Review server logs for error details
3. Contact the development team

---

*© 2026 Smart Restaurant Admin. Developed as part of HCMUS Web Application Development Course.*
