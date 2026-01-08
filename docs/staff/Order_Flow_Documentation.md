# Order Flow & Status Management

## 📋 Overview

This document describes the complete order lifecycle in the Smart Restaurant system, detailing how orders flow through different statuses and which roles are responsible for each transition.

---

## 🔄 Complete Order Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         ORDER LIFECYCLE                              │
└─────────────────────────────────────────────────────────────────────┘

    CUSTOMER                WAITER              KITCHEN              WAITER
       │                       │                    │                   │
       │  1. Place Order       │                    │                   │
       │  (NO PAYMENT YET!)    │                    │                   │
       │──────────────────────>│                    │                   │
       │                       │                    │                   │
       │   [PENDING]           │                    │                   │
       │   paymentStatus:      │                    │                   │
       │   UNPAID              │                    │                   │
       │                       │                    │                   │
       │                       │ 2. Accept Order    │                   │
       │                       │───────────────────>│                   │
       │                       │                    │                   │
       │                       │  [CONFIRMED]       │                   │
       │                       │  (Sent to kitchen) │                   │
       │                       │                    │                   │
       │                       │                    │ 3. Start Cooking  │
       │                       │                    │                   │
       │                       │                    │  [PREPARING]      │
       │                       │                    │  Items:           │
       │                       │                    │  QUEUED ──>       │
       │                       │                    │  COOKING ──>      │
       │                       │                    │  READY            │
       │                       │                    │                   │
       │                       │ 4. Order Complete  │                   │
       │                       │<───────────────────│                   │
       │                       │                    │                   │
       │                       │    [READY]         │                   │
       │                       │    (Ready to serve)│                   │
       │                       │                    │                   │
       │                       │ 5. Deliver Food    │                   │
       │<──────────────────────│                    │                   │
       │                       │                    │                   │
       │  [SERVED]             │                    │                   │
       │  (Food delivered)     │                    │                   │
       │  paymentStatus:       │                    │                   │
       │  UNPAID               │                    │                   │
       │                       │                    │                   │
       │  6. Request Bill      │                    │                   │
       │──────────────────────>│                    │                   │
       │                       │                    │                   │
       │  [SERVED]             │                    │                   │
       │  billRequested: true  │                    │                   │
       │                       │                    │                   │
       │  7. Choose Payment    │                    │                   │
       │     Method:           │                    │                   │
       │  ┌─────────────────┐  │                    │                   │
       │  │ • Online (Card) │  │                    │                   │
       │  │ • Restaurant    │  │                    │                   │
       │  └─────────────────┘  │                    │                   │
       │                       │                    │                   │
       │  8a. Pay Online       │                    │                   │
       │  ────> Stripe ────>   │                    │                   │
       │     OR                │                    │                   │
       │  8b. Pay Cash/Card ──>│ Process Payment    │                   │
       │                       │                    │                   │
       │    [PAID]             │                    │                   │
       │    (Order complete)   │                    │                   │
       │    Table: AVAILABLE   │                    │                   │
       └───────────────────────┴────────────────────┴───────────────────┘
```

---

## 📊 Order Status Reference

### Main Order Statuses

| Status | Description | Who Sets It | Next Status | UI Location |
|--------|-------------|-------------|-------------|-------------|
| **PENDING** | New order awaiting waiter approval | Customer App | CONFIRMED or CANCELLED | Waiter: Pending Orders Tab |
| **CONFIRMED** | Order accepted and sent to kitchen | Waiter | PREPARING | Kitchen: Active Orders |
| **PREPARING** | Kitchen is cooking the order | Kitchen | READY | Kitchen: Active Orders |
| **READY** | All items complete, ready to serve | Kitchen | SERVED | Waiter: Ready to Serve Tab |
| **SERVED** | Food delivered to customer | Waiter | PAID | Waiter: Tables Tab |
| **PAID** | Payment completed | Waiter/Customer | - | Admin: Order History |
| **CANCELLED** | Order cancelled | Waiter | - | Admin: Order History |

### Item-Level Statuses

Order items track their own status during the preparation phase:

| Item Status | Description | Visual Indicator |
|-------------|-------------|------------------|
| **QUEUED** | Waiting to be cooked | Gray badge, Clock icon |
| **COOKING** | Currently being prepared | Yellow/Orange badge, ChefHat icon, Pulsing animation |
| **READY** | Item is complete | Green badge, CheckCircle icon |

---

## 👥 Role-Based Actions

### 🍽️ Customer Actions

**Customer App - New "Order First, Pay Later" Flow:**

#### Placing an Order (No Payment Required!)
- ✅ **Browse Menu** → View available dishes and add to cart
- ✅ **Place Order** → Creates order with `paymentStatus: UNPAID`
  - No payment required at this step
  - Order sent to waiter for approval
  - Customer redirected to Order Detail page
  
#### During the Meal
- ✅ **View order status** in real-time (PENDING → CONFIRMED → PREPARING → READY → SERVED)
- ✅ **Track individual items** (QUEUED → COOKING → READY)
- ✅ **Add more items** to existing order (if order not yet paid)

#### Requesting the Bill
- ✅ **Request Bill** → Available when order status is READY or SERVED
  - Sets `billRequested: true`
  - Notifies waiter
  - Shows payment method selection

#### Payment Options (After Bill Request)
- ✅ **Option 1: Pay Online Now**
  - Click "Pay Online Now" button
  - Redirected to Stripe checkout
  - Complete payment with credit/debit card
  - Order status → PAID
  
- ✅ **Option 2: Pay at Restaurant**  
  - Display: "Pay with Cash/Card at restaurant"
  - Waiter processes payment manually
  - Waiter marks order as PAID
  - Table becomes AVAILABLE

#### Other Actions  
- ✅ **Cancel order** if status is PENDING (before waiter accepts)
- ✅ **View order history** (authenticated users only)

### 👔 Waiter Actions

**Waiter Dashboard:**

#### Tab 1: Pending Orders
- ✅ **Accept Order** → Changes status from PENDING to CONFIRMED
  - Sends order to kitchen
  - Table status becomes OCCUPIED
  - Notification sent to kitchen
- ✅ **Reject Order** → Changes status to CANCELLED
  - Order removed from pending list
  - Customer notified

#### Tab 2: Ready to Serve
- ✅ **Mark as Served** → Changes status from READY to SERVED
  - Indicates food delivered to table
  - Order removed from ready list
  - Customer can now request bill

#### Tab 3: Tables
- ✅ View all table statuses (AVAILABLE, OCCUPIED, RESERVED, BILL_REQUESTED)
- ✅ Click occupied/bill-requested tables to open BillForm
- ✅ **Generate Bill** → Creates bill with optional discount
- ✅ **Mark as Paid** → Changes status to PAID
  - Table becomes AVAILABLE
  - Order completed

### 👨‍🍳 Kitchen Actions

**Kitchen Display System:**

- ✅ View all CONFIRMED and PREPARING orders
- ✅ **Update Item Status** → Cycle through QUEUED → COOKING → READY
  - Individual items tracked independently
  - Confirmation dialog prevents accidents
  - One-way progression (no going back from READY)
- ✅ **Mark Order Ready** → When all items are READY
  - Changes order from PREPARING to READY
  - Notification sent to waiter
  - Order appears in Waiter's "Ready to Serve" tab

---

## 🔔 Real-Time Notifications

### Socket Events

| Event | Trigger | Recipients | Action |
|-------|---------|------------|--------|
| **order:created** | Customer creates order | Waiter | New order appears in Pending Orders |
| **order:confirmed** | Waiter accepts order | Kitchen | Order appears in Kitchen Display |
| **order:updated** | Kitchen updates item status | All | Order status updated in real-time |
| **order:ready** | Kitchen marks order ready | Waiter | Order appears in Ready to Serve tab |
| **bill:requested** | Customer requests bill | Waiter | Notification + table status updates |

### Sound Notifications

- 🔔 **New Order** → Double beep (Waiter & Kitchen)
- 🔔 **Order Ready** → Single beep (Waiter)
- ⚠️ **Bill Requested** → Warning tone (Waiter)

---

## 🎨 Visual Status Indicators

### Color Coding System

**Order Status Colors:**
- 🟡 **PENDING** → Yellow (awaiting attention)
- 🔵 **CONFIRMED** → Blue (in progress)
- 🟠 **PREPARING** → Orange/Gradient (cooking)
- 🟢 **READY** → Green (complete, pulsing)
- ⚪ **SERVED** → Gray (delivered)
- 🟣 **PAID** → Purple (completed)
- 🔴 **CANCELLED** → Red (cancelled)

**Item Status Colors:**
- ⚪ **QUEUED** → Gray
- 🟡 **COOKING** → Yellow/Orange with pulsing dots
- 🟢 **READY** → Green with checkmark

**Table Status Colors:**
- 🟢 **AVAILABLE** → Green gradient
- 🔴 **OCCUPIED** → Red gradient
- 🟡 **RESERVED** → Yellow gradient
- 🔵 **BILL_REQUESTED** → Blue gradient with pulsing receipt icon

---

## 📱 User Interfaces Overview

### Customer App
```
┌─────────────────────────────┐
│  Current Order              │
├─────────────────────────────┤
│  Status: SERVED             │
│  Table: #5                  │
│  Payment: UNPAID            │
│                             │
│  Items:                     │
│  • Burger      [READY] ✓    │
│  • Fries       [READY] ✓    │
│  • Soda        [READY] ✓    │
│                             │
│  Total: $25.50              │
│                             │
│  ┌───────────────────────┐  │
│  │ ✓ Bill Requested      │  │
│  └───────────────────────┘  │
│                             │
│  Choose Payment Method:     │
│  ┌───────────────────────┐  │
│  │ 💳 Pay Online Now     │  │
│  │  Credit/Debit Card    │  │
│  └───────────────────────┘  │
│                             │
│  ┌───────────────────────┐  │
│  │ 💵 Pay at Restaurant  │  │
│  │  Cash/Card w/ Waiter  │  │
│  └───────────────────────┘  │
│                             │
│  [Add More Items]           │
└─────────────────────────────┘
```

### Waiter Dashboard
```
┌──────────────────────────────────────────┐
│ [Pending (2)] [Ready (3)] [Tables]       │
├──────────────────────────────────────────┤
│  Ready to Serve:                         │
│                                          │
│  ┌──────────────────────────┐           │
│  │ Table #5 | Order #123     │           │
│  │ 🟢 READY TO SERVE         │           │
│  │ Guest: John Doe           │           │
│  │ Time: 15 min              │           │
│  │                           │           │
│  │ [Mark as Served]          │           │
│  └──────────────────────────┘           │
└──────────────────────────────────────────┘
```

### Kitchen Display System
```
┌──────────────────────────────────────────┐
│ Kitchen Display System | 3 Active Orders │
├──────────────────────────────────────────┤
│  ┌───────────────────────────┐          │
│  │ Table #5 🔵 COOKING        │          │
│  │ Order #123 | ⏱️ 12 min     │          │
│  │                            │          │
│  │ 1x Burger    [🟡 COOKING]  │          │
│  │ 1x Fries     [🟢 READY]    │          │
│  │ 1x Soda      [⚪ QUEUED]   │          │
│  │                            │          │
│  │ [⏳ Complete All Items]    │          │
│  └───────────────────────────┘          │
└──────────────────────────────────────────┘
```

---

## ⚠️ Important Business Rules

### 1. Status Transitions
- ✅ Orders can only progress forward through statuses
- ✅ PAID and CANCELLED are terminal states
- ✅ Item statuses follow one-way progression (QUEUED → COOKING → READY)
- ✅ Order can only be marked READY when all items are READY

### 2. Role Permissions
- ❌ Waiters **cannot** modify kitchen statuses (PREPARING, item statuses)
- ❌ Kitchen **cannot** mark orders as SERVED or PAID
- ❌ Customers **cannot** change order status (except cancel if PENDING)

### 3. Table Management
- ✅ Table becomes OCCUPIED when order is CONFIRMED
- ✅ Table becomes AVAILABLE after bill is PAID
- ✅ Multiple orders per table not allowed (one active order at a time)

### 4. Item Status Rules
- ✅ Items start as QUEUED when order is CONFIRMED
- ✅ Kitchen staff must confirm status changes
- ✅ Once READY, items cannot go back to COOKING
- ✅ All items must be READY before order can be marked READY

---

## � Payment Flow & Methods

### Payment Status Lifecycle

Orders track payment separately from order status:

| Payment Status | Description | When It's Set |
|---------------|-------------|---------------|
| **UNPAID** | No payment made yet (default) | Order creation |
| **PENDING** | Payment in progress (Stripe) | Payment intent created |
| **PAID** | Payment completed successfully | Payment confirmed |
| **FAILED** | Payment attempt failed | Payment error |

### The New "Order First, Pay Later" System

**Key Principle:** Customers can order and enjoy their meal before any payment is required!

#### Flow Overview:
1. **Order Placement** → `paymentStatus: UNPAID`
   - Customer places order from cart
   - NO payment gateway at this step
   - Order immediately sent to kitchen

2. **Meal Service** → `paymentStatus: UNPAID` (unchanged)
   - Food is prepared and served
   - Customer enjoys their meal
   - Payment not blocking the experience

3. **Bill Request** → `billRequested: true`
   - Customer clicks "Request Bill"
   - Waiter notification sent
   - Payment options displayed

4. **Payment** → `paymentStatus: PAID`
   - Customer chooses payment method
   - Payment processed
   - Order completed

### Payment Methods

#### Method 1: Online Payment (Stripe)
- **When:** After bill is requested
- **How:**
  1. Customer clicks "Pay Online Now"
  2. Redirected to Stripe checkout
  3. Enters card details
  4. Payment processed
  5. Auto-updates to `paymentStatus: PAID`
- **Benefits:**
  - Contactless payment
  - Customer can leave immediately
  - Auto-receipt via email

#### Method 2: Restaurant Payment  
- **When:** After bill is requested
- **How:**
  1. Customer selects "Pay at Restaurant"
  2. Waiter brings payment terminal/cash
  3. Waiter manually marks as PAID
- **Options:**
  - Cash payment
  - Card with physical terminal
  - Mobile payment (future)
- **Benefits:**
  - Traditional experience
  - Split bills easier
  - Tips handled in person

### Business Rules

1. **Order Creation**
   - ✅ Orders created WITHOUT payment
   - ✅ Default `paymentStatus: UNPAID`
   - ✅ No Stripe integration until bill requested

2. **Bill Request**
   - ✅ Only available when order is READY or SERVED
   - ✅ Can only be requested once
   - ✅ Cannot be cancelled once requested

3. **Payment Options**
   - ✅ Both methods always available
   - ✅ Customer decides after seeing bill
   - ✅ No forced payment method

4. **Table Management**
   - ✅ Table stays OCCUPIED until payment completed
   - ✅ `billRequested: true` updates table status
   - ✅ Table becomes AVAILABLE only after PAID

---

## �🔍 Error Handling & Edge Cases

### Rejected Orders
- Waiter can reject PENDING orders with optional reason
- Order status → CANCELLED
- Customer receives notification
- Table remains AVAILABLE

### Payment Failures
- If payment fails, order remains as SERVED
- Customer can retry payment
- Waiter can apply discount and retry

### Lost Connection
- ⚠️ Offline indicator shown to users
- Orders cached locally when connection restored
- Real-time updates resume automatically

### Time-Based Alerts
- 🔴 Orders exceeding expected prep time show warning
- Animated alert indicators on overdue orders
- Visible on both Kitchen Display and Admin panels

---

## 📈 Metrics & Analytics

**Tracked Metrics:**
- Average order preparation time
- Order status distribution
- Peak ordering times
- Table turnover rate
- Payment method distribution
- Cancellation rate and reasons

---

## 🔄 Future Enhancements

Potential improvements to the order flow:

1. **Partial Serving**: Ability to mark individual items as served
2. **Rush Orders**: Priority flag for urgent orders
3. **Kitchen Stations**: Assign items to specific kitchen stations
4. **Estimated Time**: Auto-calculated prep time based on items
5. **Order Modifications**: Allow changes after CONFIRMED (with kitchen approval)
6. **Split Bills**: Support for splitting payments across multiple payers
7. **Tips**: Optional tip amount during payment

---

**Last Updated:** January 8, 2026  
**Version:** 2.0  
**Status:** ✅ Production Ready

### Changelog

**Version 2.0 (January 8, 2026)**
- 🆕 **New Payment Flow**: "Order First, Pay Later" system implemented
- 💳 **Dual Payment Methods**: Online (Stripe) + Restaurant payment options
- 📱 **Enhanced Customer Experience**: No upfront payment required
- ✅ **Payment Status Tracking**: Separate payment and order status management
- 🔔 **Bill Request System**: Waiter notification when customer requests bill
- 🎨 **UI Updates**: Payment method selection cards in OrderDetailPage

**Version 1.0 (Initial Release)**
- Complete order lifecycle management
- Real-time status updates
- Kitchen display system
- Waiter dashboard

