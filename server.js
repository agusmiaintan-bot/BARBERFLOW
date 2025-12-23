
// Import library Express untuk membuat server
const express = require('express');
// Import library CORS untuk mengizinkan akses lintas origin
const cors = require('cors');


// Membuat instance aplikasi Express
const app = express();


// Middleware CORS untuk mengatur siapa saja yang boleh mengakses API
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['*'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware untuk parsing request body bertipe JSON
app.use(express.json());


// Endpoint utama (root) untuk mengecek status API
app.get('/', (req, res) => {
    res.status(200).json({ 
        message: 'BARBERFLOW Backend API', 
        status: 'OK',
        endpoints: {
            health: '/api/health',
            queue: '/api/antrian'
        }
    });
});


// Endpoint untuk health check (mengecek apakah server berjalan)
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'Server is running' });
});


// Import dan gunakan route antrian (semua endpoint antrian diatur di sini)
const antrianRoutes = require('./routes/antrian');
app.use('/api/antrian', antrianRoutes);


// Handler untuk endpoint yang tidak ditemukan (404)
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint tidak ditemukan', path: req.path });
});


// Middleware untuk menangani error server
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal Server Error', message: err.message });
});


// Menjalankan server jika file ini dijalankan langsung (bukan di-import)
if (require.main === module) {
    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
        console.log(`✅ Server running on port ${PORT}`);
    });
}


// Mengekspor app untuk keperluan testing atau penggunaan di file lain
module.exports = app;
