const express = require('express');
const router = express.Router();
const Chat = require('../model/Chat');

/**
 * USER kirim pesan
 * POST /api/chat/user
 */
router.post('/user', async (req, res) => {
  const { room_id, nama, message } = req.body;

  if (!room_id || !message) {
    return res.status(400).json({ error: 'room_id dan message wajib diisi' });
  }

  const chat = await Chat.create({
    room_id,
    sender: 'user',
    nama,
    message
  });

  res.status(201).json({
    success: true,
    data: chat
  });
});

/**
 * ADMIN kirim pesan
 * POST /api/chat/admin
 */
router.post('/admin', async (req, res) => {
  const { room_id, message } = req.body;

  if (!room_id || !message) {
    return res.status(400).json({ error: 'room_id dan message wajib diisi' });
  }

  const chat = await Chat.create({
    room_id,
    sender: 'admin',
    message
  });

  res.status(201).json({
    success: true,
    data: chat
  });
});

/**
 * Ambil chat per room
 * GET /api/chat/:room_id
 */
router.get('/:room_id', async (req, res) => {
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
