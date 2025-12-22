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

/* ================= SOCKET.IO ================= */
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

aplikasi.set("io", io);

/* ================= MIDDLEWARE ================= */
aplikasi.use(cors());
aplikasi.use(express.json());
aplikasi.use(express.urlencoded({ extended: true }));

aplikasi.use(express.static("public"));
aplikasi.use(express.static(path.join(__dirname, "public")));

// inject socket ke request
aplikasi.use((req, res, next) => {
  req.io = io;
  next();
});

/* ================= DATABASE ================= */
koneksiMongo();

/* ================= ROUTE ROOT ================= */
aplikasi.get("/", (req, res) => {
  res.status(200).send("🚀 Barberflow API is running");
});

/* ================= API ROUTES ================= */
aplikasi.use("/api/antrian", require("./rute/apiAntrian"));

/* ================= PANGGIL ANTRIAN ================= */
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
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

/* ================= SOCKET HANDLER ================= */
require("./socket/socketAntrian")(io);

/* ================= START SERVER ================= */
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 BARBERFLOW berjalan di port ${PORT}`);
});
