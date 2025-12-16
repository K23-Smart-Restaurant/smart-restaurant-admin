## MEMBER 1: Dashboard + Staff + Categories (11 tasks)

**Focus Area**: Core layout, staff management workflows, category CRUD  
**Points at Risk**: -0.75 points if incomplete

### Task List

#### 1. Layout & Dashboard (2 tasks)

**T357** - Create DashboardLayout with sidebar navigation  
**File**: `src/components/layout/DashboardLayout.tsx`  
**Requirements**:

-   Sidebar with navigation links:
    -   Dashboard (home icon)
    -   Staff Management (users icon)
    -   Categories (folder icon)
    -   Menu Items (utensils icon)
    -   Tables (grid icon)
    -   Orders (shopping-cart icon)
    -   Reports (chart icon)
-   Header with:
    -   Restaurant name/logo
    -   User profile dropdown (Admin name, Logout)
    -   Notifications bell icon
-   Responsive: Collapse sidebar on mobile with hamburger menu
-   Use `<Outlet />` from react-router-dom for page content
-   Tailwind classes: sticky sidebar, smooth transitions

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

-   4 summary cards in grid layout (2x2 on desktop, 1 column on mobile):
    -   Total Orders (with trend icon +12%)
    -   Today's Revenue ($12,450 with currency formatting)
    -   Active Tables (8/12 with progress bar)
    -   Staff Online (5/8 with status indicators)
-   Recent orders list (mock 5 orders)
-   Quick actions buttons: "Add Menu Item", "View Orders"

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

-   useState to manage staff array
-   Functions:
    -   `addStaff(staff)` - adds to array with generated ID
    -   `updateStaff(id, data)` - updates staff by ID
    -   `deleteStaff(id)` - removes from array (or toggle isActive)
    -   `filterByRole(role)` - returns filtered array
-   Return: `{ staff, addStaff, updateStaff, deleteStaff, filterByRole }`
-   Note: `isActive` is a UI-only field for filtering; not in schema but useful for display

**T360** - Create CreateWaiterForm ⭐ **Points: -0.25**  
**File**: `src/components/staff/CreateWaiterForm.tsx`  
**Requirements**:

-   Form fields:
    -   Name (required, min 3 chars)
    -   Email (required, email validation)
    -   Phone Number (optional)
    -   Password (required, min 8 chars)
    -   Confirm Password (must match)
-   Use react-hook-form + Zod validation
-   Submit button: "Create Waiter Account"
-   On submit: call `addStaff({ ...formData, role: 'WAITER', isActive: true, createdAt: new Date().toISOString() })`
-   Show success toast, close modal, reset form

**T361** - Create CreateKitchenStaffForm ⭐ **Points: -0.25**  
**File**: `src/components/staff/CreateKitchenStaffForm.tsx`  
**Requirements**:

-   Same fields as CreateWaiterForm
-   Submit: `addStaff({ ...formData, role: 'KITCHEN_STAFF', isActive: true, createdAt: new Date().toISOString() })`
-   Can reuse validation schema from T360

**T362** - Create StaffList with edit/deactivate  
**File**: `src/components/staff/StaffList.tsx`  
**Props**: `{ role: 'WAITER' | 'KITCHEN_STAFF' | 'ALL' }`  
**Requirements**:

-   Table with columns: Avatar, Name, Email, Phone, Status, Joined Date, Actions
-   Status badge: Green for isActive=true ("Active"), Gray for isActive=false ("Inactive")
-   Action buttons per row:
    -   Edit (pencil icon) - opens edit modal
    -   Deactivate/Activate toggle (trash/check icon) - toggles isActive field
-   Filter dropdown above table: All, Active, Inactive
-   Joined Date displays createdAt formatted as date
-   Empty state: "No staff members found"

**T363** - Create StaffManagementPage  
**File**: `src/pages/StaffManagementPage.tsx`  
**Requirements**:

-   Page title: "Staff Management"
-   Tabs component: "Waiters" and "Kitchen Staff"
-   Tab 1 (Waiters):
    -   "Add Waiter" button (opens CreateWaiterForm modal)
    -   StaffList with role="WAITER"
-   Tab 2 (Kitchen Staff):
    -   "Add Kitchen Staff" button (opens CreateKitchenStaffForm modal)
    -   StaffList with role="KITCHEN_STAFF"
-   Use Headless UI Tabs component

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

-   Functions: `addCategory`, `updateCategory`, `deleteCategory`, `toggleActive`
-   Return: `{ categories, addCategory, updateCategory, deleteCategory, toggleActive }`
-   Note: `isActive` and `itemCount` are UI-only computed fields for display purposes

**T365** - Create CategoryForm ⭐ **Points: -0.25**  
**File**: `src/components/category/CategoryForm.tsx`  
**Props**: `{ category?: Category, onSubmit: (data) => void, onCancel: () => void }`  
**Requirements**:

-   Form fields:
    -   Name (required, max 50 chars)
    -   Description (optional, max 200 chars)
    -   Display Order (number, default to 0)
    -   Active toggle switch (UI-only field)
-   Edit mode: pre-fill fields if category prop exists
-   On submit: include createdAt and updatedAt timestamps
-   Validation with Zod
-   Buttons: "Save Category" and "Cancel"

**T366** - Create CategoryList with edit/delete  
**File**: `src/components/category/CategoryList.tsx`  
**Requirements**:

-   Grid layout (3 columns on desktop, 1 on mobile)
-   Card per category showing:
    -   Category name (large text)
    -   Description
    -   Item count badge ("8 items")
    -   Active/Inactive badge
-   Hover actions: Edit and Delete buttons
-   Delete confirmation: "Are you sure? This will unassign X menu items."

**T367** - Create CategoryManagementPage  
**File**: `src/pages/CategoryManagementPage.tsx`  
**Requirements**:

-   Page title: "Categories"
-   "Add Category" button (top right) - opens CategoryForm modal
-   CategoryList component
-   Modal for Create/Edit category with CategoryForm

---

## 📋 Coordination Guidelines

### 1. **Start with DashboardLayout**

-   All pages should be wrapped in DashboardLayout using `<Outlet />`

### 2. **Shared Components** (Create in `src/components/common/`)

All members can create and share:

-   `Button.tsx` - Reusable button component
-   `Modal.tsx` - Modal wrapper with Headless UI
-   `Card.tsx` - Card container
-   `Badge.tsx` - Status badge component
-   `Toast.tsx` - Toast notification
-   `Input.tsx`, `Select.tsx`, `Textarea.tsx` - Form inputs

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

-   **Primary Actions**: `bg-naples hover:bg-arylide text-charcoal`
-   **Backgrounds**:
    -   Main: `bg-charcoal text-white`
    -   Cards: `bg-white text-charcoal`
    -   Subtle: `bg-antiflash text-charcoal`
-   **Borders**: `border-antiflash` or `border-arylide`
-   **Status Badges**:
    -   Active/Success: `bg-green-600 text-white`
    -   Warning: `bg-naples text-charcoal`
    -   Inactive/Disabled: `bg-antiflash text-gray-600`
    -   Error/Danger: `bg-red-600 text-white`
-   **Sidebar**: `bg-charcoal text-white border-r border-arylide`
-   **Header**: `bg-white border-b border-antiflash`
-   **Cards**: `bg-white rounded-lg shadow-md p-6 border border-antiflash`
-   **Buttons**:
    -   Primary: `px-4 py-2 bg-naples hover:bg-arylide text-charcoal rounded-md font-medium`
    -   Secondary: `px-4 py-2 bg-white hover:bg-antiflash text-charcoal border border-antiflash rounded-md font-medium`
-   **Focus States**: `focus:ring-2 focus:ring-naples focus:ring-offset-2`
-   **Text**:
    -   Primary: `text-charcoal`
    -   Secondary: `text-gray-600`
    -   On dark: `text-white`
    -   Accent: `text-naples`

### 4. **Mock Data Best Practices**

-   Store mock data in separate files: `src/mocks/mockStaff.ts`, `src/mocks/mockMenuItems.ts`, etc.
-   Use meaningful data (realistic names, prices, dates)
-   Include enough variety (different statuses, categories, etc.)

---

## ✅ Completion Checklist

### Member 1

-   [ ] DashboardLayout works with all navigation
-   [ ] Dashboard shows all summary cards
-   [ ] Can create/edit/delete waiters
-   [ ] Can create/edit/delete kitchen staff
-   [ ] Can create/edit/delete categories
-   [ ] All forms validate correctly

---
