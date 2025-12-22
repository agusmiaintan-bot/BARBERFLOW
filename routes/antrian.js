const express = require('express');
const router = express.Router();
const Antrian = require('../model/antrian');

// Tambah antrian
router.post('/add', async (req, res) => {
    try {
        const { nama_pelanggan, layanan } = req.body;
        const newAntrian = await Antrian.create({ nama_pelanggan, layanan });
        res.json(newAntrian);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Tambah antrian (endpoint alternatif)
router.post('/tambah', async (req, res) => {
    try {
        const { nama, email, barber } = req.body;
        const newAntrian = await Antrian.create({ 
            nama_pelanggan: nama, 
            email: email,
            barber: barber,
            status: 'menunggu'
        });
        res.json({ pesan: 'Antrian berhasil ditambahkan', data: newAntrian });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Lihat semua antrian
router.get('/', async (req, res) => {
    try {
        const data = await Antrian.find().sort({ created_at: 1 });
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update status antrian
router.patch('/status/:id', async (req, res) => {
    try {
        const { status } = req.body;
        const updated = await Antrian.findByIdAndUpdate(req.params.id, { status }, { new: true });
        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
