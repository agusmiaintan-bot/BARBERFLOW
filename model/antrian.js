const { Schema, model } = require('mongoose');

const antrianSchema = new Schema({
    nama_pelanggan: { type: String, required: true },
    layanan: { type: String, required: true },
    status: { type: String, default: 'menunggu' },
    created_at: { type: Date, default: Date.now }
});

module.exports = model('Antrian', antrianSchema);
