# Multilingual Support Rollout Plan: KDS & Waiter

## 📋 Overview

This document outlines the implementation plan for extending multilingual support to the Kitchen Display System (Chef) and Waiter Dashboard roles. The existing i18n infrastructure in the admin app will be leveraged.

---

## ✅ Current State Analysis

### What's Already Done:
1. **i18n Infrastructure** - Fully configured with `i18next`, `react-i18next`, and language detection
2. **Translation Files** - Exist for `en` and `vi` with 8 namespaces: `common`, `dashboard`, `menu`, `orders`, `kitchen`, `staff`, `tables`, `reports`
3. **LanguageSwitcher Component** - Already in DashboardLayout header
4. **Kitchen namespace** - Has basic translations but not integrated into components

### Current Kitchen Translations (existing but not used):
```json
{
  "title": "Kitchen Display System",
  "orders": {
    "newOrder": "New Order",
    "table": "Table {{number}}",
    "orderTime": "{{time}} ago",
    "items": "{{count}} items"
  },
  "actions": {
    "startCooking": "Start Cooking",
    "markReady": "Mark Ready",
    "recall": "Recall",
    "viewHistory": "View History"
  },
  "filters": {
    "all": "All Orders",
    "pending": "Pending",
    "cooking": "Cooking",
    "ready": "Ready"
  }
}
```

### Missing: Waiter namespace
- No `waiter.json` translation files exist
- WaiterDashboardPage and components have hardcoded strings

---

## 🎯 Implementation Plan

### Phase 1: Create Waiter Translation Namespace

#### Task 1.1: Create `src/locales/en/waiter.json`
**Priority:** High | **Estimated Time:** 30 minutes

```json
{
  "title": "Waiter Dashboard",
  "subtitle": "Manage orders, tables, and billing",
  "tabs": {
    "pending": "Pending Orders",
    "ready": "Ready to Serve",
    "tables": "Tables"
  },
  "orders": {
    "newOrder": "New Order",
    "fromTable": "New order from Table #{{tableNumber}}",
    "orderReady": "Order Ready",
    "tableReady": "Table #{{tableNumber}} order is ready!",
    "orderNumber": "Order #{{number}}",
    "orderItems": "Order Items",
    "note": "Note"
  },
  "pendingOrders": {
    "title": "Pending Orders",
    "empty": "No Pending Orders",
    "emptyDescription": "New orders will appear here automatically"
  },
  "readyOrders": {
    "title": "Ready Orders",
    "empty": "No Ready Orders",
    "emptyDescription": "Orders ready from kitchen will appear here"
  },
  "tables": {
    "available": "Available",
    "occupied": "Occupied",
    "reserved": "Reserved",
    "billRequested": "Bill Requested",
    "tableInfo": "Table {{number}} is {{status}}",
    "noActiveOrder": "Table {{number}} has no active order"
  },
  "actions": {
    "accept": "Accept",
    "acceptAndSend": "Accept & Send to Kitchen",
    "reject": "Reject",
    "markServed": "Mark Served",
    "processPayment": "Process Payment",
    "generateBill": "Generate Bill",
    "refresh": "Refresh"
  },
  "status": {
    "pending": "PENDING",
    "confirmed": "CONFIRMED",
    "preparing": "PREPARING",
    "ready": "READY",
    "served": "SERVED",
    "completed": "COMPLETED",
    "offline": "Offline",
    "processing": "Processing..."
  },
  "payment": {
    "title": "Process Payment",
    "method": "Payment Method",
    "cash": "Cash",
    "card": "Card",
    "amountDue": "Amount Due",
    "amountPaid": "Amount Paid",
    "change": "Change",
    "confirm": "Confirm Payment",
    "cancel": "Cancel"
  },
  "bill": {
    "title": "Bill Details",
    "discount": "Discount",
    "subtotal": "Subtotal",
    "total": "Total",
    "generate": "Generate Bill",
    "print": "Print Bill",
    "markPaid": "Mark as Paid"
  },
  "messages": {
    "orderAccepted": "Order has been sent to the kitchen",
    "orderRejected": "Order has been cancelled",
    "orderServed": "Order has been marked as served",
    "billGenerated": "Navigating to print page...",
    "paymentProcessed": "{{method}} payment processed successfully",
    "billRequested": "Table #{{tableNumber}} requested the bill"
  },
  "errors": {
    "acceptFailed": "Failed to accept order",
    "rejectFailed": "Failed to reject order",
    "servedFailed": "Failed to update order status",
    "billFailed": "Failed to generate bill",
    "paymentFailed": "Failed to process payment",
    "loadOrderFailed": "Failed to load order details"
  }
}
```

#### Task 1.2: Create `src/locales/vi/waiter.json`
**Priority:** High | **Estimated Time:** 30 minutes

```json
{
  "title": "Bảng điều khiển Phục vụ",
  "subtitle": "Quản lý đơn hàng, bàn và thanh toán",
  "tabs": {
    "pending": "Đơn chờ xử lý",
    "ready": "Sẵn sàng phục vụ",
    "tables": "Bàn"
  },
  "orders": {
    "newOrder": "Đơn hàng mới",
    "fromTable": "Đơn hàng mới từ Bàn #{{tableNumber}}",
    "orderReady": "Đơn hàng sẵn sàng",
    "tableReady": "Đơn hàng Bàn #{{tableNumber}} đã sẵn sàng!",
    "orderNumber": "Đơn #{{number}}",
    "orderItems": "Món ăn đặt",
    "note": "Ghi chú"
  },
  "pendingOrders": {
    "title": "Đơn chờ xử lý",
    "empty": "Không có đơn chờ",
    "emptyDescription": "Đơn hàng mới sẽ tự động xuất hiện ở đây"
  },
  "readyOrders": {
    "title": "Đơn sẵn sàng",
    "empty": "Không có đơn sẵn sàng",
    "emptyDescription": "Đơn hàng từ bếp sẽ xuất hiện ở đây"
  },
  "tables": {
    "available": "Trống",
    "occupied": "Có khách",
    "reserved": "Đã đặt trước",
    "billRequested": "Yêu cầu thanh toán",
    "tableInfo": "Bàn {{number}} đang {{status}}",
    "noActiveOrder": "Bàn {{number}} không có đơn hàng"
  },
  "actions": {
    "accept": "Chấp nhận",
    "acceptAndSend": "Chấp nhận & Gửi bếp",
    "reject": "Từ chối",
    "markServed": "Đã phục vụ",
    "processPayment": "Thanh toán",
    "generateBill": "Tạo hóa đơn",
    "refresh": "Làm mới"
  },
  "status": {
    "pending": "CHỜ XỬ LÝ",
    "confirmed": "ĐÃ XÁC NHẬN",
    "preparing": "ĐANG NẤU",
    "ready": "SẴN SÀNG",
    "served": "ĐÃ PHỤC VỤ",
    "completed": "HOÀN THÀNH",
    "offline": "Ngoại tuyến",
    "processing": "Đang xử lý..."
  },
  "payment": {
    "title": "Thanh toán",
    "method": "Phương thức",
    "cash": "Tiền mặt",
    "card": "Thẻ",
    "amountDue": "Số tiền cần trả",
    "amountPaid": "Số tiền đã trả",
    "change": "Tiền thừa",
    "confirm": "Xác nhận thanh toán",
    "cancel": "Hủy"
  },
  "bill": {
    "title": "Chi tiết hóa đơn",
    "discount": "Giảm giá",
    "subtotal": "Tạm tính",
    "total": "Tổng cộng",
    "generate": "Tạo hóa đơn",
    "print": "In hóa đơn",
    "markPaid": "Đánh dấu đã trả"
  },
  "messages": {
    "orderAccepted": "Đơn hàng đã được gửi đến bếp",
    "orderRejected": "Đơn hàng đã bị hủy",
    "orderServed": "Đơn hàng đã được phục vụ",
    "billGenerated": "Đang chuyển đến trang in...",
    "paymentProcessed": "Thanh toán {{method}} thành công",
    "billRequested": "Bàn #{{tableNumber}} yêu cầu thanh toán"
  },
  "errors": {
    "acceptFailed": "Không thể chấp nhận đơn hàng",
    "rejectFailed": "Không thể từ chối đơn hàng",
    "servedFailed": "Không thể cập nhật trạng thái đơn hàng",
    "billFailed": "Không thể tạo hóa đơn",
    "paymentFailed": "Không thể xử lý thanh toán",
    "loadOrderFailed": "Không thể tải chi tiết đơn hàng"
  }
}
```

#### Task 1.3: Update i18n config
**Priority:** High | **Estimated Time:** 5 minutes

Add waiter namespace to `src/i18n/config.ts`.

---

### Phase 2: Extend Kitchen Translation Namespace

#### Task 2.1: Extend `src/locales/en/kitchen.json`
**Priority:** High | **Estimated Time:** 20 minutes

Add missing keys for KitchenOrderCard and KitchenDisplayPage:

```json
{
  "title": "Kitchen Display System",
  "activeOrders": "{{count}} active order",
  "activeOrders_plural": "{{count}} active orders",
  "orders": {
    "newOrder": "New Order",
    "table": "Table #{{number}}",
    "orderNumber": "Order #{{number}}",
    "orderTime": "{{time}} ago",
    "items": "{{count}} items",
    "noItems": "No items in this order",
    "orderNotes": "Order Notes"
  },
  "status": {
    "new": "NEW",
    "cooking": "COOKING",
    "ready": "READY",
    "queued": "Queued",
    "preparing": "Cooking",
    "done": "Ready"
  },
  "actions": {
    "startCooking": "Start Cooking",
    "markReady": "Mark Ready",
    "markOrderReady": "Mark Order Ready",
    "completeAllFirst": "Complete All Items First",
    "recall": "Recall",
    "viewHistory": "View History",
    "refresh": "Refresh",
    "updating": "Updating..."
  },
  "dialogs": {
    "updateStatus": "Update Item Status",
    "confirmChange": "Are you sure you want to update the status for:",
    "cancel": "Cancel",
    "confirm": "Confirm"
  },
  "filters": {
    "all": "All Orders",
    "pending": "Pending",
    "cooking": "Cooking",
    "ready": "Ready"
  },
  "sound": {
    "on": "Sound On",
    "off": "Sound Off",
    "enabled": "Sound enabled",
    "disabled": "Sound disabled"
  },
  "history": {
    "title": "Order History",
    "empty": "No completed orders"
  },
  "empty": {
    "title": "No Active Orders",
    "description": "New orders will appear here automatically"
  },
  "loading": "Loading orders...",
  "offline": "Offline",
  "readyForPickup": "Order Ready for Pickup",
  "messages": {
    "newOrder": "New Order",
    "orderForTable": "Order for Table #{{tableNumber}}",
    "orderReady": "Order marked as ready!",
    "loadFailed": "Failed to load orders",
    "updateFailed": "Failed to update order status",
    "itemUpdateFailed": "Failed to update item status",
    "settings": "Settings"
  },
  "note": "Note"
}
```

#### Task 2.2: Extend `src/locales/vi/kitchen.json`
**Priority:** High | **Estimated Time:** 20 minutes

```json
{
  "title": "Màn hình bếp",
  "activeOrders": "{{count}} đơn hàng đang xử lý",
  "activeOrders_plural": "{{count}} đơn hàng đang xử lý",
  "orders": {
    "newOrder": "Đơn hàng mới",
    "table": "Bàn #{{number}}",
    "orderNumber": "Đơn #{{number}}",
    "orderTime": "{{time}} trước",
    "items": "{{count}} món",
    "noItems": "Không có món trong đơn này",
    "orderNotes": "Ghi chú đơn hàng"
  },
  "status": {
    "new": "MỚI",
    "cooking": "ĐANG NẤU",
    "ready": "SẴN SÀNG",
    "queued": "Đang chờ",
    "preparing": "Đang nấu",
    "done": "Hoàn tất"
  },
  "actions": {
    "startCooking": "Bắt đầu nấu",
    "markReady": "Đánh dấu hoàn thành",
    "markOrderReady": "Hoàn tất đơn hàng",
    "completeAllFirst": "Hoàn thành tất cả món trước",
    "recall": "Gọi lại",
    "viewHistory": "Xem lịch sử",
    "refresh": "Làm mới",
    "updating": "Đang cập nhật..."
  },
  "dialogs": {
    "updateStatus": "Cập nhật trạng thái món",
    "confirmChange": "Bạn có chắc muốn cập nhật trạng thái cho:",
    "cancel": "Hủy",
    "confirm": "Xác nhận"
  },
  "filters": {
    "all": "Tất cả đơn hàng",
    "pending": "Chờ xử lý",
    "cooking": "Đang nấu",
    "ready": "Sẵn sàng"
  },
  "sound": {
    "on": "Bật âm thanh",
    "off": "Tắt âm thanh",
    "enabled": "Đã bật âm thanh",
    "disabled": "Đã tắt âm thanh"
  },
  "history": {
    "title": "Lịch sử đơn hàng",
    "empty": "Chưa có đơn hàng hoàn thành"
  },
  "empty": {
    "title": "Không có đơn hàng",
    "description": "Đơn hàng mới sẽ tự động xuất hiện ở đây"
  },
  "loading": "Đang tải đơn hàng...",
  "offline": "Ngoại tuyến",
  "readyForPickup": "Đơn hàng sẵn sàng giao",
  "messages": {
    "newOrder": "Đơn hàng mới",
    "orderForTable": "Đơn hàng cho Bàn #{{tableNumber}}",
    "orderReady": "Đơn hàng đã sẵn sàng!",
    "loadFailed": "Không thể tải đơn hàng",
    "updateFailed": "Không thể cập nhật trạng thái đơn hàng",
    "itemUpdateFailed": "Không thể cập nhật trạng thái món",
    "settings": "Cài đặt"
  },
  "note": "Ghi chú"
}
```

---

### Phase 3: Integrate Translations into KDS Components

#### Task 3.1: Update `KitchenDisplayPage.tsx`
**Priority:** High | **Estimated Time:** 45 minutes

**Files to modify:**
- `src/pages/KitchenDisplayPage.tsx`

**Changes:**
1. Import `useTranslation` hook
2. Replace all hardcoded strings with `t()` calls
3. Example replacements:
   - `"Kitchen Display System"` → `{t('kitchen:title')}`
   - `"Loading orders..."` → `{t('kitchen:loading')}`
   - `"Offline"` → `{t('kitchen:offline')}`
   - `"No Active Orders"` → `{t('kitchen:empty.title')}`

#### Task 3.2: Update `KitchenOrderCard.tsx`
**Priority:** High | **Estimated Time:** 45 minutes

**Files to modify:**
- `src/components/kitchen/KitchenOrderCard.tsx`

**Changes:**
1. Import `useTranslation` hook
2. Replace strings in:
   - Status badges (NEW, COOKING, READY)
   - Item status badges (Queued, Cooking, Ready)
   - Confirmation dialog text
   - Button labels (Mark Order Ready, etc.)
   - Notes labels

#### Task 3.3: Update `RecallHistoryModal.tsx` (if exists)
**Priority:** Medium | **Estimated Time:** 20 minutes

---

### Phase 4: Integrate Translations into Waiter Components

#### Task 4.1: Update `WaiterDashboardPage.tsx`
**Priority:** High | **Estimated Time:** 45 minutes

**Files to modify:**
- `src/pages/WaiterDashboardPage.tsx`

**Changes:**
1. Import `useTranslation` hook
2. Replace:
   - `"Waiter Dashboard"` → `{t('waiter:title')}`
   - Tab labels → `{t('waiter:tabs.pending')}`, etc.
   - Empty state messages
   - Toast messages

#### Task 4.2: Update `PendingOrderCard.tsx`
**Priority:** High | **Estimated Time:** 30 minutes

**Changes:**
1. Import `useTranslation` hook
2. Replace:
   - Status badge "PENDING" → `{t('waiter:status.pending')}`
   - "Order Items:" → `{t('waiter:orders.orderItems')}`
   - Button labels (Accept, Reject, etc.)

#### Task 4.3: Update `ReadyOrderCard.tsx`
**Priority:** High | **Estimated Time:** 30 minutes

#### Task 4.4: Update `TableGridView.tsx`
**Priority:** High | **Estimated Time:** 30 minutes

#### Task 4.5: Update `BillForm.tsx`
**Priority:** High | **Estimated Time:** 30 minutes

#### Task 4.6: Update `CashPaymentForm.tsx`
**Priority:** High | **Estimated Time:** 30 minutes

---

### Phase 5: Testing & Validation

#### Task 5.1: Language Switching Test
- [ ] Switch language in header
- [ ] Verify all KDS text changes
- [ ] Verify all Waiter dashboard text changes
- [ ] Test persistence after page refresh

#### Task 5.2: Layout Testing
- [ ] Verify no text overflow with Vietnamese (longer text)
- [ ] Test mobile responsiveness with both languages
- [ ] Check button sizes accommodate translated text

#### Task 5.3: Toast Messages Test
- [ ] Verify all toast notifications are translated
- [ ] Test error messages in both languages

---

## 📊 Implementation Summary

| Phase | Component | Priority | Est. Time | Status |
|-------|-----------|----------|-----------|--------|
| 1.1 | Create en/waiter.json | High | 30 min | ⬜ |
| 1.2 | Create vi/waiter.json | High | 30 min | ⬜ |
| 1.3 | Update i18n config | High | 5 min | ⬜ |
| 2.1 | Extend en/kitchen.json | High | 20 min | ⬜ |
| 2.2 | Extend vi/kitchen.json | High | 20 min | ⬜ |
| 3.1 | Update KitchenDisplayPage | High | 45 min | ⬜ |
| 3.2 | Update KitchenOrderCard | High | 45 min | ⬜ |
| 3.3 | Update RecallHistoryModal | Medium | 20 min | ⬜ |
| 4.1 | Update WaiterDashboardPage | High | 45 min | ⬜ |
| 4.2 | Update PendingOrderCard | High | 30 min | ⬜ |
| 4.3 | Update ReadyOrderCard | High | 30 min | ⬜ |
| 4.4 | Update TableGridView | High | 30 min | ⬜ |
| 4.5 | Update BillForm | High | 30 min | ⬜ |
| 4.6 | Update CashPaymentForm | High | 30 min | ⬜ |
| 5 | Testing & Validation | High | 60 min | ⬜ |

**Total Estimated Time:** ~8 hours

---

## 🔧 Quick Start Checklist

Ready to implement? Start with these files in order:

1. ⬜ Create `src/locales/en/waiter.json`
2. ⬜ Create `src/locales/vi/waiter.json`  
3. ⬜ Update `src/i18n/config.ts` to include waiter namespace
4. ⬜ Extend existing `kitchen.json` files
5. ⬜ Update `KitchenDisplayPage.tsx`
6. ⬜ Update `KitchenOrderCard.tsx`
7. ⬜ Update `WaiterDashboardPage.tsx`
8. ⬜ Update each waiter component one by one

---

## 📝 Pattern Reference

### Importing in Components:
```tsx
import { useTranslation } from 'react-i18next';

const MyComponent = () => {
  const { t } = useTranslation(['waiter', 'common']);
  
  return <h1>{t('waiter:title')}</h1>;
};
```

### Toast Messages:
```tsx
// Before
showToast('success', 'Order Accepted', 'Order has been sent to the kitchen');

// After
showToast('success', t('waiter:orders.orderAccepted'), t('waiter:messages.orderAccepted'));
```

### Interpolation:
```tsx
// Before
`Table #${order.table?.tableNumber}`

// After
t('kitchen:orders.table', { number: order.table?.tableNumber })
```

---

*Last Updated: January 2026*
*Branch: multilingual-support-kds*
