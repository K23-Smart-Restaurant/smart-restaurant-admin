# Admin Frontend - Parallel Task Distribution (3 Members)

**Date**: December 16, 2025  
**Project**: Smart Restaurant Admin App Frontend  
**Goal**: Complete Phase 2 frontend with mock data (no API integration)

---

## 🎯 Overview

This document organizes Admin App frontend tasks (T357-T390) into **3 parallel tracks** for team members. All tasks use **mock data** stored in local state instead of API calls. Focus is on UI/UX implementation.

**Total Tasks**: 34 tasks  
**All Parallelizable**: ✅ No dependencies between members  
**Timeline Estimate**: 5-7 days per member

---

## 📦 Initial Setup (All Members)

Before starting, ensure you have the base dependencies installed:

```bash
cd smart-restaurant-admin/client

# Core dependencies (already installed from Phase 2)
npm install react-router-dom @tanstack/react-query axios
npm install react-hook-form zod @hookform/resolvers/zod
npm install tailwindcss @headlessui/react

# Member-specific dependencies
npm install qrcode.react          # Member 2 (for QR code generation)
npm install recharts              # Member 3 (for charts)
# OR: npm install chart.js react-chartjs-2
```

---

## 👤 MEMBER 1: Dashboard + Staff + Categories (11 tasks)

**Focus Area**: Core layout, staff management workflows, category CRUD  
**Points at Risk**: -0.75 points if incomplete

### Task List

#### 1. Layout & Dashboard (2 tasks)

**T357** - Create DashboardLayout with sidebar navigation  
**File**: `src/components/layout/DashboardLayout.tsx`  
**Requirements**:

- Sidebar with navigation links:
  - Dashboard (home icon)
  - Staff Management (users icon)
  - Categories (folder icon)
  - Menu Items (utensils icon)
  - Tables (grid icon)
  - Orders (shopping-cart icon)
  - Reports (chart icon)
- Header with:
  - Restaurant name/logo
  - User profile dropdown (Admin name, Logout)
  - Notifications bell icon
- Responsive: Collapse sidebar on mobile with hamburger menu
- Use `<Outlet />` from react-router-dom for page content
- Tailwind classes: sticky sidebar, smooth transitions

**T358** - Create DashboardPage with summary cards  
**File**: `src/pages/DashboardPage.tsx`  
**Mock Data**:

```typescript
const mockDashboardData = {
  totalOrders: 156,
  todayRevenue: 12450,
  activeTables: 8,
  totalTables: 12,
  staffOnline: 5,
  totalStaff: 8,
};
```

**Requirements**:

- 4 summary cards in grid layout (2x2 on desktop, 1 column on mobile):
  - Total Orders (with trend icon +12%)
  - Today's Revenue ($12,450 with currency formatting)
  - Active Tables (8/12 with progress bar)
  - Staff Online (5/8 with status indicators)
- Recent orders list (mock 5 orders)
- Quick actions buttons: "Add Menu Item", "View Orders"

---

#### 2. Staff Management (5 tasks)

**T359** - Create useStaff hook with mock data  
**File**: `src/hooks/useStaff.ts`  
**Mock Data**:

```typescript
const mockStaff = [
  {
    id: "1",
    email: "john@restaurant.com",
    name: "John Doe",
    role: "WAITER",
    phoneNumber: "+1234567890",
    isActive: true, // UI-only field for filtering
    createdAt: "2024-01-15T00:00:00.000Z",
  },
  {
    id: "2",
    email: "jane@restaurant.com",
    name: "Jane Smith",
    role: "WAITER",
    phoneNumber: "+1234567891",
    isActive: true,
    createdAt: "2024-02-20T00:00:00.000Z",
  },
  {
    id: "3",
    email: "mike@restaurant.com",
    name: "Mike Wilson",
    role: "WAITER",
    phoneNumber: "+1234567892",
    isActive: false, // Deactivated staff
    createdAt: "2024-03-10T00:00:00.000Z",
  },
  {
    id: "4",
    email: "sarah@restaurant.com",
    name: "Sarah Brown",
    role: "KITCHEN_STAFF",
    phoneNumber: "+1234567893",
    isActive: true,
    createdAt: "2024-01-20T00:00:00.000Z",
  },
  {
    id: "5",
    email: "tom@restaurant.com",
    name: "Tom Lee",
    role: "KITCHEN_STAFF",
    phoneNumber: "+1234567894",
    isActive: true,
    createdAt: "2024-02-15T00:00:00.000Z",
  },
];
```

**Requirements**:

- useState to manage staff array
- Functions:
  - `addStaff(staff)` - adds to array with generated ID
  - `updateStaff(id, data)` - updates staff by ID
  - `deleteStaff(id)` - removes from array (or toggle isActive)
  - `filterByRole(role)` - returns filtered array
- Return: `{ staff, addStaff, updateStaff, deleteStaff, filterByRole }`
- Note: `isActive` is a UI-only field for filtering; not in schema but useful for display

**T360** - Create CreateWaiterForm ⭐ **Points: -0.25**  
**File**: `src/components/staff/CreateWaiterForm.tsx`  
**Requirements**:

- Form fields:
  - Name (required, min 3 chars)
  - Email (required, email validation)
  - Phone Number (optional)
  - Password (required, min 8 chars)
  - Confirm Password (must match)
- Use react-hook-form + Zod validation
- Submit button: "Create Waiter Account"
- On submit: call `addStaff({ ...formData, role: 'WAITER', isActive: true, createdAt: new Date().toISOString() })`
- Show success toast, close modal, reset form

**T361** - Create CreateKitchenStaffForm ⭐ **Points: -0.25**  
**File**: `src/components/staff/CreateKitchenStaffForm.tsx`  
**Requirements**:

- Same fields as CreateWaiterForm
- Submit: `addStaff({ ...formData, role: 'KITCHEN_STAFF', isActive: true, createdAt: new Date().toISOString() })`
- Can reuse validation schema from T360

**T362** - Create StaffList with edit/deactivate  
**File**: `src/components/staff/StaffList.tsx`  
**Props**: `{ role: 'WAITER' | 'KITCHEN_STAFF' | 'ALL' }`  
**Requirements**:

- Table with columns: Avatar, Name, Email, Phone, Status, Joined Date, Actions
- Status badge: Green for isActive=true ("Active"), Gray for isActive=false ("Inactive")
- Action buttons per row:
  - Edit (pencil icon) - opens edit modal
  - Deactivate/Activate toggle (trash/check icon) - toggles isActive field
- Filter dropdown above table: All, Active, Inactive
- Joined Date displays createdAt formatted as date
- Empty state: "No staff members found"

**T363** - Create StaffManagementPage  
**File**: `src/pages/StaffManagementPage.tsx`  
**Requirements**:

- Page title: "Staff Management"
- Tabs component: "Waiters" and "Kitchen Staff"
- Tab 1 (Waiters):
  - "Add Waiter" button (opens CreateWaiterForm modal)
  - StaffList with role="WAITER"
- Tab 2 (Kitchen Staff):
  - "Add Kitchen Staff" button (opens CreateKitchenStaffForm modal)
  - StaffList with role="KITCHEN_STAFF"
- Use Headless UI Tabs component

---

#### 3. Category Management (4 tasks)

**T364** - Create useCategories hook with mock data  
**File**: `src/hooks/useCategories.ts`  
**Mock Data**:

```typescript
const mockCategories = [
  {
    id: "1",
    name: "Appetizers",
    description: "Start your meal right",
    displayOrder: 1,
    isActive: true, // UI-only field (not in schema, used for filtering)
    itemCount: 8, // Computed field (count of related MenuItems)
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "2",
    name: "Main Course",
    description: "Hearty main dishes",
    displayOrder: 2,
    isActive: true,
    itemCount: 15,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "3",
    name: "Desserts",
    description: "Sweet endings",
    displayOrder: 3,
    isActive: true,
    itemCount: 6,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "4",
    name: "Beverages",
    description: "Drinks and refreshments",
    displayOrder: 4,
    isActive: true,
    itemCount: 12,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
];
```

**Requirements**:

- Functions: `addCategory`, `updateCategory`, `deleteCategory`, `toggleActive`
- Return: `{ categories, addCategory, updateCategory, deleteCategory, toggleActive }`
- Note: `isActive` and `itemCount` are UI-only computed fields for display purposes

**T365** - Create CategoryForm ⭐ **Points: -0.25**  
**File**: `src/components/category/CategoryForm.tsx`  
**Props**: `{ category?: Category, onSubmit: (data) => void, onCancel: () => void }`  
**Requirements**:

- Form fields:
  - Name (required, max 50 chars)
  - Description (optional, max 200 chars)
  - Display Order (number, default to 0)
  - Active toggle switch (UI-only field)
- Edit mode: pre-fill fields if category prop exists
- On submit: include createdAt and updatedAt timestamps
- Validation with Zod
- Buttons: "Save Category" and "Cancel"

**T366** - Create CategoryList with edit/delete  
**File**: `src/components/category/CategoryList.tsx`  
**Requirements**:

- Grid layout (3 columns on desktop, 1 on mobile)
- Card per category showing:
  - Category name (large text)
  - Description
  - Item count badge ("8 items")
  - Active/Inactive badge
- Hover actions: Edit and Delete buttons
- Delete confirmation: "Are you sure? This will unassign X menu items."

**T367** - Create CategoryManagementPage  
**File**: `src/pages/CategoryManagementPage.tsx`  
**Requirements**:

- Page title: "Categories"
- "Add Category" button (top right) - opens CategoryForm modal
- CategoryList component
- Modal for Create/Edit category with CategoryForm

---

## 👤 MEMBER 2: Menu Items + Tables + QR Codes (11 tasks)

**Focus Area**: Menu CRUD with images/modifiers, Table QR code generation  
**Points at Risk**: -2.5 points if incomplete

### Task List

#### 1. Menu Item Management (6 tasks)

**T368** - Create useMenuItems hook with mock data and filters  
**File**: `src/hooks/useMenuItems.ts`  
**Mock Data**:

```typescript
const mockMenuItems = [
  {
    id: "1",
    name: "Classic Burger",
    description: "Juicy beef patty with fresh vegetables",
    price: 12.99,
    category: "MAIN_COURSE", // MenuCategory enum value
    categoryId: "2",
    imageUrl: "/mock-images/burger1.jpg", // Single URL (use first image)
    isAvailable: true,
    isSoldOut: false,
    isChefRecommendation: false,
    preparationTime: 15, // minutes
    createdAt: "2024-12-01T00:00:00.000Z",
    updatedAt: "2024-12-01T00:00:00.000Z",
    // Modifiers are separate Modifier records, but for UI display:
    modifierGroups: [
      // UI-only field for easier form handling
      {
        groupName: "Size",
        modifiers: [
          { id: "m1", name: "Regular", price: 0 },
          { id: "m2", name: "Large", price: 2 },
        ],
      },
      {
        groupName: "Extras",
        modifiers: [
          { id: "m3", name: "Cheese", price: 1 },
          { id: "m4", name: "Bacon", price: 2 },
        ],
      },
    ],
  },
  {
    id: "2",
    name: "Caesar Salad",
    description: "Fresh romaine with Caesar dressing",
    price: 8.99,
    category: "APPETIZER",
    categoryId: "1",
    imageUrl: "/mock-images/salad.jpg",
    isAvailable: true,
    isSoldOut: false,
    isChefRecommendation: true,
    preparationTime: 10,
    createdAt: "2024-12-01T00:00:00.000Z",
    updatedAt: "2024-12-01T00:00:00.000Z",
    modifierGroups: [],
  },
  {
    id: "3",
    name: "Chocolate Cake",
    description: "Rich chocolate layer cake",
    price: 6.99,
    category: "DESSERT",
    categoryId: "3",
    imageUrl: "/mock-images/cake.jpg",
    isAvailable: false, // Temporarily unavailable
    isSoldOut: false,
    isChefRecommendation: false,
    preparationTime: 5,
    createdAt: "2024-12-01T00:00:00.000Z",
    updatedAt: "2024-12-01T00:00:00.000Z",
    modifierGroups: [],
  },
  // ... add 17 more items with variety across categories
];
```

**Requirements**:

- Functions:
  - `addMenuItem(item)` - add to array
  - `updateMenuItem(id, data)` - update item
  - `deleteMenuItem(id)` - remove item
  - `updateAvailability(id, isAvailable, isSoldOut)` - update availability status
  - `filterByName(query)` - search by name
  - `filterByCategory(categoryId)` - filter by category enum
  - `sortBy(field)` - sort by name, price, or createdAt
- Return all functions and filtered/sorted items
- Note: Status display logic: Sold Out (isSoldOut=true), Unavailable (isAvailable=false), Available (isAvailable=true && isSoldOut=false)

**T369** - Create MenuItemForm with image upload ⭐ **Points: -0.75**  
**File**: `src/components/menuItem/MenuItemForm.tsx`  
**Requirements**:

- Form fields:
  - Name (required)
  - Description (textarea, required)
  - Price (number, min 0, decimal, required)
  - Category (dropdown with enum values: APPETIZER, MAIN_COURSE, DESSERT, BEVERAGE)
  - Category Reference (dropdown from Category model - optional)
  - Image URL (single file upload with preview)
  - Preparation Time (number in minutes, optional)
  - Available toggle (isAvailable)
  - Sold Out toggle (isSoldOut)
  - Chef's Recommendation toggle (isChefRecommendation)
- Image upload:
  - Use `<input type="file" accept="image/*" />`
  - Preview with FileReader (convert to data URL for imageUrl)
  - Display thumbnail with remove button
- Include ModifierGroupForm component (T370)
- Submit: validate and call onSubmit callback with createdAt/updatedAt timestamps

**T370** - Create ModifierGroupForm ⭐ **Points: -0.5**  
**File**: `src/components/menuItem/ModifierGroupForm.tsx`  
**Requirements**:

- Manage array of modifier groups
- Each group has:
  - Group name (e.g., "Size", "Extras")
  - Multiple options (name + price)
- UI:
  - "Add Modifier Group" button
  - For each group:
    - Group name input
    - "Add Option" button
    - Option rows (name input, price input, remove button)
    - Remove group button
- Dynamic add/remove functionality
- Returns array structure for parent form

**T371** - Create MenuItemList with filters and sorting ⭐ **Points: -0.5**  
**File**: `src/components/menuItem/MenuItemList.tsx`  
**Requirements**:

- Filter/search bar at top:
  - Search input (by name)
  - Category dropdown filter
  - Sort dropdown (Name A-Z, Price Low-High, Newest)
- Grid layout (3 columns desktop, 2 tablet, 1 mobile)
- Display MenuItemCard for each item
- Empty state when no items match filters
- Show result count: "Showing 12 items"

**T372** - Create MenuItemCard ⭐ **Points: -0.25**  
**File**: `src/components/menuItem/MenuItemCard.tsx`  
**Requirements**:

- Card showing:
  - imageUrl (or placeholder if no image)
  - Name
  - Price (formatted: $12.99)
  - Category badge (display enum: APPETIZER, MAIN_COURSE, DESSERT, BEVERAGE)
  - Status badge with color (derived from isAvailable and isSoldOut):
    - Green: Available (isAvailable=true, isSoldOut=false)
    - Yellow: Sold Out (isSoldOut=true)
    - Gray: Unavailable (isAvailable=false)
  - Chef's Recommendation star icon (if isChefRecommendation=true)
- Quick status toggle (dropdown: Available/Sold Out/Unavailable)
- Action buttons: Edit, Delete
- Hover effect: shadow and scale

**T373** - Create MenuManagementPage ⭐ **Points: -0.5**  
**File**: `src/pages/MenuManagementPage.tsx`  
**Requirements**:

- Page title: "Menu Management"
- "Add Menu Item" button - opens MenuItemForm modal
- MenuItemList with all filters
- Modal for Create/Edit with MenuItemForm
- Delete confirmation dialog

---

#### 2. Table Management + QR Codes (5 tasks)

**T374** - Create useTables hook with mock data  
**File**: `src/hooks/useTables.ts`  
**Mock Data**:

```typescript
const mockTables = [
  {
    id: "T001",
    tableNumber: 1, // Schema field name
    capacity: 2,
    location: "Indoor", // UI-only field (not in schema, but useful for display)
    status: "AVAILABLE", // TableStatus enum
    qrCode: "https://restaurant.com/menu?table=T001",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "T002",
    tableNumber: 2,
    capacity: 4,
    location: "Indoor",
    status: "OCCUPIED",
    qrCode: "https://restaurant.com/menu?table=T002",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "T003",
    tableNumber: 3,
    capacity: 4,
    location: "Outdoor",
    status: "AVAILABLE",
    qrCode: "https://restaurant.com/menu?table=T003",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "T004",
    tableNumber: 4,
    capacity: 6,
    location: "Patio",
    status: "RESERVED",
    qrCode: "https://restaurant.com/menu?table=T004",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "T005",
    tableNumber: 5,
    capacity: 8,
    location: "Indoor",
    status: "AVAILABLE",
    qrCode: "https://restaurant.com/menu?table=T005",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
];
```

**Requirements**:

- Functions: `addTable`, `updateTable`, `deleteTable`, `regenerateQR`
- `regenerateQR` updates the qrCode field with new timestamp
- Note: `location` is a UI-only field (not in schema) but useful for organizing tables

**T375** - Create TableForm ⭐ **Points: +0.5**  
**File**: `src/components/table/TableForm.tsx`  
**Requirements**:

- Form fields:
  - Table Number (number, required, unique) - matches schema field `tableNumber`
  - Capacity (dropdown: 2, 4, 6, 8, 10)
  - Location (dropdown: Indoor, Outdoor, Patio, Private Room) - UI-only field for organization
  - Status (dropdown from TableStatus enum: AVAILABLE, OCCUPIED, RESERVED)
- Validation with Zod
- On submit: include createdAt and updatedAt timestamps
- Edit mode support

**T376** - Create QRCodeDisplay with download/print ⭐ **Points: +0.75**  
**File**: `src/components/table/QRCodeDisplay.tsx`  
**Requirements**:

- Install: `npm install qrcode.react`
- Use `<QRCodeSVG value={table.qrCode} size={256} />`
- Display:
  - Large QR code
  - Table info (number, capacity, location)
  - QR URL text below
- Action buttons:
  - **Download PNG**: Convert SVG to canvas, use `canvas.toDataURL()`, trigger download
  - **Print**: Use `window.print()` with print-specific CSS
  - **Regenerate**: Call regenerateQR function, show new QR
- Modal or dedicated page view

**T377** - Create TableList with regenerate QR  
**File**: `src/components/table/TableList.tsx`  
**Requirements**:

- Table view with columns:
  - Table # (display tableNumber, sortable)
  - Capacity (with person icon)
  - Location (UI-only field)
  - Status (colored badge from TableStatus enum)
  - QR Code (small thumbnail, clickable)
  - Actions (View QR, Edit, Delete)
- Click QR thumbnail: open QRCodeDisplay modal
- Status color coding:
  - Green: AVAILABLE
  - Yellow: OCCUPIED
  - Blue: RESERVED

**T378** - Create TableManagementPage  
**File**: `src/pages/TableManagementPage.tsx`  
**Requirements**:

- Page title: "Table Management"
- "Add Table" button
- TableList component
- Modals:
  - Create/Edit table (TableForm)
  - View QR Code (QRCodeDisplay)
- Summary cards: Total Tables, Available, Occupied, Reserved

---

## 👤 MEMBER 3: Orders + Reports + Analytics (12 tasks)

**Focus Area**: Order tracking, KDS display, analytics/charts  
**Points at Risk**: -2.0 points if incomplete

### Task List

#### 1. Order Management (6 tasks)

**T379** - Create useOrders hook with mock data and filters  
**File**: `src/hooks/useOrders.ts`  
**Mock Data**:

```typescript
const mockOrders = [
  {
    id: "ORD001",
    orderNumber: 1001,
    tableId: "T002",
    tableName: "Table 2", // UI-only computed field from Table relation
    userId: null, // Guest order
    guestName: "John Smith",
    guestContact: "+1234567890",
    waiterId: null,
    status: "PREPARING", // OrderStatus enum
    paymentStatus: "UNPAID", // PaymentStatus enum
    totalAmount: 30.97,
    notes: "No onions please",
    createdAt: new Date(Date.now() - 15 * 60000).toISOString(), // 15 min ago
    updatedAt: new Date(Date.now() - 10 * 60000).toISOString(),
    paidAt: null,
    prepTime: 30, // UI-only field for display (expected prep time)
    // OrderItems as separate array (matches OrderItem model)
    orderItems: [
      {
        id: "OI001",
        orderId: "ORD001",
        menuItemId: "1",
        menuItemName: "Classic Burger", // UI-only from MenuItem relation
        quantity: 2,
        unitPrice: 12.99,
        subtotal: 25.98,
        itemStatus: "COOKING", // OrderItemStatus enum
        specialInstructions: "Well done",
        createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
      },
      {
        id: "OI002",
        orderId: "ORD001",
        menuItemId: "2",
        menuItemName: "French Fries",
        quantity: 1,
        unitPrice: 4.99,
        subtotal: 4.99,
        itemStatus: "READY",
        specialInstructions: null,
        createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
      },
    ],
  },
  {
    id: "ORD002",
    orderNumber: 1002,
    tableId: "T003",
    tableName: "Table 3",
    userId: "user-123", // Registered customer
    guestName: null,
    guestContact: null,
    waiterId: "1", // Assigned to John Doe
    status: "READY",
    paymentStatus: "UNPAID",
    totalAmount: 45.5,
    notes: null,
    createdAt: new Date(Date.now() - 45 * 60000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 60000).toISOString(),
    paidAt: null,
    prepTime: 25,
    orderItems: [
      {
        id: "OI003",
        orderId: "ORD002",
        menuItemId: "3",
        menuItemName: "Grilled Salmon",
        quantity: 1,
        unitPrice: 24.99,
        subtotal: 24.99,
        itemStatus: "READY",
        specialInstructions: null,
        createdAt: new Date(Date.now() - 45 * 60000).toISOString(),
      },
    ],
  },
  // ... 13 more orders with different statuses and times
];
```

**Requirements**:

- Order statuses from OrderStatus enum: PENDING, CONFIRMED, PREPARING, READY, SERVED, PAID, CANCELLED
- Payment statuses from PaymentStatus enum: UNPAID, PENDING, PAID, FAILED
- OrderItem statuses from OrderItemStatus enum: QUEUED, COOKING, READY
- Functions:
  - `updateOrderStatus(id, newStatus)` - update order status
  - `updateOrderItemStatus(orderItemId, itemStatus)` - update individual item status
  - `filterByStatus(status)` - filter orders by OrderStatus
  - `getOverdueOrders()` - orders where elapsed time > prepTime
- Calculate elapsed time: `Date.now() - new Date(createdAt).getTime()`
- Return: `{ orders, updateOrderStatus, updateOrderItemStatus, filterByStatus, getOverdueOrders }`

**T380** - Create OrderCard for KDS display ⭐ **Points: -0.5**  
**File**: `src/components/order/OrderCard.tsx`  
**Requirements**:

- Large card design (good visibility from distance)
- Display:
  - Order # (orderNumber, large, bold)
  - Table # (from tableId/tableName)
  - Customer: guestName or userId (if registered)
  - Elapsed time badge (real-time update every minute)
  - OrderItems list (large font):
    - Quantity x menuItemName (from orderItems array)
    - specialInstructions in smaller text below
    - Individual item status badge (QUEUED/COOKING/READY)
  - Order notes (if any) - highlighted
  - Order status badge (OrderStatus enum)
  - Payment status badge (PaymentStatus enum)
- Color coding by order status:
  - Yellow border: PENDING
  - Blue border: PREPARING
  - Green border: READY
  - Gray border: SERVED
  - **Red border + alert icon: Overdue** (elapsed > prepTime)
- Action button: "Mark as Ready" (changes PREPARING → READY)
- Click card: open OrderDetailModal

**T381** - Create OrderList with status filters ⭐ **Points: -0.25**  
**File**: `src/components/order/OrderList.tsx`  
**Requirements**:

- Tab filters: All, Pending, Preparing, Ready, Served
- Active tab shows count: "Preparing (5)"
- Sort options: Newest First, Oldest First, Table Number
- Grid layout (2-3 columns)
- Display OrderCard for each order
- Auto-refresh simulation: use `setInterval` to add new order every 30s (for demo)

**T382** - Create OrderDetailModal ⭐ **Points: -0.25**  
**File**: `src/components/order/OrderDetailModal.tsx`  
**Requirements**:

- Modal showing full order details:
  - Order # (orderNumber) and Table # (tableName)
  - Customer: guestName + guestContact OR userId
  - Waiter: waiterId (lookup staff name)
  - Order time (createdAt) and elapsed time
  - OrderItems list with:
    - Quantity x menuItemName - $unitPrice
    - Subtotal (from orderItem.subtotal)
    - specialInstructions indented
    - Individual item status (QUEUED/COOKING/READY)
  - Order Total: totalAmount
  - Tax calculation: (can be computed from totalAmount if needed)
  - Order notes section (highlighted if present)
  - Order status (OrderStatus enum)
  - Payment status (PaymentStatus enum)
  - Status timeline (visual: PENDING → CONFIRMED → PREPARING → READY → SERVED → PAID)
- Status update dropdown: change order status
- Item status update: change individual orderItem status
- Close button

**T383** - Add prep time alerts in OrderCard ⭐ **Points: +0.25**  
**File**: Update `src/components/order/OrderCard.tsx`  
**Requirements**:

- Calculate: `elapsedMinutes = Math.floor((Date.now() - createdAt) / 60000)`
- If `elapsedMinutes > prepTime`:
  - Add red border (`border-red-500`)
  - Show alert icon (⚠️)
  - Display: "OVERDUE by X min" badge
- Use `useEffect` with `setInterval` to update every minute
- Pulse animation on overdue cards

**T384** - Create OrderManagementPage ⭐ **Points: -0.25**  
**File**: `src/pages/OrderManagementPage.tsx`  
**Requirements**:

- Page title: "Order Management"
- Summary cards row:
  - Total Orders Today
  - Pending Orders (count)
  - Average Prep Time
  - Overdue Orders (red if > 0)
- OrderList with all filters
- OrderDetailModal (opens on card click)
- Real-time simulation: Add new mock order every 30s (for demo purposes)

---

#### 2. Reports & Analytics (6 tasks)

**T385** - Create useReports hook with mock data  
**File**: `src/hooks/useReports.ts`  
**Mock Data**:

```typescript
const mockRevenueData = [
  { date: "2024-12-01", revenue: 450, orders: 35 },
  { date: "2024-12-02", revenue: 520, orders: 42 },
  // ... 30 days of data
];

const mockTopItems = [
  { name: "Classic Burger", orderCount: 145, revenue: 1883.55 },
  { name: "Margherita Pizza", orderCount: 128, revenue: 1792.0 },
  { name: "Caesar Salad", orderCount: 98, revenue: 882.0 },
  // ... top 10 items
];

const mockPeakHours = [
  { hour: "11 AM", orders: 15 },
  { hour: "12 PM", orders: 28 },
  { hour: "1 PM", orders: 32 },
  { hour: "2 PM", orders: 18 },
  // ... 24 hours
];
```

**Requirements**:

- Functions:
  - `getRevenueData(dateRange)` - filter by Last 7 Days, Last 30 Days, Last 3 Months
  - `getTopItems(limit)` - return top N items
  - `getPeakHours()` - return hourly data
- Return: `{ revenueData, topItems, peakHours, dateRange, setDateRange }`

**T386** - Install Chart library ⭐ **Points: -0.25**  
**Action**: Run in terminal

```bash
cd smart-restaurant-admin/client
npm install recharts
```

**Alternative**: `npm install chart.js react-chartjs-2`

**T387** - Create RevenueChart with date range selector ⭐ **Points: -0.25**  
**File**: `src/components/reports/RevenueChart.tsx`  
**Requirements**:

- Line chart showing revenue over time (X: dates, Y: revenue $)
- Date range selector buttons: "7 Days", "30 Days", "3 Months"
- Use Recharts `<LineChart>` component
- Show tooltip on hover with date and exact revenue
- Display total revenue for selected period above chart
- Responsive: adjust width for mobile

**T388** - Create TopItemsChart ⭐ **Points: -0.25**  
**File**: `src/components/reports/TopItemsChart.tsx`  
**Requirements**:

- Horizontal bar chart showing top 10 menu items by order count
- X-axis: Order count
- Y-axis: Item names
- Color gradient bars (green for top item, fading to blue)
- Show exact count on hover
- Click bar: show revenue for that item

**T389** - Create OrderAnalyticsChart ⭐ **Points: -0.25**  
**File**: `src/components/reports/OrderAnalyticsChart.tsx`  
**Requirements**:

- Two charts in one component:
  1. **Orders per Day** (Line chart):
     - X: Last 30 days
     - Y: Number of orders
     - Show average line (dashed)
  2. **Peak Hours** (Bar chart):
     - X: Hour of day (24 hours)
     - Y: Order count
     - Highlight peak hours (> average) in different color
- Toggle between charts with tabs or display both

**T390** - Create ReportsPage  
**File**: `src/pages/ReportsPage.tsx`  
**Requirements**:

- Page title: "Reports & Analytics"
- Summary cards row:
  - Total Revenue (this month)
  - Total Orders (this month)
  - Average Order Value
  - Most Popular Item
- Charts section:
  - RevenueChart (full width)
  - Row with TopItemsChart (50%) and OrderAnalyticsChart (50%)
- Export button (mock functionality): "Download PDF Report"
- Print button: `window.print()`

---

## 📋 Coordination Guidelines

### 1. **Start with Member 1's DashboardLayout**

- Member 1 should complete **T357** (DashboardLayout) first
- Share the component with Member 2 and Member 3
- All pages should be wrapped in DashboardLayout using `<Outlet />`

### 2. **Shared Components** (Create in `src/components/common/`)

All members can create and share:

- `Button.tsx` - Reusable button component
- `Modal.tsx` - Modal wrapper with Headless UI
- `Card.tsx` - Card container
- `Badge.tsx` - Status badge component
- `Toast.tsx` - Toast notification
- `Input.tsx`, `Select.tsx`, `Textarea.tsx` - Form inputs

### 3. **Styling Consistency**

**Color Palette** - Configure in `tailwind.config.js`:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        // Main colors
        charcoal: "#141414", // Primary dark background
        white: "#ffffff", // Text on dark, light backgrounds
        naples: "#ffdc64", // Primary accent (buttons, highlights)
        // Supporting colors
        antiflash: "#f0f0f0", // Light backgrounds, borders
        black: "#000000", // Pure black for emphasis
        arylide: "#dcc864", // Darker yellow for hover states
      },
    },
  },
};
```

**Usage Guidelines**:

- **Primary Actions**: `bg-naples hover:bg-arylide text-charcoal`
- **Backgrounds**:
  - Main: `bg-charcoal text-white`
  - Cards: `bg-white text-charcoal`
  - Subtle: `bg-antiflash text-charcoal`
- **Borders**: `border-antiflash` or `border-arylide`
- **Status Badges**:
  - Active/Success: `bg-green-600 text-white`
  - Warning: `bg-naples text-charcoal`
  - Inactive/Disabled: `bg-antiflash text-gray-600`
  - Error/Danger: `bg-red-600 text-white`
- **Sidebar**: `bg-charcoal text-white border-r border-arylide`
- **Header**: `bg-white border-b border-antiflash`
- **Cards**: `bg-white rounded-lg shadow-md p-6 border border-antiflash`
- **Buttons**:
  - Primary: `px-4 py-2 bg-naples hover:bg-arylide text-charcoal rounded-md font-medium`
  - Secondary: `px-4 py-2 bg-white hover:bg-antiflash text-charcoal border border-antiflash rounded-md font-medium`
- **Focus States**: `focus:ring-2 focus:ring-naples focus:ring-offset-2`
- **Text**:
  - Primary: `text-charcoal`
  - Secondary: `text-gray-600`
  - On dark: `text-white`
  - Accent: `text-naples`

### 4. **Mock Data Best Practices**

- Store mock data in separate files: `src/mocks/mockStaff.ts`, `src/mocks/mockMenuItems.ts`, etc.
- Use meaningful data (realistic names, prices, dates)
- Include enough variety (different statuses, categories, etc.)

### 5. **Testing Your Work**

Each member should:

1. Test all CRUD operations (Create, Read, Update, Delete)
2. Verify forms validate correctly
3. Check responsive design on mobile (DevTools)
4. Test edge cases (empty states, long text, many items)
5. Ensure no console errors

---

## 🔗 Routing Setup (Shared Task)

One member should set up routes in `src/App.tsx`:

```typescript
import { BrowserRouter, Routes, Route } from "react-router-dom";
import DashboardLayout from "./components/layout/DashboardLayout";
import DashboardPage from "./pages/DashboardPage";
import StaffManagementPage from "./pages/StaffManagementPage";
import CategoryManagementPage from "./pages/CategoryManagementPage";
import MenuManagementPage from "./pages/MenuManagementPage";
import TableManagementPage from "./pages/TableManagementPage";
import OrderManagementPage from "./pages/OrderManagementPage";
import ReportsPage from "./pages/ReportsPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="staff" element={<StaffManagementPage />} />
          <Route path="categories" element={<CategoryManagementPage />} />
          <Route path="menu" element={<MenuManagementPage />} />
          <Route path="tables" element={<TableManagementPage />} />
          <Route path="orders" element={<OrderManagementPage />} />
          <Route path="reports" element={<ReportsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
```

---

## ✅ Completion Checklist

### Member 1

- [ ] DashboardLayout works with all navigation
- [ ] Dashboard shows all summary cards
- [ ] Can create/edit/delete waiters
- [ ] Can create/edit/delete kitchen staff
- [ ] Can create/edit/delete categories
- [ ] All forms validate correctly

### Member 2

- [ ] Can create menu items with images
- [ ] Modifier groups work correctly
- [ ] Can filter/search/sort menu items
- [ ] Can create/edit/delete tables
- [ ] QR codes generate and display correctly
- [ ] Can download/print QR codes

### Member 3

- [ ] Orders display with correct statuses
- [ ] Overdue orders show alerts
- [ ] Can update order status
- [ ] Order detail modal shows all info
- [ ] All 3 charts render correctly
- [ ] Charts respond to date range changes

---

## 📞 Support & Questions

If you encounter issues:

1. **Check imports**: Ensure all components are imported correctly
2. **Verify mock data**: Console.log to check data structure
3. **Read error messages**: Most errors point to the exact issue
4. **Check Tailwind**: Run `npm run dev` to ensure Tailwind compiles
5. **Ask team members**: Share solutions in team chat

---

## 🎯 Success Criteria

**Definition of Done** for each task:

- ✅ Component renders without errors
- ✅ UI matches requirements
- ✅ Responsive on mobile (test in DevTools)
- ✅ All user interactions work (buttons, forms, modals)
- ✅ Mock data updates correctly (CRUD operations)
- ✅ No console errors or warnings
- ✅ Code is clean and readable

---
