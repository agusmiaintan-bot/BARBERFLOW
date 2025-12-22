const { Schema, model, models } = require('mongoose');

const pelangganSchema = new Schema({
    nama: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    nomor_telepon: {
        type: String,
        sparse: true
    },
    alamat: {
        type: String,
        sparse: true
    },
    status: {
        type: String,
        enum: ['aktif', 'inaktif'],
        default: 'aktif'
    },
    tanggal_daftar: {
        type: Date,
        default: Date.now,
        index: true
    },
    updated_at: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Index untuk pencarian
pelangganSchema.index({ nama: 'text', email: 'text' });

const Pelanggan = models.Pelanggan || model('Pelanggan', pelangganSchema);

module.exports = Pelanggan;
