# Smart Restaurant Admin - User Guide

> **Version:** 1.0.0  
> **Last Updated:** January 2026  
> **Application:** Smart Restaurant Admin System

---

## 📋 Table of Contents

- [Introduction](#introduction)
- [Getting Started](#getting-started)
  - [Accessing the Application](#accessing-the-application)
  - [Login](#login)
  - [Language Selection](#language-selection)
- [User Roles and Permissions](#user-roles-and-permissions)
- [Admin Dashboard (ADMIN / SUPER_ADMIN)](#admin-dashboard)
  - [Dashboard Overview](#dashboard-overview)
  - [Category Management](#category-management)
  - [Menu Management](#menu-management)
  - [Table Management](#table-management)
  - [Order Management](#order-management)
  - [Staff Management](#staff-management)
  - [Reports & Analytics](#reports--analytics)
  - [Profile Settings](#profile-settings)
- [Waiter Dashboard](#waiter-dashboard)
  - [Pending Orders Tab](#pending-orders-tab)
  - [Table Status Tab](#table-status-tab)
  - [Bill Requests Tab](#bill-requests-tab)
- [Kitchen Display System](#kitchen-display-system)
- [Common Features](#common-features)
  - [Real-Time Updates](#real-time-updates)
  - [Notifications](#notifications)
  - [Logout](#logout)

---

## 🎯 Introduction

**Smart Restaurant Admin** is a comprehensive web-based restaurant management system designed for restaurant administrators and staff. The application allows you to manage:

- **Tables** – Create, edit, and track table status with QR code generation
- **Menu Items** – Full menu management with categories, images, and modifiers
- **Orders** – Real-time order tracking and status management
- **Staff** – Manage waiter and kitchen staff accounts
- **Reports** – View sales analytics and performance metrics

The system supports multiple user roles with different access levels to ensure each staff member sees only the features relevant to their role.

---

## 🚀 Getting Started

### Accessing the Application

Open your web browser and navigate to the application URL (typically `http://localhost:5173` for local development).

### Login

1. When you access the application, you will see the **Login Page**
2. Enter your **Email** and **Password**
3. Click the **Sign In** button
4. Upon successful login, you will be redirected based on your role:
   - **ADMIN / SUPER_ADMIN** → Admin Dashboard
   - **WAITER** → Waiter Dashboard
   - **KITCHEN_STAFF** → Kitchen Display System

> **Note:** If your credentials are incorrect, an error message will be displayed. Contact your administrator if you need account assistance.

### Language Selection

The application supports multiple languages:

1. On the **Login Page**, click the **globe icon** in the top right corner
2. Select your preferred language from the dropdown:
   - 🇺🇸 **English**
   - 🇻🇳 **Tiếng Việt**
3. The language preference is saved and applied throughout the application
4. You can change languages anytime using the **Language Switcher** in the header

---

## 👥 User Roles and Permissions

| Role | Access Level | Features |
|------|--------------|----------|
| **SUPER_ADMIN** | Full access | All features including staff management |
| **ADMIN** | Full access | All features including staff management |
| **WAITER** | Limited access | Waiter Dashboard, Order viewing |
| **KITCHEN_STAFF** | Limited access | Kitchen Display System only |

---

## 📊 Admin Dashboard

### Dashboard Overview

The **Dashboard** is your main hub for monitoring restaurant operations. It provides:

#### Key Metrics Cards
- **Total Revenue** – Today's earned revenue
- **Total Orders** – Number of orders processed today
- **Active Tables** – Tables currently occupied
- **Active Staff** – Staff members currently on duty

#### Recent Orders
A list of your most recent orders with:
- Order number and table
- Order status (color-coded)
- Time since order was placed
- Quick view button

#### Quick Actions
- **Add Menu Item** – Quickly add a new item to your menu
- **Manage Tables** – Jump to table management
- **View All Orders** – See the complete order list

---

### Category Management

Navigate to **Categories** in the sidebar to manage menu categories.

#### Viewing Categories
- Categories are displayed in a list with name, description, and display order
- Use the **sort toggle** to change between ascending/descending order

#### Adding a Category
1. Click the **Add Category** button
2. Fill in the form:
   - **Name** (required) – Category name (e.g., "Appetizers", "Main Courses")
   - **Description** (optional) – Brief description of the category
   - **Display Order** (required) – Numeric order for menu display
3. Click **Save** to create the category

#### Editing a Category
1. Click the **Edit** button on a category card
2. Modify the fields as needed
3. Click **Save** to update

#### Deleting a Category
1. Click the **Delete** button on a category card
2. Confirm deletion in the dialog
3. The category will be removed

> **Warning:** Deleting a category with associated menu items may affect those items.

---

### Menu Management

Navigate to **Menu** in the sidebar to manage menu items.

#### Menu Item List
- **Search** – Type in the search box to filter items by name
- **Filter by Category** – Select a category from the dropdown
- **Sort** – Choose sort criteria (name, price, creation date, popularity)
- **Sort Order** – Toggle ascending/descending

#### Adding a Menu Item
1. Click **Add Menu Item** button
2. Complete the form:
   - **Name** (required) – Item name
   - **Description** (optional) – Item description
   - **Category** (required) – Select from existing categories
   - **Price** (required) – Item price
   - **Preparation Time** (optional) – Estimated prep time in minutes
   - **Chef's Recommendation** – Toggle if this is a recommended item
   - **Available** – Toggle item availability
   - **Images** – Upload up to 5 photos (drag & drop or click to select)
   
3. **Modifier Groups** (optional) – Add customization options:
   - Click **Add Modifier Group**
   - Enter group name (e.g., "Size", "Toppings")
   - Add modifiers with names and prices
   - Set selection rules (required, min/max selections)

4. Click **Save** to create the menu item

#### Editing a Menu Item
1. Click the **Edit** button on a menu item card
2. Modify any fields
3. Add or remove images (max 5)
4. Update modifier groups as needed
5. Click **Save** to update

#### Toggling Availability
- Click the **Availability toggle** to quickly mark items as available or sold out
- This affects what customers see when ordering

#### Deleting a Menu Item
1. Click the **Delete** button
2. Confirm deletion in the dialog
3. The item will be permanently removed

---

### Table Management

Navigate to **Tables** in the sidebar to manage restaurant tables.

#### Table List View
Tables are displayed as cards showing:
- **Table Number**
- **Capacity** (number of seats)
- **Location** (e.g., "Main Hall", "Patio")
- **Status Badge** (Available, Occupied, Reserved)
- **QR Code Preview**

#### Filtering Tables
- **Search** – Filter by table number
- **Status Filter** – Show only Available, Occupied, or Reserved tables
- **Location Filter** – Filter by table location
- **Sort** – Sort by table number or capacity

#### Adding a Table
1. Click **Add Table** button
2. Fill in:
   - **Table Number** (required) – Unique identifier
   - **Capacity** (required) – Number of seats
   - **Location** (optional) – Where the table is located
   - **Status** – Initial status (Available, Occupied, Reserved)
3. Click **Save**
4. A QR code is automatically generated for the table

#### Editing a Table
1. Click the **Edit** button on a table card
2. Modify fields as needed
3. Click **Save**

#### QR Code Operations

**View QR Code:**
- Click the **QR Code icon** on a table card to view a larger preview

**Download QR Code:**
1. Click the **Download** button on a table card
2. Choose format:
   - **PNG** – Image file for digital display
   - **PDF** – Print-ready document with table information

**Regenerate QR Code:**
1. Click **Regenerate QR** option
2. Confirm the action
3. A new QR code is generated (invalidates the old one)

**Batch Download:**
1. Select multiple tables using checkboxes
2. Click **Download Selected**
3. Choose format (PNG/PDF)
4. All selected QR codes will be downloaded as a ZIP file

#### Deleting a Table
1. Click the **Delete** button
2. Confirm deletion
3. The table and its QR code are removed

---

### Order Management

Navigate to **Orders** in the sidebar to view and manage orders.

#### Order Statistics
The top of the page shows summary cards:
- **Total Orders** – All orders in the system
- **Pending Orders** – Awaiting confirmation
- **In Progress** – Currently being prepared
- **Completed Today** – Successfully completed orders

#### Order List
- Orders are displayed in a paginated list
- **Status Filter** – Filter by order status
- **Date Filter** – Filter by date range
- **Page Size** – Choose how many orders to display per page

#### Order Statuses
| Status | Description |
|--------|-------------|
| `PENDING` | Order placed, awaiting confirmation |
| `CONFIRMED` | Order confirmed by waiter |
| `PREPARING` | Kitchen is preparing the order |
| `READY` | Order ready to be served |
| `SERVED` | Order delivered to the table |
| `COMPLETED` | Payment received, order closed |
| `CANCELLED` | Order was cancelled |

#### Viewing Order Details
1. Click on any order in the list
2. A modal opens showing:
   - Order number and table
   - Customer information
   - All items with quantities and prices
   - Special instructions
   - Order timeline
   - Current status

#### Updating Order Status
1. Open an order's details
2. Click the **Update Status** button
3. Select the new status from the dropdown
4. Confirm the change

---

### Staff Management

Navigate to **Staff** in the sidebar to manage staff accounts.

#### Staff Tabs
The page is organized into two tabs:
- **Waiters** – Manage waiter accounts
- **Kitchen Staff** – Manage kitchen staff accounts

#### Staff List
Each staff member shows:
- **Name** and **Email**
- **Phone Number**
- **Role Badge**
- **Status** (Active/Inactive)
- **Last Login** time

#### Adding a Staff Member

**Adding a Waiter:**
1. Click **Add Waiter** button
2. Fill in:
   - **Full Name** (required)
   - **Email** (required) – Must be unique
   - **Password** (required) – Initial password
   - **Phone Number** (optional)
3. Click **Save**

**Adding Kitchen Staff:**
1. Click **Add Kitchen Staff** button
2. Complete the same form
3. Click **Save**

> **Note:** Staff members use their email and password to log into their respective dashboards.

#### Editing Staff
1. Click the **Edit** button on a staff card
2. Modify information as needed
3. Click **Save**

#### Activating/Deactivating Staff
1. Click the **Toggle Active** button
2. Confirm the action
3. Inactive staff cannot log in to the system

---

### Reports & Analytics

Navigate to **Reports** in the sidebar to view business analytics.

#### Date Range Selection
- Use the **date picker** to select a custom date range
- Quick options: Today, Last 7 Days, Last 30 Days

#### Key Metrics
Summary cards display:
- **Total Revenue** – Sum of all completed orders
- **Total Orders** – Number of orders in the period
- **Average Order Value** – Revenue divided by order count
- **Top Selling Items** – Most ordered items

#### Charts and Visualizations

**Revenue Chart:**
- Line graph showing revenue trends over time
- Hover over data points for exact values

**Order Analytics:**
- Bar chart showing order distribution by status
- Pie chart breaking down orders by category

**Top Items Report:**
- Table listing best-selling menu items
- Columns: Item name, quantity sold, revenue generated

#### Export Options
- **Export PDF** – Download a PDF report
- **Print** – Print the current report view

---

### Profile Settings

Access your profile by clicking your **profile picture** in the header and selecting **Profile**.

#### Viewing Profile
Your profile displays:
- **Avatar** – Profile picture
- **Full Name**
- **Email** (read-only)
- **Phone Number**
- **Role**

#### Updating Profile
1. Click **Edit** to enable editing
2. Modify:
   - **Full Name**
   - **Phone Number**
3. Click **Save Changes**

#### Changing Avatar
1. Click on your **profile picture**
2. Select an image file from your computer
3. The image is uploaded and saved automatically
4. Supported formats: JPG, PNG, WEBP (max 5MB)

#### Navigation
- Click the **Back** button to return to the dashboard

---

## 🍽️ Waiter Dashboard

The **Waiter Dashboard** is the primary interface for waiters to manage orders and tables.

### Header
- **Clock** – Current time and date
- **WiFi Status** – Shows real-time connection status (green = connected, red = disconnected)
- **Language Switcher** – Change display language
- **Profile Dropdown** – Access profile or logout

### Pending Orders Tab

This tab shows orders awaiting waiter action.

#### Order Cards
Each pending order displays:
- **Order Number** and **Table Number**
- **Customer Name** (if provided)
- **Time** since order was placed
- **Order Items** with quantities
- **Total Amount**

#### Actions on Pending Orders

**Accept Order:**
1. Review the order details
2. Click the **Accept** button
3. The order status changes to `CONFIRMED`
4. The order is sent to the Kitchen Display

**Reject Order:**
1. Click the **Reject** button
2. Confirm the cancellation
3. The order status changes to `CANCELLED`

### Table Status Tab

View all tables and their current status.

#### Table Grid
Tables are displayed as cards with:
- **Table Number**
- **Capacity**
- **Status Badge** (color-coded):
  - 🟢 **Available** – Ready for new customers
  - 🟡 **Occupied** – Customers are seated
  - 🔴 **Bill Requested** – Customer waiting for bill
  - 🟣 **Reserved** – Table is reserved

#### Table Actions

**Viewing Table Orders:**
1. Click on an **Occupied** or **Bill Requested** table
2. A bill form opens showing:
   - Current order details
   - All items and prices
   - Total amount

**Processing Bill:**
1. Click on a table with `Bill Requested` status
2. Review the order
3. Click **Generate Bill**
4. Choose payment method:
   - **Cash** – Enter amount paid, calculate change
   - **Card** – Confirm card payment
5. Click **Complete Payment**
6. Table status changes to `Available`

### Bill Requests Tab

Shows all tables where customers have requested their bill.

#### Bill Request Cards
Each card shows:
- **Table Number**
- **Order Number**
- **Total Amount**
- **Time** since bill was requested

#### Processing Bill Requests
1. Click on a bill request card
2. The bill form opens
3. Process payment as described above

---

## 👨‍🍳 Kitchen Display System

The **Kitchen Display System (KDS)** is designed for kitchen staff to view and manage incoming orders.

### Header
- **Application Title** – "Smart Restaurant"
- **Clock** – Current time
- **WiFi Status** – Real-time connection indicator
- **Sound Toggle** – Enable/disable notification sounds
- **Refresh** – Manually refresh order list
- **Profile Dropdown** – Access profile or logout

### Order Grid

Orders are displayed as cards in a grid layout:
- **Order Number**
- **Table Number**
- **Time** – How long ago the order was placed
- **Items List** – All items to prepare

### Item Statuses
Each item shows a status badge:
| Status | Description |
|--------|-------------|
| `PENDING` | Not started |
| `PREPARING` | Currently being prepared |
| `READY` | Item is ready |

### Kitchen Actions

#### Updating Item Status
1. Click on an **item status badge**
2. Select the new status:
   - `PREPARING` – Start preparing
   - `READY` – Item is done
3. The item status updates in real-time

#### Marking Order Ready
1. When all items in an order are ready
2. Click the **Mark Ready** button
3. The entire order status changes to `READY`
4. Waiters are notified automatically

### Sound Notifications
- **New Order** – Plays a notification sound when a new order arrives
- **Sound Toggle** – Click the speaker icon to enable/disable sounds

### Real-Time Updates
- Orders appear automatically when waiters confirm them
- No manual refresh needed
- WiFi indicator shows connection status

---

## 🔔 Common Features

### Real-Time Updates

The application uses **WebSocket technology** for instant updates:
- **New orders** appear without refreshing
- **Status changes** are reflected immediately
- **Bill requests** trigger notifications

The **WiFi indicator** in the header shows connection status:
- 🟢 **Connected** – Real-time updates active
- 🔴 **Disconnected** – Attempting to reconnect

### Notifications

The system provides visual and audio notifications:
- **Toast notifications** – Pop-up messages for actions (success, error, warning)
- **Sound alerts** – Audio feedback for new orders (Kitchen/Waiter)
- **Badge indicators** – Counts on tabs for pending items

### Logout

To log out of the application:
1. Click your **profile picture** in the header
2. Click **Logout** from the dropdown menu
3. You will be redirected to the Login page

---

## 📱 Mobile Responsiveness

The application is designed to work on various screen sizes:
- **Desktop** – Full sidebar navigation, all features accessible
- **Tablet** – Collapsible sidebar, optimized layouts
- **Mobile** – Hamburger menu, touch-friendly buttons

### Mobile Navigation
1. Tap the **hamburger menu icon** (☰) on mobile
2. The sidebar slides in from the left
3. Tap any navigation item to go to that page
4. Tap outside the sidebar or the X icon to close

---

## 🆘 Getting Help

If you encounter issues:
1. Check your **internet connection** (WiFi indicator)
2. Try **refreshing** the page
3. **Clear browser cache** if data seems outdated
4. Contact your **system administrator** for account issues

---

*© 2026 Smart Restaurant Admin. Developed as part of HCMUS Web Application Development Course.*
