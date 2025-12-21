const mongoose = require("mongoose");

// Menyimpan data pelanggan barbershop
const PelangganSchema = new mongoose.Schema({
    namaPelanggan: {
        type: String,
        required: true
    },
    emailPelanggan: {
        type: String,
        required: true
    },
    waktuDaftar: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Pelanggan", PelangganSchema);
