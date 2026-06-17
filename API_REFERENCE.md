# API Reference & Frontend Integration Guide

## 🔗 Base URL
```
http://localhost:6100/orders
```

## 📝 API Endpoints

### 1. Create Order
**Endpoint:** `POST /orders/create`

**Request Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body:**
```json
{
  "items": [
    {
      "productId": "507f1f77bcf86cd799439011",
      "productName": "Cappuccino",
      "quantity": 2,
      "price": 250,
      "emoji": "☕",
      "image": "cappuccino.jpg"
    }
  ],
  "totalAmount": 500,
  "notes": "Extra foam",
  "table": "T01"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Order placed successfully",
  "order": {
    "_id": "507f1f77bcf86cd799439012",
    "orderNumber": "#1",
    "orderDate": "2024-01-01T10:00:00.000Z",
    "userId": "507f1f77bcf86cd799439010",
    "items": [...],
    "totalAmount": 500,
    "status": "pending",
    "paymentStatus": "pending",
    "notes": "Extra foam",
    "table": "T01",
    "createdAt": "2024-01-01T10:00:00.000Z",
    "updatedAt": "2024-01-01T10:00:00.000Z"
  }
}
```

---

### 2. Get All Orders
**Endpoint:** `GET /orders/all?status=pending&userId=me`

**Query Parameters:**
- `status` (optional): pending, preparing, ready, completed, cancelled
- `userId` (optional): "me" for current user or specific user ID

**Response:**
```json
{
  "success": true,
  "count": 5,
  "orders": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "orderNumber": "#1",
      "orderDate": "2024-01-01T10:00:00.000Z",
      "status": "pending",
      ...
    }
  ]
}
```

---

### 3. Get Today's Orders ⭐ [NEW]
**Endpoint:** `GET /orders/today/list?status=preparing`

**Query Parameters:**
- `status` (optional): Filter by status

**Response:**
```json
{
  "success": true,
  "count": 3,
  "orders": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "orderNumber": "#1",
      "orderDate": "2024-01-01T10:00:00.000Z",
      "status": "preparing",
      ...
    },
    {
      "_id": "507f1f77bcf86cd799439013",
      "orderNumber": "#2",
      "status": "ready",
      ...
    }
  ]
}
```

---

### 4. Get Today's Dashboard Stats ⭐ [NEW]
**Endpoint:** `GET /orders/today/stats`

**Response:**
```json
{
  "success": true,
  "stats": {
    "totalOrders": 25,
    "pendingOrders": 8,
    "preparingOrders": 5,
    "readyOrders": 7,
    "completedOrders": 5,
    "cancelledOrders": 0,
    "totalRevenue": 12500
  }
}
```

**Use Cases:**
- Dashboard widget
- Quick metrics display
- Real-time updates

---

### 5. Get Order by ID
**Endpoint:** `GET /orders/:orderId`

**URL Parameters:**
- `orderId`: MongoDB ObjectId

**Response:**
```json
{
  "success": true,
  "order": {
    "_id": "507f1f77bcf86cd799439012",
    "orderNumber": "#1",
    "status": "preparing",
    ...
  }
}
```

---

### 6. Get Order by Order Number
**Endpoint:** `GET /orders/search/number?orderNumber=%231`

**Query Parameters:**
- `orderNumber` (required): Order number (e.g., "#1", "#2")

**Response:**
```json
{
  "success": true,
  "order": {
    "_id": "507f1f77bcf86cd799439012",
    "orderNumber": "#1",
    ...
  }
}
```

---

### 7. Update Order Status
**Endpoint:** `PUT /orders/status`

**Request Body:**
```json
{
  "orderId": "507f1f77bcf86cd799439012",
  "status": "preparing"
}
```

**Status Values:**
- `pending` - Initial status
- `preparing` - Chef is preparing
- `ready` - Ready for pickup
- `completed` - Delivered/Completed
- `cancelled` - Order cancelled

**Response:**
```json
{
  "success": true,
  "message": "Order status updated",
  "order": {
    "_id": "507f1f77bcf86cd799439012",
    "orderNumber": "#1",
    "status": "preparing",
    ...
  }
}
```

**Real-Time Event Emitted:**
```javascript
// Socket.IO event on all connected clients
{
  type: 'orderStatusUpdated',
  data: {
    _id: "507f1f77bcf86cd799439012",
    orderNumber: "#1",
    status: "preparing",
    updatedAt: "2024-01-01T10:05:00.000Z"
  }
}
```

---

### 8. Update Payment Status
**Endpoint:** `PUT /orders/payment-status`

**Request Body:**
```json
{
  "orderId": "507f1f77bcf86cd799439012",
  "paymentStatus": "completed"
}
```

**Payment Status Values:**
- `pending` - Payment awaiting
- `completed` - Payment done
- `failed` - Payment failed

**Response:**
```json
{
  "success": true,
  "message": "Payment status updated",
  "order": {
    "_id": "507f1f77bcf86cd799439012",
    "orderNumber": "#1",
    "paymentStatus": "completed",
    ...
  }
}
```

**Real-Time Event Emitted:**
```javascript
{
  type: 'paymentStatusUpdated',
  data: {
    _id: "507f1f77bcf86cd799439012",
    orderNumber: "#1",
    paymentStatus: "completed",
    updatedAt: "2024-01-01T10:05:00.000Z"
  }
}
```

---

### 9. Delete Order
**Endpoint:** `DELETE /orders/:orderId`

**URL Parameters:**
- `orderId`: MongoDB ObjectId

**Response:**
```json
{
  "success": true,
  "message": "Order deleted successfully"
}
```

**Real-Time Event Emitted:**
```javascript
{
  type: 'orderDeleted',
  data: {
    orderId: "507f1f77bcf86cd799439012"
  }
}
```

---

### 10. Get All-Time Statistics
**Endpoint:** `GET /orders/stats/summary`

**Response:**
```json
{
  "success": true,
  "stats": [
    {
      "_id": "pending",
      "count": 5,
      "totalAmount": 2500
    },
    {
      "_id": "preparing",
      "count": 3,
      "totalAmount": 1500
    },
    {
      "_id": "completed",
      "count": 50,
      "totalAmount": 25000
    }
  ]
}
```

---

## 🔌 Socket.IO Real-Time Events

### Connection Setup (Frontend)
```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:6100', {
  auth: {
    token: localStorage.getItem('token')
  }
});

// Join admin room for order notifications
socket.emit('joinAdminRoom');

// Or join kitchen room for order updates
socket.emit('joinKitchenRoom');
```

---

### Event: New Order Created
**Event Name:** `newOrder`

**Payload:**
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "orderNumber": "#1",
  "userId": "507f1f77bcf86cd799439010",
  "items": [
    {
      "productId": "507f1f77bcf86cd799439011",
      "productName": "Cappuccino",
      "quantity": 2,
      "price": 250
    }
  ],
  "totalAmount": 500,
  "status": "pending",
  "notes": "Extra foam",
  "table": "T01",
  "paymentStatus": "pending",
  "createdAt": "2024-01-01T10:00:00.000Z",
  "updatedAt": "2024-01-01T10:00:00.000Z"
}
```

**Frontend Handler:**
```javascript
socket.on('newOrder', (order) => {
  console.log('New order:', order.orderNumber);
  // Update dashboard
  // Show notification
  // Play sound
});
```

---

### Event: Order Status Updated
**Event Name:** `orderStatusUpdated`

**Payload:**
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "orderNumber": "#1",
  "status": "preparing",
  "updatedAt": "2024-01-01T10:05:00.000Z"
}
```

**Frontend Handler:**
```javascript
socket.on('orderStatusUpdated', (data) => {
  console.log(`Order ${data.orderNumber} status: ${data.status}`);
  // Update order list
  // Update order tracking
  // Show notification
});
```

---

### Event: Payment Status Updated
**Event Name:** `paymentStatusUpdated`

**Payload:**
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "orderNumber": "#1",
  "paymentStatus": "completed",
  "updatedAt": "2024-01-01T10:05:00.000Z"
}
```

**Frontend Handler:**
```javascript
socket.on('paymentStatusUpdated', (data) => {
  console.log(`Payment for ${data.orderNumber}: ${data.paymentStatus}`);
  // Update payment status
  // Show confirmation
});
```

---

### Event: Order Deleted
**Event Name:** `orderDeleted`

**Payload:**
```json
{
  "orderId": "507f1f77bcf86cd799439012"
}
```

**Frontend Handler:**
```javascript
socket.on('orderDeleted', (data) => {
  console.log('Order deleted:', data.orderId);
  // Remove from order list
  // Update dashboard
});
```

---

## 💻 Frontend Integration Examples

### Example 1: Dashboard Display
```javascript
// Get today's stats
fetch('http://localhost:6100/orders/today/stats', {
  headers: { 'Authorization': `Bearer ${token}` }
})
.then(res => res.json())
.then(data => {
  document.getElementById('total-orders').textContent = data.stats.totalOrders;
  document.getElementById('pending').textContent = data.stats.pendingOrders;
  document.getElementById('preparing').textContent = data.stats.preparingOrders;
  document.getElementById('ready').textContent = data.stats.readyOrders;
  document.getElementById('completed').textContent = data.stats.completedOrders;
  document.getElementById('revenue').textContent = '₹' + data.stats.totalRevenue;
});
```

### Example 2: Live Order List
```javascript
// Get today's orders
fetch('http://localhost:6100/orders/today/list', {
  headers: { 'Authorization': `Bearer ${token}` }
})
.then(res => res.json())
.then(data => {
  // Initial load
  displayOrders(data.orders);
  
  // Live updates
  socket.on('newOrder', (order) => {
    addOrderToList(order);
    updateStats();
  });
  
  socket.on('orderStatusUpdated', (data) => {
    updateOrderStatus(data._id, data.status);
    updateStats();
  });
});
```

### Example 3: Admin Panel - Update Status
```javascript
function updateOrderStatus(orderId, newStatus) {
  fetch('http://localhost:6100/orders/status', {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      orderId: orderId,
      status: newStatus
    })
  })
  .then(res => res.json())
  .then(data => {
    console.log('Order updated:', data.order);
    // Real-time event will be emitted automatically
  });
}
```

### Example 4: Kitchen Display System (KDS)
```javascript
// Connect to kitchen room
socket.emit('joinKitchenRoom');

// Listen for new orders
socket.on('newOrder', (order) => {
  if (order.status === 'pending') {
    displayOrderOnKDS(order);
    playOrderSound();
  }
});

// Listen for status changes
socket.on('orderStatusUpdated', (data) => {
  if (data.status === 'completed') {
    markOrderAsComplete(data._id);
  }
});
```

---

## ⚠️ Error Handling

### Common Error Responses

**Invalid Order ID:**
```json
{
  "success": false,
  "error": "Order not found"
}
```

**Validation Error:**
```json
{
  "success": false,
  "error": "Order ID and status are required"
}
```

**Authentication Error:**
```json
{
  "success": false,
  "error": "Unauthorized"
}
```

---

## 🔍 Query Examples

### Get All Pending Orders Today
```bash
GET /orders/today/list?status=pending
```

### Get All Completed Orders
```bash
GET /orders/all?status=completed
```

### Get Current User's Orders
```bash
GET /orders/all?userId=me
```

### Search by Order Number
```bash
GET /orders/search/number?orderNumber=%231
```

---

## 📊 Data Types

### Status Values
```javascript
const STATUS = {
  PENDING: 'pending',
  PREPARING: 'preparing',
  READY: 'ready',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};
```

### Payment Status Values
```javascript
const PAYMENT_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed'
};
```

---

## 🚀 Performance Tips

1. **Cache today's stats** - Update via WebSocket instead of polling
2. **Pagination** - Add pagination for large order lists
3. **Filtering** - Use status filters to reduce data
4. **Compression** - Enable gzip for responses
5. **Batching** - Batch multiple updates together

---

## 📱 Mobile Integration Tips

1. **Token Storage** - Store JWT in secure storage
2. **Offline Support** - Cache orders locally
3. **Background Updates** - Use service workers
4. **Battery Optimization** - Minimize polling, use WebSocket
5. **Data Efficiency** - Use pagination and filters

---

**Last Updated:** 2024
**API Version:** 1.0
