const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');

const app = express();

// Middleware
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['*'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Serve static files dari folder public
app.use(express.static(path.join(__dirname, '../public')));

// Database connection utility
let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
        };

        cached.promise = mongoose.connect(process.env.MONGO_URI, opts)
            .then(() => mongoose);
    }

    cached.conn = await cached.promise;
    return cached.conn;
}

// Health check
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'OK' });
});

// Import routes
const antrianRoutes = require('../routes/antrian');

// Middleware untuk connect DB
app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (error) {
        res.status(503).json({ error: 'Database connection failed' });
    }
});

// Routes
app.use('/api/antrian', antrianRoutes);

// Tambahkan route untuk halaman utama (sebelum 404 handler)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// 404
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint tidak ditemukan' });
});

module.exports = app;
