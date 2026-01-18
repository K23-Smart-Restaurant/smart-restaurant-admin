# Smart Restaurant Admin 🍽️

> A modern, full-stack restaurant management system for administrators to efficiently manage tables, menus, orders, staff, and generate QR codes for seamless customer ordering.

[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green?logo=node.js)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-blue?logo=postgresql)](https://www.postgresql.org/)

---

## 📖 Documentation

| Document | Description |
|----------|-------------|
| 📘 [**User Guide**](docs/USER_GUIDE.md) | Complete guide for using the application – features, workflows, and step-by-step instructions |
| ⚙️ [**Setup Guide**](docs/SETUP.md) | Installation, environment configuration, and running the application |
| 🏗️ [**Architecture**](docs/ARCHITECTURE.md) | System design, tech stack, database schema, and code organization |

---

## 🎯 About the Project

**Smart Restaurant Admin** is a comprehensive web-based management system designed for restaurant administrators, managers, and staff. It provides an intuitive dashboard to handle day-to-day restaurant operations.

### What Does It Do?

This application serves as the **administrative control center** for a modern restaurant:

- **📊 Dashboard** – Real-time business metrics, KPIs, and live order notifications
- **🪑 Table Management** – Create tables, track status, generate QR codes (PNG & PDF)
- **🍔 Menu Management** – Organize items with categories, images (up to 5), and modifiers
- **📦 Order Management** – Real-time order tracking with status workflow
- **👥 Staff Management** – Role-based access control (Admin, Waiter, Kitchen Staff)
- **📈 Reports & Analytics** – Revenue trends, top-selling items, performance metrics

---

## � Quick Start

```bash
# 1. Clone and install
git clone <repository-url>
cd smart-restaurant-admin

# 2. Backend setup
cd server
npm install
# Configure server/.env (see Setup Guide)
npm run build && npm run migrate

# 3. Frontend setup (new terminal)
cd client
npm install
# Configure client/.env (see Setup Guide)

# 4. Run both
# Terminal 1: cd server && npm run dev
# Terminal 2: cd client && npm run dev
```

📍 **Frontend:** http://localhost:5173  
📍 **Backend API:** http://localhost:3001/api

→ For detailed installation instructions, see the [**Setup Guide**](docs/SETUP.md)

---

## 🛠️ Tech Stack

| Layer | Technologies |
|-------|--------------|
| **Frontend** | React 19, TypeScript, Vite, TanStack Query, Tailwind CSS |
| **Backend** | Node.js, Express, PostgreSQL, Prisma ORM, Socket.IO |
| **Auth** | JWT, Passport.js, bcrypt |
| **Features** | QR code generation, PDF export, real-time updates |

→ For detailed architecture, see the [**Architecture Guide**](docs/ARCHITECTURE.md)

---

## 📁 Project Structure

```
smart-restaurant-admin/
├── client/                 # React frontend (TypeScript)
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── pages/          # Page-level components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # API service layer
│   │   └── contexts/       # React Context providers
│   └── ...
│
├── server/                 # Node.js backend
│   ├── src/
│   │   ├── controllers/    # Request handlers
│   │   ├── routes/         # API route definitions
│   │   ├── services/       # Business logic
│   │   └── middleware/     # Express middleware
│   ├── prisma/             # Database schema
│   └── ...
│
└── docs/                   # Documentation
    ├── USER_GUIDE.md       # End-user documentation
    ├── SETUP.md            # Installation guide
    ├── ARCHITECTURE.md     # System design
    ├── deployment/         # Deployment guides
    ├── guides/             # Additional guides (i18n, etc.)
    └── features/           # Feature-specific docs
```

---

## � Additional Documentation

### Deployment
- [Deployment Guide](docs/deployment/DEPLOYMENT.md) – Production deployment
- [EC2 Deployment](docs/deployment/EC2_DEPLOYMENT_GUIDE.md) – AWS EC2 setup
- [GitHub Secrets](docs/deployment/GITHUB_SECRETS_SETUP.md) – CI/CD configuration

### Guides
- [Internationalization](docs/guides/i18n/) – Multi-language support (EN/VI)

### Feature Documentation
- [Fuzzy Search](docs/features/fuzzy-search/) – Search implementation
- [Menu Management](docs/features/menu-management/) – Menu feature docs
- [QR Code](docs/features/qr-code/) – QR code generation
- [Staff Apps](docs/features/staff-apps/) – Waiter & Kitchen display
- [Table Management](docs/features/table-management/) – Table feature docs

---

## 🎓 Project Context

This application is part of the **Smart Restaurant System**, a comprehensive solution for modern restaurant operations developed as part of the Web Application Development Course at HCMUS.

**Related Applications:**
- **Smart Restaurant Customer** – QR-based customer ordering interface
- **Smart Restaurant SuperAdmin** – Platform-level admin management

---

## 📄 License

ISC License

---

*© 2026 Smart Restaurant Admin. HCMUS Web Application Development Course.*
