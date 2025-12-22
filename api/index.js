// Load environment variables
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const { connectDB } = require('../konfigurasi/koneksiMongo');

const app = express();
const server = http.createServer(app);

/* ======================
   SOCKET.IO SETUP
====================== */
const io = new Server(server, {
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['*'],
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

/* ======================
   MIDDLEWARE DASAR
====================== */
app.use(require('cors')({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['*'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files dari folder public
app.use(express.static(path.join(__dirname, '../public')));

/* ======================
   DATABASE CONNECTION
====================== */
let isDbConnected = false;

// Try to connect to database on startup (non-blocking)
(async () => {
  try {
    await connectDB();
    isDbConnected = true;
    console.log('✅ Database connected successfully');
  } catch (err) {
    console.error('⚠️ Database connection failed:', err.message);
    console.log('⚠️ Server will run WITHOUT database. Socket.IO still works!');
  }
})();

// Middleware untuk check database (optional - tidak block request)
app.use(async (req, res, next) => {
  // Jangan block request jika database belum connect
  // Hanya coba connect jika belum connected
  if (!isDbConnected && !req.path.includes('/health')) {
    try {
      await connectDB();
      isDbConnected = true;
    } catch (err) {
      // Tidak perlu throw error, biarkan request lanjut
      // Error akan muncul di endpoint yang butuh database
    }
  }
  next();
});

/* ======================
   TEST ROUTES
====================== */
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    database: isDbConnected ? 'connected' : 'disconnected',
    socketio: 'active'
  });
});

app.get('/api/test', (req, res) => {
  res.json({ message: 'API TEST OK', timestamp: new Date().toISOString() });
});

/* ======================
   ROUTES APLIKASI
====================== */
const antrianRoutes = require('../routes/antrian');
app.use('/api/antrian', antrianRoutes);

const chatRoutes = require('../routes/chat');
app.use('/api/chat', chatRoutes);

const chatbotRoutes = require('../routes/chatbots');
app.use('/api/chatbot', chatbotRoutes);

/* ======================
   SOCKET.IO HANDLERS
====================== */
const setupSocketHandlers = require('../socket/socketAntrian');
setupSocketHandlers(io);

/* ======================
   404 HANDLER
====================== */
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Endpoint tidak ditemukan', 
    path: req.path 
  });
});

/* ======================
   ERROR HANDLER
====================== */
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: 'Internal Server Error', 
    message: err.message 
  });
});

/* ======================
   DEVELOPMENT SERVER
====================== */
if (require.main === module) {
  const PORT = process.env.PORT || 3001;
  server.listen(PORT, async () => {
    console.log('🚀 BARBERFLOW Server Started');
    console.log('=' .repeat(50));
    console.log(`📡 Server running on port ${PORT}`);
    console.log(`🌐 URL: http://localhost:${PORT}`);
    
    try {
      await connectDB();
      isDbConnected = true;
      console.log('✅ Database connected');
    } catch (error) {
      console.error('❌ Database connection failed:', error.message);
    }
    
    console.log('🔌 Socket.IO ready');
    console.log('=' .repeat(50));
  });
}

/* ======================
   EXPORT (WAJIB)
====================== */
module.exports = server;
