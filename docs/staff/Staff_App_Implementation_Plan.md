# Staff App (KDS & Waiter) Implementation Plan

## Overview
This plan outlines the integration of **Kitchen Display System (KDS)** and **Waiter Dashboard** features directly into the `smart-restaurant-admin` application. Instead of separate apps, we leverage role-based rendering to provide specific operational interfaces for Kitchen Staff and Waiters.

## Architecture
- **Repo**: `smart-restaurant-admin` (Monorepo strategy for management/staff).
- **Frontend**: React (Vite) with Role-Based Routing.
  - `/dashboard` -> Admin (Management)
  - `/kitchen` -> Kitchen Staff (KDS)
  - `/waiter` -> Waiters (Service)
- **Backend**: Existing Node/Express server with new Controllers (`KitchenController`, `WaiterController`) and Socket.io rooms (`kitchen`, `waiter`).
- **Auth**: Unified `AuthService` handling `ADMIN`, `KITCHEN_STAFF`, and `WAITER` roles.

## Team Roles & Responsibilities

### Developer A: Backend & Data
**Focus**: API endpoints, Socket events, and Database logic.
- **KDS API**: Endpoints for fetching/updating active orders.
- **Waiter API**: Endpoints for table management, bill generation, and payments.
- **Socket.io**: Manage `kitchen` and `waiter` rooms. Ensure generic `order:created` events are broadcast correctly.

### Developer B: KDS Frontend (Kitchen View)
**Focus**: High-contrast, touch-friendly kitchen interface.
- **Components**: `KitchenOrderCard` (Large text, color codes), `TimerBadge`.
- **Layout**: Grid view for active orders, auto-refreshing.
- **Interactions**: Tap to mark item ready, tap to complete order.
- **Sound**: Integration with Howler.js for new order pings.

### Developer C: Waiter Frontend (Service View)
**Focus**: Mobile-first dashboard for floor staff.
- **Pending Orders**: Card view to Accept/Reject incoming orders.
- **Tables**: Simple grid showing occupied vs available tables.
- **Billing**: Interface for generating bills, applying discounts, and marking paid.

## Detailed Task Breakdown

### Phase 3.1: Backend Foundation (Developer A)
- **T400-T406 (KDS)**: `KitchenController`, `KitchenService`, Socket configuration.
- **T470-T475 (Waiter)**: `WaiterController`, `BillService`.

### Phase 3.2: Frontend Infrastructure (All)
- **T420**: `RoleBasedRedirect` component.
- **T421**: Update `App.tsx` routes.
- **T422**: `StaffLayout` (clean, minimal header for operation modes).

### Phase 3.3: KDS Features (Developer B)
- **T430-T432**: Layout & Order Cards.
- **T433**: Sound notifications.
- **T435**: Main `KitchenDisplayPage`.

### Phase 3.4: Waiter Features (Developer C)
- **T480**: `WaiterLayout` & Navigation.
- **T481**: `PendingOrderCard` (Accept/Reject).
- **T482**: Table Management logic.
- **T483-T484**: Billing & Payment flows.

### Phase 3.5: Integration (All)
- **T490**: End-to-End testing (Customer -> Waiter -> Kitchen -> Waiter).
- **T491**: Offline reliance (optional bonus).

## API Requirements
### Kitchen
- `GET /api/kitchen/orders`
- `PATCH /api/kitchen/orders/:id/status`

### Waiter
- `GET /api/waiter/orders/pending`
- `POST /api/waiter/orders/:id/accept`
- `POST /api/waiter/bill/create`
