const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

/* ======================
   MIDDLEWARE DASAR
====================== */
app.use(cors());
app.use(express.json());

/* ======================
   TEST ROUTES (WAJIB)
====================== */
app.get('/', (req, res) => {
  res.send('ROOT OK');
});

app.get('/api/test', (req, res) => {
  res.json({ message: 'API TEST OK' });
});

/* ======================
   MONGODB CONNECTION
   (SERVERLESS SAFE)
====================== */
let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(process.env.MONGO_URI)
      .then((mongoose) => mongoose);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

// middleware connect DB
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error(err);
    res.status(503).json({ error: 'Database connection failed' });
  }
});

/* ======================
   ROUTES APLIKASI
====================== */
const antrianRoutes = require('../routes/antrian');
app.use('/api/antrian', antrianRoutes);

const chatbotRoutes = require('../routes/chatbot');
app.use('/api/chatbot', chatbotRoutes);

/* ======================
   EXPORT (WAJIB)
====================== */
module.exports = app;
