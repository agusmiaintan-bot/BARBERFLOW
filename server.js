require("dotenv").config();

const express = require("express");
const http = require("http");
const cors = require("cors");
const path = require("path");

const koneksiMongo = require("./konfigurasi/koneksiMongo");
const { kirimEmailPelanggan } = require("./layanan/pengirimEmail");
const Antrian = require("./model/antrian");

const aplikasi = express();
const server = http.createServer(aplikasi);

// Socket.io
const { Server } = require("socket.io");
const io = new Server(server, {
    cors: { origin: "*" }
});

aplikasi.set("io", io);

// Middleware
aplikasi.use(cors());
aplikasi.use(express.json());
aplikasi.use(express.static("public"));
aplikasi.use(express.static(path.join(__dirname, "public")));

// Inject io instance into each request for routes needing socket emits
aplikasi.use((req, res, next) => {
    req.io = io;
    next();
});

// Koneksi database
koneksiMongo();

// Rute API
aplikasi.use("/api/antrian", require("./rute/apiAntrian"));

// Panggil antrian dan broadcast via socket
aplikasi.post("/panggil-antrian", async (req, res) => {
    try {
        const antrianDipanggil = await Antrian.findOneAndUpdate(
            { status: "menunggu" },
            { status: "dipanggil" },
            { sort: { nomor: 1 }, new: true }
        );

        if (!antrianDipanggil) {
            return res.json({ pesan: "Tidak ada antrian menunggu" });
        }

        // Kirim ke SEMUA client via socket
        io.emit("antrian-dipanggil", {
            nomor: antrianDipanggil.nomor,
            nama: antrianDipanggil.nama,
            barber: antrianDipanggil.barber
        });

        res.json({
            pesan: "Antrian berhasil dipanggil",
            data: antrianDipanggil
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Socket
require("./socket/socketAntrian")(io);

// Menjalankan server (Render uses PORT env; fallback local 3000)
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🚀 BARBERFLOW berjalan di port ${PORT}`);
});
