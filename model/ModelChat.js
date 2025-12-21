const mongoose = require("mongoose");

const skemaChat = new mongoose.Schema({
    pengirim: String, // pelanggan / admin
    pesan: String,
    waktu: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Chat", skemaChat);
