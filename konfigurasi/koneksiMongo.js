// File ini bertugas menghubungkan aplikasi dengan MongoDB
const mongoose = require("mongoose");

function koneksiMongo() {
    mongoose.connect(process.env.MONGO_URI)
        .then(() => {
            console.log("✅ MongoDB terhubung");
        })
        .catch((error) => {
            console.log("❌ Gagal koneksi MongoDB:", error);
        });
}

module.exports = koneksiMongo;
