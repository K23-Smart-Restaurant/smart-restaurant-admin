# Smart Restaurant Admin - Setup Instructions

## Prerequisites

- Node.js v18+ and npm
- Backend server running (see smart-restaurant-admin/server)

## Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment variables**:
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your backend API URLs:
   ```
   VITE_API_URL=http://localhost:5001/api
   VITE_WS_URL=http://localhost:5001
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

4. **Build for production**:
   ```bash
   npm run build
   ```

## Project Structure

```
src/
├── components/
│   ├── common/          # Shared components (ProtectedRoute, etc.)
│   └── layout/          # Layout components (DashboardLayout)
├── contexts/            # React contexts (Auth, Socket)
├── pages/              # Page components
├── services/           # API services
└── App.tsx             # Main app with routing
```

## Features Implemented

### ✅ T352: React + TypeScript + Vite Setup
- Vite development server configured
- TypeScript for type safety
- React 19 with modern hooks

### ✅ T353: Dependencies Installed
- **react-router-dom**: Client-side routing
- **@tanstack/react-query**: Data fetching and caching
- **axios**: HTTP client with interceptors
- **socket.io-client**: Real-time WebSocket communication
- **react-hook-form**: Form management
- **zod**: Schema validation
- **@headlessui/react**: Accessible UI components
- **@heroicons/react**: Icon library
- **tailwindcss**: Utility-first CSS framework

### ✅ T354: Tailwind Configuration
- Desktop/tablet-first breakpoints (different from mobile customer app)
- Custom color palette (primary, secondary)
- Extended spacing and sizing utilities
- Sidebar and content area specific styles

### ✅ T355: Axios Client & Contexts
- **API Client** (`src/services/api.ts`):
  - JWT token auto-attachment via interceptors
  - Global error handling
  - 401/403 redirect logic
  - 30-second timeout

- **AuthContext** (`src/contexts/AuthContext.tsx`):
  - User authentication state management
  - Login/logout functionality
  - JWT token persistence in localStorage
  - Role-based access control (ADMIN, WAITER, KITCHEN_STAFF, SUPER_ADMIN)

- **SocketContext** (`src/contexts/SocketContext.tsx`):
  - WebSocket connection management
  - Auto-reconnect with exponential backoff
  - Connection status tracking
  - JWT authentication in handshake

- **ProtectedRoute** (`src/components/common/ProtectedRoute.tsx`):
  - Route protection wrapper
  - Role-based authorization
  - Loading state handling
  - 403 Forbidden page for insufficient permissions

### ✅ T356: React Router Setup
- **App.tsx** with lazy-loaded routes:
  - `/login` - Public login page
  - `/dashboard` - Protected dashboard (all roles)
  - `/staff` - Staff management (ADMIN, SUPER_ADMIN only)
  - `/categories` - Category management (ADMIN, SUPER_ADMIN only)
  - `/menu` - Menu management (ADMIN, SUPER_ADMIN only)
  - `/tables` - Table management (ADMIN, SUPER_ADMIN only)
  - `/orders` - Order management (all roles)
  - `/reports` - Reports (ADMIN, SUPER_ADMIN only)

- **DashboardLayout** (`src/components/layout/DashboardLayout.tsx`):
  - Sidebar navigation with role-based visibility
  - User profile display
  - Logout button
  - Active route highlighting
  - Responsive layout with fixed sidebar

- **LoginPage** (`src/pages/LoginPage.tsx`):
  - Email/password authentication
  - Error handling
  - Loading state
  - Gradient background design

- **Placeholder Pages**:
  - DashboardPage
  - StaffManagementPage
  - CategoryManagementPage
  - MenuManagementPage
  - TableManagementPage
  - OrderManagementPage
  - ReportsPage

## Usage

### Login
Navigate to `/login` and enter admin credentials:
- Email: `admin@restaurant.com`
- Password: (from backend seed data)

### Navigation
After login, use the sidebar to navigate between different management sections. Menu items are shown based on user role.

### API Integration
All API requests automatically include JWT token in Authorization header. If token expires (401), user is automatically logged out and redirected to login.

### Real-Time Updates
WebSocket connection is established on login and provides real-time notifications for:
- New orders
- Menu updates
- Table status changes
- Order status updates

## Next Steps

The following pages need full implementation (placeholders currently):
- Dashboard with analytics cards
- Staff CRUD operations
- Category CRUD operations
- Menu item CRUD with image upload
- Table management with QR code generation
- Order management with status updates
- Reports with charts

See tasks.md for detailed implementation tasks (T357+).

## Tech Stack

- **React 19**: UI library
- **TypeScript**: Type safety
- **Vite**: Build tool
- **React Router v7**: Routing
- **TanStack Query v5**: Data fetching
- **Axios**: HTTP client
- **Socket.IO Client**: WebSocket
- **Tailwind CSS**: Styling
- **React Hook Form**: Form management
- **Zod**: Validation
- **Headless UI**: Accessible components
