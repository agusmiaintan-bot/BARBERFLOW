const express = require('express');
const router = express.Router();
const Antrian = require('../model/antrian');

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
    const data = await Antrian.findById(req.params.id);
    if (!data) {
      return res.status(404).json({ error: 'Not Found' });
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
    const { status } = req.body;
    const allowed = ['menunggu', 'dilayani', 'selesai', 'batal'];

    if (!allowed.includes(status)) {
      return res.status(400).json({
        error: 'Validation Error',
        message: `Status harus salah satu dari ${allowed.join(', ')}`
      });
    }

    const updated = await Antrian.findByIdAndUpdate(
      req.params.id,
      { status, updated_at: Date.now() },
      { new: true }
    );

    if (!updated) return res.status(404).json({ error: 'Not Found' });

    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ error: 'Server Error', message: err.message });
  }
});

/**
 * DELETE /api/antrian/:id
 */
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Antrian.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Not Found' });

    res.json({ success: true, data: deleted });
  } catch (err) {
    res.status(500).json({ error: 'Server Error', message: err.message });
  }
});

module.exports = router;
