const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');

const app = express();

/* =======================
   MIDDLEWARE
======================= */
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

/* =======================
   STATIC FILES
   (AMAN, tapi OPSIONAL)
======================= */
app.use(express.static(path.join(process.cwd(), 'public')));

/* =======================
   DATABASE (MONGODB)
======================= */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.MONGO_URI, {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
    }).then((mongoose) => mongoose);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

/* =======================
   DB CONNECTION MIDDLEWARE
======================= */
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error(err);
    res.status(503).json({ error: 'Database connection failed' });
  }
});

/* =======================
   HEALTH CHECK (PENTING)
======================= */
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Backend Barberflow running'
  });
});

/* =======================
   ROUTES
======================= */
const antrianRoutes = require('../routes/antrian');
app.use('/api/antrian', antrianRoutes);

/* =======================
   ROOT (BIAR TIDAK Cannot GET /)
======================= */
app.get('/', (req, res) => {
  res.status(200).send('Barberflow Backend API is running 🚀');
});

/* =======================
   404 HANDLER
======================= */
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint tidak ditemukan' });
});

/* =======================
   EXPORT (WAJIB UNTUK VERCEL)
======================= */
module.exports = app;
