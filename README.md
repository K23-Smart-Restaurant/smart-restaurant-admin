# Smart Restaurant Admin 🍽️

> A modern, full-stack restaurant management system for administrators to efficiently manage tables, menus, orders, staff, and generate QR codes for seamless customer ordering.

[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green?logo=node.js)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-blue?logo=postgresql)](https://www.postgresql.org/)

---

## 📖 Table of Contents

- [About the Project](#about-the-project)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Configuration](#environment-configuration)
- [Usage](#usage)
  - [Running the Application](#running-the-application)
  - [Login Credentials](#login-credentials)
  - [First Steps After Login](#first-steps-after-login)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Development Notes](#development-notes)
- [Troubleshooting](#troubleshooting)
- [Additional Resources](#additional-resources)
- [Contributing](#contributing)
- [License](#license)
- [Project Context](#project-context)

---

## 🎯 About the Project

**Smart Restaurant Admin** is a comprehensive web-based management system designed for restaurant administrators, managers, and staff. It provides an intuitive dashboard to handle day-to-day restaurant operations, from table management and menu creation to order processing and business analytics.

### What Does It Do?

This application serves as the **administrative control center** for a modern restaurant, allowing staff to:

- **Manage dining tables** with real-time status tracking (Available, Occupied, Reserved)
- **Create and organize menu items** with categories, pricing, images, and modifiers
- **Process customer orders** with live updates and status management
- **Control staff accounts** with role-based permissions
- **Generate QR codes** for contactless table ordering
- **View sales reports** and business analytics
- **Handle multi-photo uploads** for menu items (up to 5 images per item)

---

## ✨ Key Features

### 📊 Dashboard
- Real-time business metrics and KPIs
- Quick access to all management modules
- Live order notifications via WebSocket

### 🪑 Table Management
- Create, edit, and delete tables with customizable capacity
- Dynamic status management (Available, Occupied, Reserved)
- **QR code generation** for each table (PNG & PDF download)
- **Batch QR operations** for multiple tables
- Location-based organization

### 🍔 Menu Management
- Comprehensive menu item CRUD operations
- **Multi-image gallery** (up to 5 photos per item)
- Category organization (Appetizers, Main Courses, Desserts, Beverages)
- **Modifier groups** (e.g., sizes, add-ons, customizations)
- Chef's recommendation highlighting
- Real-time availability and sold-out toggling

### 📦 Order Management
- Real-time order tracking and updates
- Status workflow (Pending → Preparing → Ready → Served → Completed)
- Order history and details
- Table assignment and customer information

### 👥 Staff Management
- User account creation and management
- Role-based access control (Super Admin, Admin, Waiter, Kitchen Staff)
- Staff activity tracking

### 📈 Reports & Analytics
- Revenue trends and sales charts
- Top-selling items analysis
- Time-based performance metrics

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| **React 19** | UI framework with modern hooks |
| **TypeScript** | Type-safe development |
| **Vite** | Lightning-fast build tool |
| **TanStack Query (React Query)** | Server state management & caching |
| **React Router v7** | Client-side routing |
| **Tailwind CSS** | Utility-first styling |
| **React Hook Form** | Form management |
| **Zod** | Schema validation |
| **Lucide React** | Modern icon library |

### Backend
| Technology | Purpose |
|-----------|---------|
| **Node.js + Express** | Server runtime & web framework |
| **PostgreSQL** | Relational database |
| **Prisma** | Type-safe ORM |
| **JWT + Passport.js** | Authentication & authorization |
| **Socket.IO** | Real-time bidirectional communication |
| **Multer** | File upload handling |
| **qrcode** | QR code generation |
| **PDFKit** | PDF generation for QR codes |
| **Zod** | Runtime validation |

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** or **yarn** (comes with Node.js)
- **PostgreSQL** (v14 or higher) - [Download](https://www.postgresql.org/download/)
- **Git** - [Download](https://git-scm.com/)

> **Note:** This guide assumes you're working with the full Smart Restaurant system. The shared database is managed from the `smart-restaurant-root` directory.

---

### Installation

Follow these steps to set up the project locally:

#### 1. Clone the Repository

```bash
git clone <repository-url>
cd smart-restaurant-admin
```

#### 2. Set Up the Database (from root directory)

The database is shared across all apps and managed centrally:

```bash
cd ../smart-restaurant-root

# Install dependencies
npm install

# Run database migrations
npx prisma migrate dev

# (Optional) Seed sample data
npx prisma db seed
```

#### 3. Install Dependencies

Install dependencies for both **client** and **server**:

```bash
# Backend dependencies
cd smart-restaurant-admin/server
npm install

# Frontend dependencies
cd ../client
npm install
```

---

### Environment Configuration

Both the client and server require environment variables. Create `.env` files based on the examples below:

#### **Client `.env`** (`client/.env`)

Create a file at `client/.env`:

```env
# API Configuration
VITE_API_URL=http://localhost:5001/api
VITE_WS_URL=http://localhost:5001
```

**Variables Explained:**
- `VITE_API_URL`: Backend API base URL
- `VITE_WS_URL`: WebSocket server URL for real-time updates

---

#### **Server `.env`** (`server/.env`)

Create a file at `server/.env`:

```env
# Server Configuration
NODE_ENV=development
PORT=5001

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/smart_restaurant"

# JWT Authentication
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="24h"
REFRESH_TOKEN_SECRET="your-refresh-token-secret-change-in-production"
REFRESH_TOKEN_EXPIRES_IN="7d"

# CORS - Allowed Origins
CLIENT_URL="http://localhost:5173"
CUSTOMER_APP_URL="http://localhost:5174"

# Stripe (Optional - for payment features)
STRIPE_SECRET_KEY="sk_test_your_stripe_key"
STRIPE_PUBLISHABLE_KEY="pk_test_your_stripe_key"
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret"

# Logging
LOG_LEVEL="debug"
```

**Variables Explained:**
- `PORT`: Server port (should match `VITE_API_URL` in client)
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret key for signing JWT tokens (use a strong random string)
- `CLIENT_URL`: Frontend URL for CORS
- `LOG_LEVEL`: Logging verbosity (`debug`, `info`, `warn`, `error`)

> ⚠️ **Security Warning**: Never commit `.env` files to version control. Always use strong, unique secrets in production.

---

## 💻 Usage

### Running the Application

You need to run both the **backend server** and **frontend client** simultaneously.

#### **Option 1: Run Each in Separate Terminals**

**Terminal 1 - Backend Server:**
```bash
cd server
npm run dev
```
✅ Server will start at `http://localhost:5001`

**Terminal 2 - Frontend Client:**
```bash
cd client
npm run dev
```
✅ Client will start at `http://localhost:5173`

#### **Option 2: Use a Process Manager (Optional)**

You can use tools like `concurrently` or `pm2` to run both simultaneously.

---

### Login Credentials

Once the application is running, navigate to `http://localhost:5173` and log in with one of these accounts:

#### **Default Admin Account**

After running the database seed (`npx prisma db seed`), you can use:

```
Email: admin1@restaurant.com
Password: password123
Role: ADMIN
```

> **Note:** If you haven't seeded the database, you'll need to create an admin account manually via database insert or API endpoint.

---

### First Steps After Login

1. **Dashboard**: View the overview of your restaurant operations
2. **Menu Management**: Create categories and add menu items with images
3. **Table Management**: Set up tables and generate QR codes
4. **Orders**: Monitor incoming orders in real-time
5. **Reports**: Analyze sales and performance data

---

## 📁 Project Structure

```
smart-restaurant-admin/
├── client/                    # React Frontend
│   ├── public/               # Static assets
│   ├── src/
│   │   ├── assets/           # Images, fonts, etc.
│   │   ├── components/       # Reusable UI components
│   │   │   ├── common/       # Button, Modal, Toast, etc.
│   │   │   ├── layout/       # DashboardLayout, Sidebar
│   │   │   ├── menuItem/     # Menu-related components
│   │   │   ├── category/     # Category components
│   │   │   ├── table/        # Table & QR components
│   │   │   ├── order/        # Order components
│   │   │   ├── staff/        # Staff components
│   │   │   └── reports/      # Analytics components
│   │   ├── contexts/         # React Context providers
│   │   │   ├── AuthContext.tsx
│   │   │   ├── SocketContext.tsx
│   │   │   └── ToastContext.tsx
│   │   ├── hooks/            # Custom React hooks
│   │   ├── pages/            # Page-level components
│   │   ├── services/         # API service layer
│   │   ├── utils/            # Helper functions
│   │   ├── App.tsx           # Main app component
│   │   └── main.tsx          # Entry point
│   ├── .env                  # Environment variables (create this)
│   ├── .env.example          # Example environment file
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
│
└── server/                    # Node.js Backend
    ├── prisma/
    │   └── schema.prisma     # Database schema
    ├── src/
    │   ├── config/           # Configuration files
    │   │   ├── passport.config.js
    │   │   └── winston.config.js
    │   ├── controllers/      # Request handlers
    │   ├── middleware/       # Express middleware
    │   │   ├── auth.middleware.js
    │   │   ├── upload.middleware.js
    │   │   └── validation.middleware.js
    │   ├── routes/           # API route definitions
    │   ├── schemas/          # Zod validation schemas
    │   ├── services/         # Business logic layer
    │   ├── utils/            # Helper functions
    │   ├── app.js            # Express app setup
    │   └── index.js          # Server entry point
    ├── uploads/              # Uploaded files (auto-created)
    ├── .env                  # Environment variables (create this)
    ├── .env.example          # Example environment file
    └── package.json
```

---

## 📡 API Documentation

### Base URL
```
http://localhost:5001/api
```

### Main Endpoints

#### **Authentication**
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/login` | Admin/staff login |
| `POST` | `/auth/refresh` | Refresh access token |
| `POST` | `/auth/logout` | Logout user |

#### **Tables**
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/tables` | List all tables |
| `POST` | `/tables` | Create a new table |
| `GET` | `/tables/:id` | Get table details |
| `PATCH` | `/tables/:id` | Update table |
| `DELETE` | `/tables/:id` | Delete table |
| `POST` | `/tables/:id/regenerate-qr` | Regenerate QR code |
| `GET` | `/tables/:id/qr-code?format=png\|pdf` | Download QR code |
| `POST` | `/tables/batch/download` | Batch download QR codes |

#### **Menu Items**
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/menu-items` | List menu items (with filters) |
| `POST` | `/menu-items` | Create menu item (with images) |
| `GET` | `/menu-items/:id` | Get menu item details |
| `PATCH` | `/menu-items/:id` | Update menu item |
| `DELETE` | `/menu-items/:id` | Delete menu item |

#### **Categories**
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/categories` | List all categories |
| `POST` | `/categories` | Create category |
| `PATCH` | `/categories/:id` | Update category |
| `DELETE` | `/categories/:id` | Delete category |

#### **Orders**
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/orders` | List orders (with filters) |
| `GET` | `/orders/:id` | Get order details |
| `PATCH` | `/orders/:id/status` | Update order status |

#### **Staff**
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/staff` | List staff members |
| `POST` | `/staff` | Create staff account |
| `PATCH` | `/staff/:id` | Update staff |
| `DELETE` | `/staff/:id` | Delete staff |

#### **Reports**
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/reports/revenue` | Revenue analytics |
| `GET` | `/reports/top-items` | Top-selling items |
| `GET` | `/reports/analytics` | General analytics |

---

## 🔧 Development Notes

### Code Quality

**Linting:**
```bash
# Frontend
cd client
npm run lint

# Backend
cd server
npm run lint
```

**Type Checking (Frontend):**
```bash
cd client
npx tsc --noEmit
```

### Building for Production

**Frontend:**
```bash
cd client
npm run build
# Output: client/dist/
```

**Backend:**
```bash
# No build step required - runs directly with Node.js
cd server
npm start
```

### Database Management

**Run Migrations:**
```bash
cd ../smart-restaurant-root
npx prisma migrate dev --name migration_name
```

**Generate Prisma Client:**
```bash
npx prisma generate
```

**Seed Database:**
```bash
npx prisma db seed
```

---

## 🐛 Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| **Database connection fails** | • Check `DATABASE_URL` in `server/.env`<br>• Ensure PostgreSQL is running<br>• Verify database exists |
| **CORS errors** | • Verify `CLIENT_URL` matches frontend URL<br>• Check `VITE_API_URL` in client `.env` |
| **Images not uploading** | • Ensure `server/uploads/` directory exists<br>• Check folder permissions |
| **QR codes not generating** | • Verify `JWT_SECRET` is set<br>• Check server logs for errors |
| **Login fails** | • Ensure database is seeded<br>• Check JWT configuration<br>• Verify user exists in database |
| **Real-time updates not working** | • Check `VITE_WS_URL` configuration<br>• Ensure Socket.IO is connected |
| **Port already in use** | • Change `PORT` in `server/.env`<br>• Update `VITE_API_URL` accordingly |

### Checking Logs

**Server logs:**
```bash
cd server
npm run dev
# Watch console output
# Logs also saved to server/logs/ (if configured)
```

**Browser console:**
- Open DevTools (F12)
- Check Console tab for frontend errors
- Check Network tab for API request failures

---

## 📚 Additional Resources

- **React Query Docs**: [tanstack.com/query](https://tanstack.com/query/latest)
- **Prisma Docs**: [prisma.io/docs](https://www.prisma.io/docs)
- **Tailwind CSS**: [tailwindcss.com/docs](https://tailwindcss.com/docs)
- **Socket.IO**: [socket.io/docs](https://socket.io/docs/)

---

## 🤝 Contributing

This is a university project. For contributions or questions, please contact the development team.

---

## 📄 License

ISC License

---

## 🎓 Project Context

This application is part of the **Smart Restaurant System**, a comprehensive solution for modern restaurant operations. It works in conjunction with:
- **Customer Ordering App**: QR-based ordering interface
- **Shared Database**: Centralized data management

**Developed as part of:** Web Application Development Course  
**Institution:** HCMUS (Ho Chi Minh City University of Science)

