const Antrian = require("../model/antrian");
const Chat = require("../model/chat");
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

        socket.on("ambil-antrian", async () => {
            try {
                const daftar = await Antrian.find({ status: "menunggu" })
                    .sort({ nomor: 1 });
                socket.emit("data-antrian", daftar);
            } catch (error) {
                console.error("❌ Error ambil antrian:", error);
                socket.emit("error", { message: "Gagal mengambil data antrian" });
            }
        });

        socket.on("panggil-antrian", async () => {
            try {
                const antrian = await Antrian.findOneAndUpdate(
                    { status: "menunggu" },
                    { status: "dilayani", updated_at: Date.now() },
                    { new: true, sort: { nomor: 1 } }
                );

                if (antrian) {
                    // 🔔 Kirim email ke pelanggan jika ada
                    if (antrian.email) {
                        try {
                            await kirimEmailPelanggan(
                                antrian.email,
                                antrian.nama_pelanggan,
                                antrian.nomor
                            );
                        } catch (emailError) {
                            console.error("⚠️ Error kirim email:", emailError.message);
                        }
                    }

                    // 🔥 Broadcast ke semua client
                    io.emit("antrian-dipanggil", antrian);
                } else {
                    socket.emit("info", { message: "Tidak ada antrian yang menunggu" });
                }
            } catch (error) {
                console.error("❌ Error panggil antrian:", error);
                socket.emit("error", { message: "Gagal memanggil antrian" });
            }
        });

        // 📢 Broadcast antrian baru ke semua client
        socket.on("tambah-antrian", async (data) => {
            try {
                io.emit("antrian-baru", data);
            } catch (error) {
                console.error("❌ Error broadcast antrian baru:", error);
            }
        });

        // 💬 Chatbot pelanggan
        socket.on("chat-pelanggan", async (pesan) => {
            try {
                let balasan = "Maaf, saya belum paham 😅";

                const teks = String(pesan || "").toLowerCase();

                if (teks.includes("antrian")) {
                    const jumlah = await Antrian.countDocuments({ status: "menunggu" });
                    balasan = `Saat ini ada ${jumlah} antrian yang menunggu.`;
                }
                else if (teks.includes("nomor") || teks.includes("dipanggil")) {
                    const dipanggil = await Antrian.findOne({ status: "dilayani" })
                        .sort({ updated_at: -1 });
                    balasan = dipanggil
                        ? `Nomor yang sedang dipanggil adalah ${dipanggil.nomor} (${dipanggil.nama_pelanggan}).`
                        : "Belum ada antrian yang dipanggil.";
                }
                else if (teks.includes("lama") || teks.includes("waktu")) {
                    const jumlah = await Antrian.countDocuments({ status: "menunggu" });
                    balasan = `Perkiraan waktu tunggu ± ${jumlah * 10} menit.`;
                }
                else if (teks.includes("buka") || teks.includes("jam")) {
                    balasan = "Barbershop buka setiap hari pukul 09.00 - 21.00.";
                }
                else if (teks.includes("alamat") || teks.includes("lokasi")) {
                    balasan = "Kami berlokasi di Padang, dekat Universitas Negeri Padang.";
                }
                else if (teks.includes("halo") || teks.includes("hai") || teks.includes("hi")) {
                    balasan = "Halo! Selamat datang di BARBERFLOW. Ada yang bisa saya bantu?";
                }

                socket.emit("balasan-bot", balasan);
            } catch (error) {
                console.error("❌ Error chatbot:", error);
                socket.emit("balasan-bot", "Maaf, terjadi kesalahan sistem.");
            }
        });

        // ===== Chat pelanggan ↔ admin (PRIVATE via room) =====
        // pesan dari pelanggan ke admin, diteruskan ke admin-room
        socket.on("chat-ke-admin", async ({ room, pesan }) => {
            try {
                if (!room || typeof room !== "string") return;
                
                const chatData = {
                    room_id: room,
                    sender: "user",
                    message: pesan,
                    read: false
                };
                
                await Chat.create(chatData);
                
                // Emit ke admin clients di admin-room, include room info
                io.to("admin-room").emit("chat-admin", { room, pesan });
                console.log(`💬 Pesan dari ${room} ke admin: ${pesan}`);
            } catch (error) {
                console.error("❌ Error chat ke admin:", error);
            }
        });

        // balasan dari admin ke pelanggan (PRIVATE via room)
        socket.on("balas-ke-pelanggan", async ({ room, pesan }) => {
            try {
                if (!room || typeof room !== "string") return;
                
                const chatData = {
                    room_id: room,
                    sender: "admin",
                    message: pesan,
                    read: true
                };
                
                await Chat.create(chatData);
                
                // Kirim ke room pelanggan spesifik
                io.to(room).emit("chat-pelanggan", { pesan });
                console.log(`💬 Balasan admin ke ${room}: ${pesan}`);
            } catch (error) {
                console.error("❌ Error balas ke pelanggan:", error);
            }
        });

        socket.on("disconnect", () => {
            console.log("🔴 Client keluar:", socket.id);
        });
    });
};
