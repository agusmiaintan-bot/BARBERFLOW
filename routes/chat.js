
// Import express dan inisialisasi router
const express = require('express');
const router = express.Router();
// Import model Chat untuk operasi database chat
const Chat = require('../model/Chat');

/**
 * Endpoint USER kirim pesan ke chat
 * POST /api/chat/user
 */
router.post('/user', async (req, res) => {
  const { room_id, nama, message } = req.body;


  // Validasi input wajib
  if (!room_id || !message) {
    return res.status(400).json({ error: 'room_id dan message wajib diisi' });
  }


  // Simpan pesan user ke database
  const chat = await Chat.create({
    room_id,
    sender: 'user',
    nama,
    message
  });


  // Kirim response sukses ke client
  res.status(201).json({
    success: true,
    data: chat
  });
});

/**
 * Endpoint ADMIN kirim pesan ke chat
 * POST /api/chat/admin
 */
router.post('/admin', async (req, res) => {
  const { room_id, message } = req.body;


  // Validasi input wajib
  if (!room_id || !message) {
    return res.status(400).json({ error: 'room_id dan message wajib diisi' });
  }


  // Simpan pesan admin ke database
  const chat = await Chat.create({
    room_id,
    sender: 'admin',
    message
  });


  // Kirim response sukses ke client
  res.status(201).json({
    success: true,
    data: chat
  });
});

/**
 * Endpoint untuk mengambil chat berdasarkan room
 * GET /api/chat/:room_id
 */
router.get('/:room_id', async (req, res) => {

  // Query chat dari database berdasarkan room_id
  const chats = await Chat.find({ room_id: req.params.room_id })
    .sort({ createdAt: 1 });

  res.json({
    success: true,
    data: chats
  });
});

/**
 * Admin lihat semua room
 * GET /api/chat
 */
router.get('/', async (req, res) => {
  const rooms = await Chat.aggregate([
    {
      $group: {
        _id: '$room_id',
        lastMessage: { $last: '$message' },
        lastTime: { $last: '$createdAt' }
      }
    },
    { $sort: { lastTime: -1 } }
  ]);

  res.json({
    success: true,
    data: rooms
  });
});

module.exports = router;
