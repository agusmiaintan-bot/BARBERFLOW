const express = require('express');
const router = express.Router();
const Antrian = require('../model/antrian');
const { connectDB } = require('../konfigurasi/koneksiMongo');

/**
 * Middleware untuk connect ke MongoDB
 */
router.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (error) {
        console.error('Database connection error:', error);
        res.status(503).json({ 
            error: 'Database connection failed',
            message: 'Service temporarily unavailable' 
        });
    }
});

/**
 * POST /api/antrian/add atau /api/antrian/tambah
 * Tambah antrian baru
 */
router.post(['/add', '/tambah'], async (req, res) => {
    try {
        const { nama, nama_pelanggan, email, barber, layanan } = req.body;
        const nama_final = nama || nama_pelanggan;

        // Validasi input
        if (!nama_final || nama_final.trim() === '') {
            return res.status(400).json({ 
                error: 'Validation Error',
                message: 'Nama pelanggan wajib diisi' 
            });
        }

        // Generate nomor antrian otomatis
        const lastAntrian = await Antrian.findOne().sort({ nomor: -1 });
        const nomorBaru = lastAntrian ? lastAntrian.nomor + 1 : 1;

        const newAntrian = await Antrian.create({
            nomor: nomorBaru,
            nama_pelanggan: nama_final.trim(),
            email: email?.trim() || '',
            barber: barber?.trim() || '',
            layanan: layanan?.trim() || '',
            status: 'menunggu'
        });

        return res.status(201).json({
            success: true,
            message: 'Antrian berhasil ditambahkan',
            data: newAntrian
        });
    } catch (error) {
        console.error('Error tambah antrian:', error);
        return res.status(500).json({ 
            error: 'Server Error',
            message: error.message 
        });
    }
});

/**
 * GET /api/antrian
 * Lihat semua antrian
 */
router.get('/', async (req, res) => {
    try {
        const { status, skip = 0, limit = 100 } = req.query;
        const filter = status ? { status } : {};

        const data = await Antrian.find(filter)
            .sort({ created_at: -1 })
            .skip(parseInt(skip))
            .limit(parseInt(limit));

        const total = await Antrian.countDocuments(filter);

        return res.status(200).json({
            success: true,
            data,
            pagination: {
                total,
                skip: parseInt(skip),
                limit: parseInt(limit)
            }
        });
    } catch (error) {
        console.error('Error get antrian:', error);
        return res.status(500).json({ 
            error: 'Server Error',
            message: error.message 
        });
    }
});

/**
 * GET /api/antrian/:id
 * Lihat detail antrian spesifik
 */
router.get('/:id', async (req, res) => {
    try {
        const antrian = await Antrian.findById(req.params.id);
        
        if (!antrian) {
            return res.status(404).json({ 
                error: 'Not Found',
                message: 'Antrian tidak ditemukan' 
            });
        }

        return res.status(200).json({
            success: true,
            data: antrian
        });
    } catch (error) {
        console.error('Error get antrian detail:', error);
        return res.status(500).json({ 
            error: 'Server Error',
            message: error.message 
        });
    }
});

/**
 * PATCH /api/antrian/:id atau PUT /api/antrian/status/:id
 * Update status antrian
 */
router.patch(['/:id', '/status/:id'], async (req, res) => {
    try {
        const { status } = req.body;
        const allowedStatus = ['menunggu', 'dilayani', 'selesai', 'batal'];

        if (!status || !allowedStatus.includes(status)) {
            return res.status(400).json({ 
                error: 'Validation Error',
                message: `Status harus salah satu dari: ${allowedStatus.join(', ')}` 
            });
        }

        const updated = await Antrian.findByIdAndUpdate(
            req.params.id,
            { status, updated_at: Date.now() },
            { new: true, runValidators: true }
        );

        if (!updated) {
            return res.status(404).json({ 
                error: 'Not Found',
                message: 'Antrian tidak ditemukan' 
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Status antrian berhasil diupdate',
            data: updated
        });
    } catch (error) {
        console.error('Error update status antrian:', error);
        return res.status(500).json({ 
            error: 'Server Error',
            message: error.message 
        });
    }
});

/**
 * PUT /api/antrian/:id
 * Update antrian lengkap
 */
router.put('/:id', async (req, res) => {
    try {
        const { nama_pelanggan, email, barber, layanan, status } = req.body;

        const updateData = {};
        if (nama_pelanggan) updateData.nama_pelanggan = nama_pelanggan.trim();
        if (email) updateData.email = email.trim();
        if (barber) updateData.barber = barber.trim();
        if (layanan) updateData.layanan = layanan.trim();
        if (status) updateData.status = status;

        const updated = await Antrian.findByIdAndUpdate(
            req.params.id,
            { ...updateData, updated_at: Date.now() },
            { new: true, runValidators: true }
        );

        if (!updated) {
            return res.status(404).json({ 
                error: 'Not Found',
                message: 'Antrian tidak ditemukan' 
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Antrian berhasil diupdate',
            data: updated
        });
    } catch (error) {
        console.error('Error update antrian:', error);
        return res.status(500).json({ 
            error: 'Server Error',
            message: error.message 
        });
    }
});

/**
 * DELETE /api/antrian/:id
 * Hapus antrian
 */
router.delete('/:id', async (req, res) => {
    try {
        const deleted = await Antrian.findByIdAndDelete(req.params.id);

        if (!deleted) {
            return res.status(404).json({ 
                error: 'Not Found',
                message: 'Antrian tidak ditemukan' 
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Antrian berhasil dihapus',
            data: deleted
        });
    } catch (error) {
        console.error('Error delete antrian:', error);
        return res.status(500).json({ 
            error: 'Server Error',
            message: error.message 
        });
    }
});

module.exports = router;
