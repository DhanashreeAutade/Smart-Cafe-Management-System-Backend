const express = require('express');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const config = require('./config/config.js');
const mongoose = require('mongoose');
const appRouter = require('./app/routes/appRoutes.js');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

// Socket.io initialization with CORS
const io = socketIo(server, {
    cors: {
        origin: "*",
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE"]
    }
});

app.set('trust proxy', 1);

app.use(cors({
    origin: true,
    credentials: true,
}));

app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, 'app', 'uploads')));

// Middleware to attach io instance to request
app.use((req, res, next) => {
    req.io = io;
    next();
});

// Socket.io connection handling
io.on('connection', (socket) => {
    console.log('🔗 User connected:', socket.id);

    // Join user to a room for personalized notifications
    socket.on('joinAdminRoom', () => {
        socket.join('admin');
        console.log('📍 User joined admin room:', socket.id);
    });

    socket.on('joinKitchenRoom', () => {
        socket.join('kitchen');
        console.log('📍 User joined kitchen room:', socket.id);
    });

    socket.on('leaveAdminRoom', () => {
        socket.leave('admin');
        console.log('📍 User left admin room:', socket.id);
    });

    socket.on('leaveKitchenRoom', () => {
        socket.leave('kitchen');
        console.log('📍 User left kitchen room:', socket.id);
    });

    socket.on('disconnect', () => {
        console.log('❌ User disconnected:', socket.id);
    });
});

appRouter.initialize(app);

mongoose
    .connect(config.dbUrl)
    .then(() => {
        console.log('✅ Connected to MongoDB', config.dbUrl);
    })
    .catch((err) => {
        console.error('❌ Error connecting to MongoDB', err);
        process.exit(1);
    });

server.listen(config.serverPort, () => {
    console.log(`🚀 Server running on port ${config.serverPort}`);
    console.log(`📡 Socket.io ready for real-time events`);
});