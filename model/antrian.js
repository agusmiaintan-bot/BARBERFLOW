const mongoose = require("mongoose");

/**
 * Skema data antrian barbershop
 */
const skemaAntrian = new mongoose.Schema({
    nomor: Number,
    nama: String,
    email: String,
    barber: String,
    status: {
        type: String,
        default: "menunggu"
    },
    waktuMasuk: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Antrian", skemaAntrian);
