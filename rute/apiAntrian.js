const express = require("express");
const router = express.Router();
const Antrian = require("../model/antrian");

// Parse JSON bodies with extended options
router.use(express.json({ limit: '50mb' }));
router.use(express.urlencoded({ limit: '50mb', extended: true }));

// Tambah antrian
router.post("/tambah", async (req, res) => {
    try {
        const io = req.app.get("io");

        const jumlah = await Antrian.countDocuments();

        const antrianBaru = new Antrian({
            nomor: jumlah + 1,
            nama: req.body.nama,
            email: req.body.email,
            barber: req.body.barber
        });

        await antrianBaru.save();

        // 🔥 BROADCAST KE SEMUA CLIENT
        io.emit("antrian-baru", antrianBaru);

        

        res.json({
            sukses: true,
            pesan: "Antrian berhasil ditambahkan",
            data: antrianBaru
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ sukses: false });
    }
});

module.exports = router;
