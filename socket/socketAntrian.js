const Antrian = require("../model/antrian");
const { kirimEmailPelanggan } = require("../layanan/pengirimEmail");

module.exports = function (io) {
    io.on("connection", (socket) => {
        console.log("🟢 Client terhubung:", socket.id);

        // Bergabung ke room spesifik (misalnya pelanggan-7)
        socket.on("gabung-room", (room) => {
            if (!room || typeof room !== "string") return;
            socket.join(room);
            console.log(`👥 ${socket.id} bergabung ke room: ${room}`);
        });

        // Admin join ke admin-room untuk terima chat dari pelanggan
        socket.on("gabung-admin-room", () => {
            socket.join("admin-room");
            console.log(`👨‍💼 ${socket.id} bergabung ke admin-room`);
        });

        // Model chat (disarankan di top-level, namun mengikuti instruksi)
        const Chat = require("../model/ModelChat");

        socket.on("ambil-antrian", async () => {
            const daftar = await Antrian.find({ status: "menunggu" }).sort("nomor");
            socket.emit("data-antrian", daftar);
        });

        socket.on("panggil-antrian", async () => {
            const antrian = await Antrian.findOneAndUpdate(
                { status: "menunggu" },
                { status: "dipanggil" },
                { new: true }
            );

            if (antrian) {
                // 🔔 Kirim email ke pelanggan
                if (antrian.email) {
                    await kirimEmailPelanggan(
                        antrian.email,
                        antrian.nama,
                        antrian.nomor
                    );
                }

                // 🔥 Broadcast ke semua client
                io.emit("antrian-dipanggil", antrian);
            }
        });

        // 💬 Chatbot pelanggan
        socket.on("chat-pelanggan", async (pesan) => {
            let balasan = "Maaf, saya belum paham 😅";

            const teks = String(pesan || "").toLowerCase();

            if (teks.includes("antrian")) {
                const jumlah = await Antrian.countDocuments({ status: "menunggu" });
                balasan = `Saat ini ada ${jumlah} antrian yang menunggu.`;
            }

            else if (teks.includes("nomor")) {
                const dipanggil = await Antrian.findOne({ status: "dipanggil" }).sort("-waktuMasuk");
                balasan = dipanggil
                    ? `Nomor yang sedang dipanggil adalah ${dipanggil.nomor}.`
                    : "Belum ada antrian yang dipanggil.";
            }

            else if (teks.includes("lama") || teks.includes("waktu")) {
                const jumlah = await Antrian.countDocuments({ status: "menunggu" });
                balasan = `Perkiraan waktu tunggu ± ${jumlah * 10} menit.`;
            }

            else if (teks.includes("buka")) {
                balasan = "Barbershop buka setiap hari pukul 09.00 - 21.00.";
            }

            else if (teks.includes("alamat")) {
                balasan = "Kami berlokasi di Padang, dekat Universitas Negeri Padang.";
            }

            socket.emit("balasan-bot", balasan);
        });

        // ===== Chat pelanggan ↔ admin (PRIVATE via room) =====
        // pesan dari pelanggan ke admin, diteruskan ke admin-room
        socket.on("chat-ke-admin", async ({ room, pesan }) => {
            if (!room || typeof room !== "string") return;
            const data = { pengirim: "pelanggan", pesan };
            await Chat.create(data);
            // Emit ke admin clients di admin-room, include room info
            io.to("admin-room").emit("chat-admin", { room, pesan });
        });

        // balasan dari admin ke pelanggan (PRIVATE via room)
        socket.on("balas-ke-pelanggan", async ({ room, pesan }) => {
            if (!room || typeof room !== "string") return;
            const data = { pengirim: "admin", pesan };
            await Chat.create(data);
            io.to(room).emit("chat-pelanggan", { pesan });
        });

        socket.on("disconnect", () => {
            console.log("🔴 Client keluar");
        });
    });
};
