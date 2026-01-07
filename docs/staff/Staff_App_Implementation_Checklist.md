# Staff App Implementation Checklist (KDS & Waiter)

> **Purpose:** Detailed implementation checklist for Phase 3 - Staff App Features  
> **Legend:** [✓] = Implemented | [ ] = Not Implemented | [~] = Partially Implemented  
> **Tasks:** T400-T491  
> **Feature Points:** 0.5 bonus (KDS) + -2.25 points (Waiter)  
> **Last Updated:** January 2026

---

## Summary

**Backend Tasks:** 20 tasks (Kitchen: T400-T406, Waiter: T470-T475, Infrastructure: T420-T425)  
**Frontend Tasks:** 26 tasks (Infrastructure: T420-T425, KDS: T430-T436, Waiter: T480-T485, Integration: T490-T491)  
**Status:** [ ] Not Started

---

## 1. Backend - Staff API (smart-restaurant-admin/server)

### 1.1 Kitchen Controller & Service (Developer A)

- [ ] **T400:** Add KITCHEN_STAFF role to User model (Prisma)
- [ ] **T401:** Create `KitchenController` in `server/src/controllers/KitchenController.js`
- [ ] **T402:** Create `KitchenService.getActiveOrders()` returning orders with status: CONFIRMED, PREPARING, READY
- [ ] **T403:** Create endpoint `GET /api/kitchen/orders` (Auth: KITCHEN_STAFF)
- [ ] **T404:** Create `KitchenService.updateOrderStatus(id, status)` - Validate transition logic
- [ ] **T405:** Create endpoint `PATCH /api/kitchen/orders/:id/status` (PREPARING -> READY)
- [ ] **T406:** Create endpoint `PATCH /api/kitchen/orders/:id/items/:itemId/status` (Item-level updates)

### 1.2 Waiter Controller & Service (Developer A)

- [ ] **T470:** Add WAITER role to User model (Verified: Already exists)
- [ ] **T471:** Create `WaiterController` in `server/src/controllers/WaiterController.js`
- [ ] **T472:** Create `WaiterService.getPendingOrders()` returning orders with status: PENDING
- [ ] **T473:** Create endpoints `POST /api/waiter/orders/:id/accept` and `reject`
- [ ] **T474:** Create `BillService` logic: Sum items, apply tax, apply modifier costs
- [ ] **T475:** Create `POST /api/waiter/bill/create` (Generate PDF/JSON bill)
- [ ] **T476:** Create `POST /api/waiter/bill/pay` (Record payment type: CASH/CARD)

### 1.3 Real-Time Infrastructure (Developer A)

- [ ] **T410:** Update `OrderService` to emit `order:created` to 'waiter' room
- [ ] **T411:** Update `OrderService` to emit `order:confirmed` to 'kitchen' room
- [ ] **T412:** Update `OrderingService` to emit `order:ready` to 'waiter' room
- [ ] **T413:** Implement `SocketService.joinRoom(socket, role)` logic

---

## 2. Frontend - Unified Infrastructure (smart-restaurant-admin/client)

### 2.1 Routing & Layouts (All)

- [ ] **T420:** Create `RoleBasedRedirect` component in `components/common/RoleBasedRedirect.tsx`
- [ ] **T421:** Update `App.tsx`:
  - `/` -> Login
  - `/dashboard` -> Admin Layout (Protect: ADMIN)
  - `/kitchen` -> Kitchen Layout (Protect: KITCHEN_STAFF)
  - `/waiter` -> Waiter Layout (Protect: WAITER)
- [ ] **T422:** Create `StaffLayout.tsx`: Minimal header (Clock, WiFi status, Logout), Max screen space
- [ ] **T423:** Update `AuthContext` to handle redirection after login based on role

---

## 3. Frontend - Kitchen Display System (Developer B)

### 3.1 UI Components

- [ ] **T430:** Create `KitchenOrderCard` component (High contrast, large fonts)
  - Header: Table #, Timer (Green/Yellow/Red)
  - Body: List of items with modifiers
  - Footer: 'Mark Ready' button
- [ ] **T431:** Create `TimerBadge` component (Calculates time since `createdAt`)
- [ ] **T432:** Create `SoundManager` utility using `howler.js` (Ding on new order)

### 3.2 Pages & Logic

- [ ] **T433:** Create `KitchenDisplayPage.tsx`
- [ ] **T434:** Implement `useKitchenSocket` hook (Listen: `order:confirmed`)
- [ ] **T435:** Implement Grid Layout (Masonry or CSS Grid) for cards
- [ ] **T436:** Add "Recall History" modal (View last 10 completed orders)

---

## 4. Frontend - Waiter Dashboard (Developer C)

### 4.1 Pending Orders Workflow

- [ ] **T480:** Create `WaiterDashboardPage.tsx` with Tabs: Pending, Tables, Bills
- [ ] **T481:** Create `PendingOrderCard` component
  - Show Guest Name, Table #, Total
  - Actions: **Accept** (Send to Kitchen), **Reject** (Cancel)
- [ ] **T482:** Implement `useWaiterSocket` hook (Listen: `order:created`, `order:ready`, `bill:requested`)

### 4.2 Table & Billing Management

- [ ] **T483:** Create `TableGridView` component
  - Green: Available
  - Red: Occupied (Show active order status)
  - Blue: Bill Requested
- [ ] **T484:** Create `BillForm` modal
  - View Order Summary
  - Add Discount (Form input)
  - Button: "Print Bill", "Mark Paid"
- [ ] **T485:** Implement `handlePayment` mutation (Call `POST /api/waiter/bill/pay`)

---

## 5. Integration & Verification

- [ ] **T490:** Verify End-to-End Flow:
  1. Customer scans QR -> Places Order (PENDING)
  2. Waiter sees PENDING card -> Accepts (CONFIRMED)
  3. Kitchen sees CONFIRMED card -> Starts Cooking (PREPARING)
  4. Kitchen marks READY
  5. Waiter gets notification -> Serves food (SERVED)
  6. Customer requests Bill -> Waiter sees Alert
  7. Waiter generates Bill -> Marks Paid (COMPLETED)
- [ ] **T491:** Offline Mode Check: App should warn if Socket disconnects
