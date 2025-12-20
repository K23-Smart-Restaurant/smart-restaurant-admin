# Smart Restaurant Admin

A full-stack restaurant management application for administrators to manage tables, menu items, categories, orders, staff, and generate QR codes for customer ordering.

## 🎯 Project Purpose

This admin panel enables restaurant staff and managers to:

- **Manage Tables**: Create, edit, delete tables with QR code generation for customer scanning
- **Manage Menu**: Organize menu items by categories with images, pricing, and availability
- **Process Orders**: View, track, and update order statuses in real-time
- **Manage Staff**: Add and manage staff accounts with role-based access control
- **View Reports**: Access sales analytics and business insights
- **Generate QR Codes**: Create and download QR codes (PNG/PDF) for table ordering

## 🏗️ System Architecture

```
smart-restaurant-admin/
├── client/          # React Frontend (Vite + TypeScript)
│   └── src/
│       ├── components/   # Reusable UI components
│       ├── pages/        # Page-level components
│       ├── hooks/        # Custom React hooks
│       ├── services/     # API service layer
│       └── contexts/     # React Context providers
│
└── server/          # Node.js Backend (Express)
    └── src/
        ├── controllers/  # Request handlers
        ├── routes/       # API route definitions
        ├── services/     # Business logic
        ├── middleware/   # Express middleware
        ├── schemas/      # Zod validation schemas
        └── config/       # Configuration files
```

### Frontend

- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **State Management**: TanStack React Query
- **Routing**: React Router v7
- **Styling**: Tailwind CSS
- **Forms**: React Hook Form + Zod validation

### Backend

- **Runtime**: Node.js with Express
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT + Passport.js
- **File Upload**: Multer
- **Real-time**: Socket.IO
- **QR Generation**: qrcode + PDFKit

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Environment Setup

1. **Clone the repository**

2. **Setup the database** (in `smart-restaurant-root/`)

   ```bash
   cd ../smart-restaurant-root
   npx prisma migrate dev
   npx prisma db seed  # Optional: seed sample data
   ```

3. **Configure environment variables**

   Create `server/.env`:

   ```env
   PORT=5000
   DATABASE_URL=postgresql://user:password@localhost:5432/smart_restaurant
   JWT_SECRET=your-jwt-secret-key
   QR_TOKEN_SECRET=your-qr-token-secret
   CLIENT_URL=http://localhost:5173
   ```

### Running in Development

**Backend Server:**

```bash
cd server
npm install
npm run dev
```

Server runs at `http://localhost:5000`

**Frontend Client:**

```bash
cd client
npm install
npm run dev
```

Client runs at `http://localhost:5173`

## 🛠️ Main Technologies

| Layer    | Technology      | Purpose        |
| -------- | --------------- | -------------- |
| Frontend | React 19        | UI Framework   |
| Frontend | TypeScript      | Type Safety    |
| Frontend | Vite            | Build Tool     |
| Frontend | TanStack Query  | Server State   |
| Frontend | Tailwind CSS    | Styling        |
| Frontend | React Hook Form | Form Handling  |
| Backend  | Express.js      | Web Framework  |
| Backend  | Prisma          | ORM            |
| Backend  | PostgreSQL      | Database       |
| Backend  | JWT             | Authentication |
| Backend  | Socket.IO       | Real-time      |
| Backend  | PDFKit          | PDF Generation |
| Backend  | qrcode          | QR Generation  |

## 📁 Folder Structure

### Client (`/client/src/`)

```
src/
├── components/
│   ├── common/       # Button, Modal, Input, etc.
│   ├── layout/       # DashboardLayout, Sidebar, Header
│   ├── table/        # TableList, TableForm, QRCodeDisplay
│   ├── menuItem/     # MenuItemCard, MenuItemForm
│   ├── category/     # CategoryList, CategoryForm
│   ├── order/        # OrderList, OrderDetail
│   ├── staff/        # StaffList, StaffForm
│   └── reports/      # Charts, Statistics
├── pages/
│   ├── DashboardPage.tsx
│   ├── TableManagementPage.tsx
│   ├── MenuManagementPage.tsx
│   ├── CategoryManagementPage.tsx
│   ├── OrderManagementPage.tsx
│   ├── StaffManagementPage.tsx
│   ├── ReportsPage.tsx
│   └── LoginPage.tsx
├── hooks/            # useAuth, useTables, useOrders, etc.
├── services/         # API client and service functions
└── contexts/         # AuthContext, SocketContext
```

### Server (`/server/src/`)

```
src/
├── controllers/      # HTTP request handlers
│   ├── AuthController.js
│   ├── TableController.js
│   ├── MenuItemController.js
│   ├── CategoryController.js
│   ├── OrderController.js
│   ├── StaffController.js
│   └── ReportController.js
├── routes/           # Express route definitions
├── services/         # Business logic layer
│   ├── TableService.js
│   ├── QRCodeService.js
│   └── ...
├── middleware/       # Auth, error handling, validation
├── schemas/          # Zod validation schemas
├── config/           # Passport, Winston logger
└── utils/            # Helper functions
```

## 📡 API Endpoints

| Method | Endpoint                        | Description              |
| ------ | ------------------------------- | ------------------------ |
| POST   | `/api/auth/login`               | Admin login              |
| GET    | `/api/tables`                   | List all tables          |
| POST   | `/api/tables`                   | Create a table           |
| PATCH  | `/api/tables/:id`               | Update a table           |
| DELETE | `/api/tables/:id`               | Delete a table           |
| POST   | `/api/tables/:id/regenerate-qr` | Regenerate QR code       |
| GET    | `/api/tables/:id/qr-code`       | Download QR (PNG/PDF)    |
| POST   | `/api/tables/batch/download`    | Batch download QR codes  |
| GET    | `/api/tables/validate-qr`       | Validate QR token        |
| GET    | `/api/categories`               | List categories          |
| POST   | `/api/categories`               | Create category          |
| GET    | `/api/menu-items`               | List menu items          |
| POST   | `/api/menu-items`               | Create menu item         |
| GET    | `/api/orders`                   | List orders              |
| PATCH  | `/api/orders/:id/status`        | Update order status      |
| GET    | `/api/staff`                    | List staff members       |
| GET    | `/api/reports/*`                | Various report endpoints |

## 🔒 Authentication & Authorization

- **JWT-based authentication** with access tokens
- **Role-based access control (RBAC)**:
  - `SUPER_ADMIN`: Full system access
  - `ADMIN`: Restaurant management access
  - `WAITER`: Order and table access
  - `KITCHEN_STAFF`: Order viewing access

## 📝 Development Notes

### Code Style

- ESLint configured for both frontend and backend
- TypeScript strict mode enabled on frontend
- Use Zod for runtime validation on both ends

### Testing

```bash
# Run TypeScript type checking (client)
cd client
npx tsc --noEmit

# Run linting
npm run lint
```

### Building for Production

```bash
# Frontend build
cd client
npm run build

# Backend (no build step, uses Node.js directly)
cd server
npm start
```

### Database Migrations

```bash
# From smart-restaurant-root directory
npx prisma migrate dev --name your_migration_name
npx prisma generate
```

## 🔧 Troubleshooting

| Issue                     | Solution                                  |
| ------------------------- | ----------------------------------------- |
| Database connection error | Check `DATABASE_URL` in `.env`            |
| CORS errors               | Verify `CLIENT_URL` matches frontend port |
| QR codes not generating   | Ensure `QR_TOKEN_SECRET` is set           |
| Upload fails              | Check `uploads/` folder permissions       |

## 📄 License

ISC License

---

**Part of the Smart Restaurant System**
