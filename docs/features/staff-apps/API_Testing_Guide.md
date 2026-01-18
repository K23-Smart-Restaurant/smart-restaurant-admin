# Staff API Quick Test Guide

## Prerequisites

1. **Start the server:**
   ```bash
   cd server
   npm run dev
   ```

2. **Get authentication tokens:**
   - Login as KITCHEN_STAFF user
   - Login as WAITER user
   - Save the JWT tokens for API calls

---

## Kitchen API Testing

### 1. Get Active Orders
```bash
curl -X GET http://localhost:4000/api/kitchen/orders \
  -H "Authorization: Bearer YOUR_KITCHEN_STAFF_TOKEN" \
  -H "Content-Type: application/json"
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "orderNumber": 1,
      "status": "CONFIRMED",
      "table": {
        "tableNumber": 5,
        "location": "Main Floor"
      },
      "guestName": "John Doe",
      "orderItems": [...],
      "elapsedMinutes": 12,
      "urgency": "normal"
    }
  ],
  "count": 3
}
```

### 2. Update Order to PREPARING
```bash
curl -X PATCH http://localhost:4000/api/kitchen/orders/ORDER_ID/status \
  -H "Authorization: Bearer YOUR_KITCHEN_STAFF_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "PREPARING"}'
```

### 3. Update Order to READY
```bash
curl -X PATCH http://localhost:4000/api/kitchen/orders/ORDER_ID/status \
  -H "Authorization: Bearer YOUR_KITCHEN_STAFF_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "READY"}'
```

### 4. Update Individual Item Status
```bash
curl -X PATCH http://localhost:4000/api/kitchen/orders/ORDER_ID/items/ITEM_ID/status \
  -H "Authorization: Bearer YOUR_KITCHEN_STAFF_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"itemStatus": "COOKING"}'
```

### 5. Get Order History
```bash
curl -X GET http://localhost:4000/api/kitchen/orders/history \
  -H "Authorization: Bearer YOUR_KITCHEN_STAFF_TOKEN" \
  -H "Content-Type: application/json"
```

---

## Waiter API Testing

### 1. Get Pending Orders
```bash
curl -X GET http://localhost:4000/api/waiter/orders/pending \
  -H "Authorization: Bearer YOUR_WAITER_TOKEN" \
  -H "Content-Type: application/json"
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "orderNumber": 5,
      "status": "PENDING",
      "table": {
        "tableNumber": 3,
        "location": "Patio"
      },
      "guestName": "Jane Smith",
      "totalAmount": 125.50,
      "orderItems": [...]
    }
  ],
  "count": 2
}
```

### 2. Accept Order
```bash
curl -X POST http://localhost:4000/api/waiter/orders/ORDER_ID/accept \
  -H "Authorization: Bearer YOUR_WAITER_TOKEN" \
  -H "Content-Type: application/json"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Order accepted and sent to kitchen",
  "data": {
    "id": "uuid",
    "status": "CONFIRMED",
    "waiterId": "waiter-uuid",
    "waiter": {
      "name": "John Waiter"
    }
  }
}
```

### 3. Reject Order
```bash
curl -X POST http://localhost:4000/api/waiter/orders/ORDER_ID/reject \
  -H "Authorization: Bearer YOUR_WAITER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"reason": "Kitchen is closing soon"}'
```

### 4. Get Ready Orders
```bash
curl -X GET http://localhost:4000/api/waiter/orders/ready \
  -H "Authorization: Bearer YOUR_WAITER_TOKEN" \
  -H "Content-Type: application/json"
```

### 5. Mark Order as Served
```bash
curl -X POST http://localhost:4000/api/waiter/orders/ORDER_ID/served \
  -H "Authorization: Bearer YOUR_WAITER_TOKEN" \
  -H "Content-Type: application/json"
```

### 6. Get Table Status
```bash
curl -X GET http://localhost:4000/api/waiter/tables \
  -H "Authorization: Bearer YOUR_WAITER_TOKEN" \
  -H "Content-Type: application/json"
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "tableNumber": 1,
      "capacity": 4,
      "location": "Main Floor",
      "status": "OCCUPIED",
      "activeOrder": {
        "id": "uuid",
        "orderNumber": 15,
        "status": "CONFIRMED",
        "guestName": "Bob Wilson",
        "totalAmount": 85.00,
        "billRequested": false
      }
    },
    {
      "id": "uuid",
      "tableNumber": 2,
      "capacity": 2,
      "location": "Window",
      "status": "AVAILABLE",
      "activeOrder": null
    }
  ]
}
```

### 7. Generate Bill
```bash
curl -X POST http://localhost:4000/api/waiter/bill/generate \
  -H "Authorization: Bearer YOUR_WAITER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "ORDER_UUID",
    "discount": 10
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Bill generated successfully",
  "data": {
    "billNumber": "BILL-15",
    "orderId": "uuid",
    "orderNumber": 15,
    "tableNumber": 5,
    "guestName": "John Doe",
    "items": [
      {
        "name": "Burger",
        "quantity": 2,
        "unitPrice": 12.50,
        "subtotal": 25.00
      }
    ],
    "subtotal": 100.00,
    "taxRate": 10,
    "taxAmount": 10.00,
    "serviceChargeRate": 5,
    "serviceCharge": 5.00,
    "discount": 10.00,
    "total": 105.00,
    "generatedAt": "2026-01-07T13:00:00.000Z"
  }
}
```

### 8. Get Bill for Order
```bash
curl -X GET http://localhost:4000/api/waiter/bill/ORDER_ID \
  -H "Authorization: Bearer YOUR_WAITER_TOKEN" \
  -H "Content-Type: application/json"
```

### 9. Record Payment
```bash
curl -X POST http://localhost:4000/api/waiter/bill/pay \
  -H "Authorization: Bearer YOUR_WAITER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "ORDER_UUID",
    "paymentMethod": "CASH",
    "amount": 105.00
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Payment recorded successfully",
  "data": {
    "success": true,
    "payment": {
      "id": "uuid",
      "orderId": "uuid",
      "amount": 105.00,
      "method": "CASH",
      "status": "SUCCESS",
      "completedAt": "2026-01-07T13:30:00.000Z"
    },
    "message": "Payment recorded successfully"
  }
}
```

---

## Socket.IO Testing

### Connect and Join Room (Browser/Node.js)

```javascript
import io from 'socket.io-client';

// Connect to server
const socket = io('http://localhost:4000', {
  transports: ['websocket'],
  auth: {
    token: 'YOUR_JWT_TOKEN'
  }
});

// Join room based on role
socket.emit('join:room', {
  role: 'KITCHEN_STAFF', // or 'WAITER'
  userId: 'YOUR_USER_ID'
});

// Listen for confirmation
socket.on('room:joined', (data) => {
  console.log('Joined room:', data);
});

// Kitchen listens for new confirmed orders
socket.on('order:confirmed', (data) => {
  console.log('New order for kitchen:', data);
  // Update UI with new order
});

// Kitchen emits when order is ready
socket.on('order:preparing', (data) => {
  console.log('Order is being prepared:', data);
});

// Waiter listens for ready orders
socket.on('order:ready', (data) => {
  console.log('Order ready to serve:', data);
  // Show notification to waiter
});

// Both listen for cancellations
socket.on('order:cancelled', (data) => {
  console.log('Order cancelled:', data);
  // Remove from UI
});
```

---

## Error Responses

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Unauthorized - Invalid or missing token"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Forbidden - KITCHEN_STAFF, ADMIN role required"
}
```

### 400 Bad Request (Validation Error)
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "field": "status",
      "message": "Status must be either PREPARING or READY"
    }
  ]
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Order not found"
}
```

### 500 Server Error
```json
{
  "success": false,
  "message": "Invalid status transition: PENDING -> READY"
}
```

---

## Complete Order Flow Test

1. **Customer creates order** (to be implemented)
   - Order status: PENDING
   - Socket event: `order:created` → waiter room

2. **Waiter accepts order**
   ```bash
   POST /api/waiter/orders/:id/accept
   ```
   - Order status: PENDING → CONFIRMED
   - Table status: AVAILABLE → OCCUPIED
   - Socket event: `order:confirmed` → kitchen room

3. **Kitchen starts preparing**
   ```bash
   PATCH /api/kitchen/orders/:id/status
   Body: {"status": "PREPARING"}
   ```
   - Order status: CONFIRMED → PREPARING
   - All items: QUEUED → COOKING
   - Socket event: `order:preparing` → kitchen, waiter rooms

4. **Kitchen marks ready**
   ```bash
   PATCH /api/kitchen/orders/:id/status
   Body: {"status": "READY"}
   ```
   - Order status: PREPARING → READY
   - All items: COOKING → READY
   - Socket event: `order:ready` → waiter room

5. **Waiter serves food**
   ```bash
   POST /api/waiter/orders/:id/served
   ```
   - Order status: READY → SERVED

6. **Waiter generates bill**
   ```bash
   POST /api/waiter/bill/generate
   Body: {"orderId": "...", "discount": 0}
   ```
   - Sets billRequested: true
   - Returns bill with breakdown

7. **Waiter records payment**
   ```bash
   POST /api/waiter/bill/pay
   Body: {"orderId": "...", "paymentMethod": "CASH", "amount": 105}
   ```
   - Order status: SERVED → COMPLETED
   - Payment status: UNPAID → PAID
   - Table status: OCCUPIED → AVAILABLE
   - Creates payment record

---

## Notes

- Replace `YOUR_KITCHEN_STAFF_TOKEN` and `YOUR_WAITER_TOKEN` with actual JWT tokens
- Replace `ORDER_ID`, `ITEM_ID` with actual UUIDs from database
- Server must be running on port 4000 (or update URLs accordingly)
- All requests require valid authentication tokens
- Socket.IO runs on the same port as the HTTP server
