# Smart Restaurant Admin

A modern, full-stack restaurant management system for administrators to efficiently manage tables, menus, orders, staff, and generate QR codes for seamless customer ordering.

**Technology Stack:** React 19, TypeScript 5, Node.js 18+, PostgreSQL 14+

---

## Documentation

| Document                               | Description                                                                                            |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| [User Guide](docs/USER_GUIDE.md)       | Complete guide for using the application, including features, workflows, and step-by-step instructions |
| [Setup Guide](docs/SETUP.md)           | Installation, environment configuration, and running the application                                   |
| [Architecture](docs/ARCHITECTURE.md)   | System design, technology stack, database schema, and code organization                                |
| [API Reference](docs/API_REFERENCE.md) | API endpoints, request/response schemas, and authentication details                                    |

---

## Project Overview

Smart Restaurant Admin is a comprehensive web-based management system designed for restaurant administrators, managers, and staff. It provides an intuitive dashboard to handle day-to-day restaurant operations.

### Core Functionality

This application serves as the administrative control center for modern restaurant operations:

- **Dashboard** - Real-time business metrics, key performance indicators, and live order notifications
- **Table Management** - Create and manage tables, track status, generate QR codes in PNG and PDF formats
- **Menu Management** - Organize menu items with categories, support for multiple images (up to 5 per item), and modifiers
- **Order Management** - Real-time order tracking with comprehensive status workflow
- **Staff Management** - Role-based access control supporting Admin, Waiter, and Kitchen Staff roles
- **Reports and Analytics** - Revenue trends, top-selling items analysis, and performance metrics

---

## Quick Start

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

**Application URLs:**

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001/api

For detailed installation instructions, refer to the [Setup Guide](docs/SETUP.md).

---

## Technology Stack

| Layer              | Technologies                                             |
| ------------------ | -------------------------------------------------------- |
| **Frontend**       | React 19, TypeScript, Vite, TanStack Query, Tailwind CSS |
| **Backend**        | Node.js, Express, PostgreSQL, Prisma ORM, Socket.IO      |
| **Authentication** | JWT, Passport.js, bcrypt                                 |
| **Features**       | QR code generation, PDF export, real-time updates        |

For detailed architecture information, refer to the [Architecture Guide](docs/ARCHITECTURE.md).

---

## Project Structure

```
smart-restaurant-admin/
├── client/                         # React frontend (TypeScript)
│   ├── src/
│   │   ├── assets/                 # Static assets (images, icons)
│   │   ├── components/             # Reusable UI components
│   │   ├── contexts/               # React Context providers (Auth, Theme)
│   │   ├── hooks/                  # Custom React hooks
│   │   ├── i18n/                   # Internationalization setup
│   │   ├── locales/                # Translation files (en, vi)
│   │   ├── pages/                  # Page-level components
│   │   ├── services/               # API service layer
│   │   ├── types/                  # TypeScript type definitions
│   │   ├── utils/                  # Utility functions
│   │   ├── App.tsx                 # Main application component
│   │   └── main.tsx                # Application entry point
│   ├── public/                     # Public static files
│   ├── docs/                       # Client-specific documentation
│   ├── eslint.config.js            # ESLint configuration
│   ├── vite.config.ts              # Vite build configuration
│   ├── vitest.config.ts            # Vitest testing configuration
│   ├── tailwind.config.js          # Tailwind CSS configuration
│   ├── tsconfig.json               # TypeScript configuration
│   ├── package.json                # Frontend dependencies
│   ├── Dockerfile                  # Production Docker image
│   ├── Dockerfile.dev              # Development Docker image
│   └── nginx.conf                  # Nginx server configuration
│
├── server/                         # Node.js backend
│   ├── src/
│   │   ├── config/                 # Configuration files (database, JWT, etc.)
│   │   ├── controllers/            # Request handlers
│   │   ├── docs/                   # API documentation (OpenAPI/Swagger)
│   │   ├── lib/                    # Shared libraries
│   │   ├── middleware/             # Express middleware (auth, validation)
│   │   ├── routes/                 # API route definitions
│   │   ├── schemas/                # Validation schemas
│   │   ├── services/               # Business logic layer
│   │   ├── utils/                  # Utility functions
│   │   ├── app.js                  # Express application setup
│   │   └── index.js                # Server entry point
│   ├── prisma/
│   │   ├── schema.prisma           # Database schema definition
│   │   ├── migrations/             # Database migration files
│   │   └── lib/                    # Prisma client extensions
│   ├── logs/                       # Application logs
│   ├── eslint.config.js            # ESLint configuration
│   ├── prisma.config.ts            # Prisma configuration
│   ├── package.json                # Backend dependencies
│   └── Dockerfile                  # Production Docker image
│
├── docs/                           # Project documentation
│   ├── ARCHITECTURE.md             # System architecture
│   ├── DATABASE_DESIGN.md          # Database schema documentation
│   ├── SETUP.md                    # Installation guide
│   ├── USER_GUIDE.md               # End-user documentation
│   ├── API_REFERENCE.md            # API reference guide
│   ├── deployment/                 # Deployment guides
│   ├── features/                   # Feature documentation
│   └── guides/                     # Additional guides
│       └── i18n/                   # Internationalization guides
│
├── docker-compose.yaml             # Docker Compose configuration
├── commit-history.md               # Git commit history
└── README.md                       # This file
```

---

## Project Context

This application is part of the Smart Restaurant System, a comprehensive solution for modern restaurant operations developed as part of the Web Application Development Course at HCMUS.

**Related Applications:**

- Smart Restaurant Customer - QR-based customer ordering interface
- Smart Restaurant SuperAdmin - Platform-level administrative management

---

## License

ISC License

---

Copyright 2026 Smart Restaurant Admin. HCMUS Web Application Development Course.
