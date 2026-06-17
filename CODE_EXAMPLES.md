# Code Examples & Integration Patterns

## 🔧 Backend Examples (Node.js/Testing)

### Example 1: Testing Daily Order Counter

```javascript
// test/counter.test.js
const request = require('supertest');
const app = require('../server');
const Order = require('../app/models/order.model');
const Counter = require('../app/models/counter.model');

describe('Daily Order Counter', () => {
  
  it('should generate sequential order numbers for today', async () => {
    const token = 'valid_jwt_token';
    
    // Create first order
    const res1 = await request(app)
      .post('/orders/create')
      .set('Authorization', `Bearer ${token}`)
      .send({
        items: [{ productId: '123', productName: 'Coffee', quantity: 1, price: 150 }],
        totalAmount: 150,
        table: 'T01'
      });
    
    expect(res1.body.order.orderNumber).toBe('#1');
    
    // Create second order
    const res2 = await request(app)
      .post('/orders/create')
      .set('Authorization', `Bearer ${token}`)
      .send({
        items: [{ productId: '123', productName: 'Tea', quantity: 1, price: 100 }],
        totalAmount: 100,
        table: 'T02'
      });
    
    expect(res2.body.order.orderNumber).toBe('#2');
  });
  
  it('should reset order number on new day', async () => {
    // This test would require mocking date or manipulating test database
    const counter = await Counter.findOne();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    expect(counter.date.getTime()).toBe(today.getTime());
  });
});
```

### Example 2: Concurrent Order Creation (Stress Test)

```javascript
// test/concurrent-orders.js
const Order = require('../app/models/order.model');
const orderService = require('../app/services/order.service');

async function testConcurrentOrders() {
  const userId = '507f1f77bcf86cd799439010';
  const testData = {
    items: [{ productId: '507f1f77bcf86cd799439011', productName: 'Coffee', quantity: 1, price: 150 }],
    totalAmount: 150,
    notes: '',
    table: 'T01'
  };
  
  try {
    // Create 100 orders simultaneously
    const promises = Array(100).fill(null).map((_, i) => 
      orderService.createOrder(
        userId,
        testData.items,
        testData.totalAmount,
        `Order ${i}`,
        `T${String(i).padStart(2, '0')}`
      )
    );
    
    const orders = await Promise.all(promises);
    
    // Check for duplicates
    const orderNumbers = orders.map(o => o.orderNumber);
    const uniqueNumbers = new Set(orderNumbers);
    
    console.log(`Created: ${orders.length} orders`);
    console.log(`Unique: ${uniqueNumbers.size} order numbers`);
    console.log(`Duplicates: ${orders.length - uniqueNumbers.size}`);
    
    if (orders.length === uniqueNumbers.size) {
      console.log('✅ No race conditions detected!');
    } else {
      console.log('❌ Race condition found!');
    }
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testConcurrentOrders();
```

### Example 3: Today's Statistics Calculation

```javascript
// scripts/get-today-stats.js
const mongoose = require('mongoose');
const orderService = require('../app/services/order.service');
const config = require('../config/config');

async function main() {
  try {
    await mongoose.connect(config.dbUrl);
    
    const stats = await orderService.getTodaysStats();
    
    console.log('📊 Today\'s Dashboard Statistics:');
    console.log('================================');
    console.log(`Total Orders:     ${stats.totalOrders}`);
    console.log(`Pending:          ${stats.pendingOrders}`);
    console.log(`Preparing:        ${stats.preparingOrders}`);
    console.log(`Ready:            ${stats.readyOrders}`);
    console.log(`Completed:        ${stats.completedOrders}`);
    console.log(`Cancelled:        ${stats.cancelledOrders}`);
    console.log(`Total Revenue:    ₹${stats.totalRevenue}`);
    console.log('================================');
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();
```

---

## 🌐 Frontend Examples (React/Vue)

### Example 1: React Dashboard Component

```javascript
// components/OrderDashboard.jsx
import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const OrderDashboard = ({ token }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const socket = io('http://localhost:6100', {
    auth: { token }
  });

  useEffect(() => {
    // Fetch initial stats
    fetchTodaysStats();
    
    // Join admin room for real-time updates
    socket.emit('joinAdminRoom');
    
    // Listen for order events
    socket.on('newOrder', handleNewOrder);
    socket.on('orderStatusUpdated', handleStatusUpdate);
    
    return () => {
      socket.off('newOrder');
      socket.off('orderStatusUpdated');
      socket.emit('leaveAdminRoom');
    };
  }, []);

  const fetchTodaysStats = async () => {
    try {
      const response = await fetch(
        'http://localhost:6100/orders/today/stats',
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      const data = await response.json();
      setStats(data.stats);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleNewOrder = (order) => {
    console.log('New order:', order.orderNumber);
    // Update stats
    setStats(prev => ({
      ...prev,
      totalOrders: prev.totalOrders + 1,
      pendingOrders: prev.pendingOrders + 1,
      totalRevenue: prev.totalRevenue + order.totalAmount
    }));
  };

  const handleStatusUpdate = (data) => {
    console.log('Order status updated:', data);
    // Refresh stats
    fetchTodaysStats();
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="dashboard">
      <h1>Today's Orders</h1>
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Orders</h3>
          <p className="stat-value">{stats.totalOrders}</p>
        </div>
        <div className="stat-card pending">
          <h3>Pending</h3>
          <p className="stat-value">{stats.pendingOrders}</p>
        </div>
        <div className="stat-card preparing">
          <h3>Preparing</h3>
          <p className="stat-value">{stats.preparingOrders}</p>
        </div>
        <div className="stat-card ready">
          <h3>Ready</h3>
          <p className="stat-value">{stats.readyOrders}</p>
        </div>
        <div className="stat-card completed">
          <h3>Completed</h3>
          <p className="stat-value">{stats.completedOrders}</p>
        </div>
        <div className="stat-card revenue">
          <h3>Revenue</h3>
          <p className="stat-value">₹{stats.totalRevenue}</p>
        </div>
      </div>
    </div>
  );
};

export default OrderDashboard;
```

### Example 2: Vue.js Order List Component

```vue
<!-- components/OrderList.vue -->
<template>
  <div class="order-list">
    <h2>Today's Orders</h2>
    
    <!-- Filter by status -->
    <select v-model="selectedStatus" @change="fetchOrders">
      <option value="">All Orders</option>
      <option value="pending">Pending</option>
      <option value="preparing">Preparing</option>
      <option value="ready">Ready</option>
      <option value="completed">Completed</option>
      <option value="cancelled">Cancelled</option>
    </select>

    <!-- Order list -->
    <div class="orders">
      <div v-for="order in orders" :key="order._id" class="order-card" :class="order.status">
        <div class="order-header">
          <h3>{{ order.orderNumber }}</h3>
          <span class="status" :class="order.status">{{ order.status }}</span>
        </div>
        
        <div class="order-body">
          <p><strong>Table:</strong> {{ order.table }}</p>
          <p><strong>Amount:</strong> ₹{{ order.totalAmount }}</p>
          <p><strong>Items:</strong></p>
          <ul>
            <li v-for="item in order.items" :key="item._id">
              {{ item.productName }} x{{ item.quantity }}
            </li>
          </ul>
        </div>

        <div class="order-actions" v-if="canUpdateStatus(order)">
          <button @click="updateStatus(order._id, getNextStatus(order.status))">
            Next Status →
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import io from 'socket.io-client';

export default {
  data() {
    return {
      orders: [],
      selectedStatus: '',
      socket: null,
      token: localStorage.getItem('token')
    };
  },
  
  mounted() {
    this.connectSocket();
    this.fetchOrders();
  },

  methods: {
    connectSocket() {
      this.socket = io('http://localhost:6100', {
        auth: { token: this.token }
      });

      this.socket.emit('joinKitchenRoom');

      this.socket.on('newOrder', (order) => {
        this.orders.unshift(order);
      });

      this.socket.on('orderStatusUpdated', (data) => {
        const order = this.orders.find(o => o._id === data._id);
        if (order) {
          order.status = data.status;
        }
      });

      this.socket.on('orderDeleted', (data) => {
        this.orders = this.orders.filter(o => o._id !== data.orderId);
      });
    },

    async fetchOrders() {
      const url = new URL('http://localhost:6100/orders/today/list');
      if (this.selectedStatus) {
        url.searchParams.append('status', this.selectedStatus);
      }

      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${this.token}` }
      });
      const data = await response.json();
      this.orders = data.orders;
    },

    async updateStatus(orderId, newStatus) {
      const response = await fetch('http://localhost:6100/orders/status', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          orderId,
          status: newStatus
        })
      });

      if (response.ok) {
        // Socket.IO will handle the update
        console.log('Order status updated');
      }
    },

    getNextStatus(currentStatus) {
      const statusFlow = ['pending', 'preparing', 'ready', 'completed'];
      const index = statusFlow.indexOf(currentStatus);
      return statusFlow[index + 1] || currentStatus;
    },

    canUpdateStatus(order) {
      return order.status !== 'completed' && order.status !== 'cancelled';
    }
  },

  beforeUnmount() {
    if (this.socket) {
      this.socket.emit('leaveKitchenRoom');
      this.socket.disconnect();
    }
  }
};
</script>

<style scoped>
.order-list {
  padding: 20px;
}

.orders {
  display: grid;
  gap: 15px;
  margin-top: 20px;
}

.order-card {
  border: 2px solid #ddd;
  border-radius: 8px;
  padding: 15px;
  transition: all 0.3s ease;
}

.order-card.pending {
  border-left: 5px solid #ff9800;
  background-color: #fff8f3;
}

.order-card.preparing {
  border-left: 5px solid #2196f3;
  background-color: #f3f7ff;
}

.order-card.ready {
  border-left: 5px solid #4caf50;
  background-color: #f3fff3;
}

.order-card.completed {
  border-left: 5px solid #8bc34a;
  background-color: #f8fff3;
  opacity: 0.7;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.status {
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
  text-transform: uppercase;
}

.status.pending { background: #ff9800; color: white; }
.status.preparing { background: #2196f3; color: white; }
.status.ready { background: #4caf50; color: white; }
.status.completed { background: #8bc34a; color: white; }

.order-actions {
  margin-top: 10px;
}

button {
  background: #2196f3;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background: #1976d2;
}
</style>
```

### Example 3: JavaScript Vanilla - Real-time Order Tracker

```javascript
// scripts/order-tracker.js
class OrderTracker {
  constructor(token, containerId) {
    this.token = token;
    this.container = document.getElementById(containerId);
    this.orders = [];
    this.socket = io('http://localhost:6100', {
      auth: { token }
    });
    this.init();
  }

  init() {
    this.socket.emit('joinAdminRoom');
    this.fetchTodaysOrders();
    this.setupSocketListeners();
    
    // Refresh every 30 seconds
    setInterval(() => this.fetchTodaysOrders(), 30000);
  }

  async fetchTodaysOrders() {
    try {
      const response = await fetch(
        'http://localhost:6100/orders/today/list',
        {
          headers: { 'Authorization': `Bearer ${this.token}` }
        }
      );
      const data = await response.json();
      this.orders = data.orders;
      this.render();
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  }

  setupSocketListeners() {
    this.socket.on('newOrder', (order) => {
      this.orders.unshift(order);
      this.render();
      this.showNotification(`New Order: ${order.orderNumber}`);
      this.playSound('success');
    });

    this.socket.on('orderStatusUpdated', (data) => {
      const order = this.orders.find(o => o._id === data._id);
      if (order) {
        order.status = data.status;
        this.render();
        
        if (data.status === 'ready') {
          this.showNotification(`Order ${data.orderNumber} Ready!`);
          this.playSound('alert');
        }
      }
    });

    this.socket.on('orderDeleted', (data) => {
      this.orders = this.orders.filter(o => o._id !== data.orderId);
      this.render();
    });
  }

  render() {
    const html = this.orders.map(order => `
      <div class="order-item status-${order.status}">
        <div class="order-number">${order.orderNumber}</div>
        <div class="order-info">
          <div class="order-table">Table: ${order.table}</div>
          <div class="order-items">
            ${order.items.map(i => `<span>${i.productName} x${i.quantity}</span>`).join(', ')}
          </div>
          <div class="order-amount">₹${order.totalAmount}</div>
        </div>
        <div class="order-status">
          <span class="badge ${order.status}">${order.status.toUpperCase()}</span>
        </div>
      </div>
    `).join('');

    this.container.innerHTML = html || '<p>No orders yet</p>';
  }

  showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => notification.remove(), 3000);
  }

  playSound(type) {
    // Simple beep sound
    const context = new (window.AudioContext || window.webkitAudioContext)();
    const freq = type === 'success' ? 800 : 1200;
    const osc = context.createOscillator();
    const gain = context.createGain();
    
    osc.connect(gain);
    gain.connect(context.destination);
    osc.frequency.value = freq;
    
    gain.gain.setValueAtTime(0.3, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.5);
    
    osc.start(context.currentTime);
    osc.stop(context.currentTime + 0.5);
  }
}

// Usage:
const tracker = new OrderTracker(localStorage.getItem('token'), 'orders-container');
```

---

## 🧪 cURL Examples for Testing

### Create Order
```bash
curl -X POST http://localhost:6100/orders/create \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "productId": "507f1f77bcf86cd799439011",
        "productName": "Cappuccino",
        "quantity": 2,
        "price": 250
      }
    ],
    "totalAmount": 500,
    "table": "T01",
    "notes": "Extra foam"
  }'
```

### Get Today's Orders
```bash
curl http://localhost:6100/orders/today/list \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Get Today's Stats
```bash
curl http://localhost:6100/orders/today/stats \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Update Order Status
```bash
curl -X PUT http://localhost:6100/orders/status \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "507f1f77bcf86cd799439012",
    "status": "preparing"
  }'
```

---

**Last Updated:** 2024
**Version:** 1.0
