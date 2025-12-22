const express = require('express');
const router = express.Router();
const Antrian = require('../model/antrian');
const mongoose = require('mongoose');

/**
 * POST /api/antrian/add
 */
router.post(['/add', '/tambah'], async (req, res) => {
  try {
    const { nama, nama_pelanggan, email, barber, layanan } = req.body;
    const nama_final = nama || nama_pelanggan;

    if (!nama_final || !nama_final.trim()) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Nama pelanggan wajib diisi'
      });
    }

    const last = await Antrian.findOne().sort({ nomor: -1 });
    const nomor = last ? last.nomor + 1 : 1;

    const antrian = await Antrian.create({
      nomor,
      nama_pelanggan: nama_final.trim(),
      email: email?.trim() || '',
      barber: barber?.trim() || '',
      layanan: layanan?.trim() || '',
      status: 'menunggu'
    });

    res.status(201).json({
      success: true,
      message: 'Antrian berhasil ditambahkan',
      data: antrian
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Error', message: err.message });
  }
});

/**
 * GET /api/antrian
 */
router.get('/', async (req, res) => {
  try {
    const { status, skip = 0, limit = 100 } = req.query;
    const filter = status ? { status } : {};

    const data = await Antrian.find(filter)
      .sort({ created_at: -1 })
      .skip(Number(skip))
      .limit(Number(limit));

    const total = await Antrian.countDocuments(filter);

    res.json({
      success: true,
      data,
      pagination: { total, skip: Number(skip), limit: Number(limit) }
    });
  } catch (err) {
    res.status(500).json({ error: 'Server Error', message: err.message });
  }
});

/**
 * GET /api/antrian/:id
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validasi ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'ID format tidak valid'
      });
    }

    const data = await Antrian.findById(id);
    if (!data) {
      return res.status(404).json({ 
        error: 'Not Found',
        message: 'Antrian tidak ditemukan'
      });
    }
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: 'Server Error', message: err.message });
  }
});

/**
 * PATCH /api/antrian/:id
 */
router.patch(['/:id', '/status/:id'], async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const allowed = ['menunggu', 'dilayani', 'selesai', 'batal'];

    if (!status) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Status harus diisi'
      });
    }

    if (!allowed.includes(status)) {
      return res.status(400).json({
        error: 'Validation Error',
        message: `Status harus salah satu dari ${allowed.join(', ')}`
      });
    }

    // Validasi ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'ID format tidak valid. Gunakan 24-character hex string.'
      });
    }

    const updated = await Antrian.findByIdAndUpdate(
      id,
      { status, updated_at: Date.now() },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ 
        error: 'Not Found',
        message: 'Antrian dengan ID tersebut tidak ditemukan'
      });
    }

    res.json({ success: true, message: 'Status berhasil diupdate', data: updated });
  } catch (err) {
    console.error('Error update status:', err);
    res.status(500).json({ error: 'Server Error', message: err.message });
  }
});

/**
 * DELETE /api/antrian/:id
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validasi ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'ID format tidak valid'
      });
    }

    const deleted = await Antrian.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ 
        error: 'Not Found',
        message: 'Antrian tidak ditemukan'
      });
    }

    res.json({ success: true, message: 'Antrian berhasil dihapus', data: deleted });
  } catch (err) {
    console.error('Error delete:', err);
    res.status(500).json({ error: 'Server Error', message: err.message });
  }
});

module.exports = router;
