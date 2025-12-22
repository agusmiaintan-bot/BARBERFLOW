const express = require('express');
const router = express.Router();
const Antrian = require('../model/antrian');

/**
 * POST /api/chatbot
 * Body: { message: "..." }
 */
router.post('/', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.json({ reply: 'Silakan ketik pesan 🙂' });
    }

    const text = message.toLowerCase();

    // =========================
    // HELP
    // =========================
    if (text.includes('help')) {
      return res.json({
        reply: `
🤖 *BarberFlow Bot*
Perintah yang bisa kamu gunakan:
- antrian sekarang
- nomor terakhir
- tambah antrian nama [nama]
- cek antrian saya [nama]
- panggil antrian berikutnya
- batalkan antrian [nama]
        `
      });
    }

    // =========================
    // CEK ANTRIAN TERAKHIR
    // =========================
    if (
      text.includes('antrian sekarang') ||
      text.includes('nomor terakhir')
    ) {
      const last = await Antrian.findOne().sort({ nomor: -1 });
      return res.json({
        reply: last
          ? `📢 Antrian saat ini nomor ${last.nomor} (${last.nama_pelanggan})`
          : 'Belum ada antrian.'
      });
    }

    // =========================
    // TAMBAH ANTRIAN
    // =========================
    if (text.includes('tambah antrian')) {
      const nama = text.replace('tambah antrian', '').replace('nama', '').trim();

      if (!nama) {
        return res.json({
          reply: '❗ Contoh: *tambah antrian nama Intan*'
        });
      }

      const last = await Antrian.findOne().sort({ nomor: -1 });
      const nomorBaru = last ? last.nomor + 1 : 1;

      const newData = await Antrian.create({
        nomor: nomorBaru,
        nama_pelanggan: nama,
        status: 'menunggu'
      });

      return res.json({
        reply: `✅ Antrian berhasil ditambahkan!\nNama: ${newData.nama_pelanggan}\nNomor: ${newData.nomor}`
      });
    }

    // =========================
    // CEK ANTRIAN SAYA
    // =========================
    if (text.includes('cek antrian saya')) {
      const nama = text.replace('cek antrian saya', '').trim();

      const data = await Antrian.findOne({
        nama_pelanggan: new RegExp(nama, 'i'),
        status: { $ne: 'selesai' }
      });

      return res.json({
        reply: data
          ? `⏳ ${data.nama_pelanggan}, kamu di antrian nomor ${data.nomor} (status: ${data.status})`
          : '❌ Antrian tidak ditemukan.'
      });
    }

    // =========================
    // PANGGIL ANTRIAN BERIKUTNYA
    // =========================
    if (text.includes('panggil antrian')) {
      const next = await Antrian.findOne({ status: 'menunggu' }).sort({ nomor: 1 });

      if (!next) {
        return res.json({ reply: 'Tidak ada antrian menunggu.' });
      }

      next.status = 'dilayani';
      await next.save();

      return res.json({
        reply: `📣 Memanggil antrian nomor ${next.nomor} (${next.nama_pelanggan})`
      });
    }

    // =========================
    // BATALKAN ANTRIAN
    // =========================
    if (text.includes('batalkan antrian')) {
      const nama = text.replace('batalkan antrian', '').trim();

      const data = await Antrian.findOneAndUpdate(
        { nama_pelanggan: new RegExp(nama, 'i'), status: 'menunggu' },
        { status: 'batal' },
        { new: true }
      );

      return res.json({
        reply: data
          ? `❌ Antrian atas nama ${data.nama_pelanggan} dibatalkan.`
          : 'Antrian tidak ditemukan atau sudah diproses.'
      });
    }

    // =========================
    // DEFAULT
    // =========================
    return res.json({
      reply: '🤖 Maaf, saya belum mengerti. Ketik *help* untuk bantuan.'
    });

  } catch (error) {
    console.error(error);
    return res.json({
      reply: '⚠️ Terjadi kesalahan pada server.'
    });
  }
});

module.exports = router;
