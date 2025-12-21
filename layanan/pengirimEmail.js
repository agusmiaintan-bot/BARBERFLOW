const nodemailer = require("nodemailer");

// Konfigurasi transporter email
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_PENGIRIM,
        pass: process.env.PASSWORD_EMAIL
    }
});

// Fungsi kirim email ke pelanggan
async function kirimEmailPelanggan(email, nama, nomor) {
    try {
        // Validasi email
        if (!email || email.trim() === "") {
            console.warn("⚠️  Email tidak valid, skip pengiriman");
            return;
        }

        const isiEmail = {
            from: `"BARBERFLOW" <${process.env.EMAIL_PENGIRIM}>`,
            to: email,
            subject: "Antrian Anda Dipanggil 💈",
            html: `
                <h2>Halo ${nama},</h2>
                <p>Antrian <b>nomor ${nomor}</b> sedang dipanggil.</p>
                <p>Silakan menuju kursi barber.</p>
                <br>
                <small>BARBERFLOW – Sistem Antrian Barbershop</small>
            `
        };

        await transporter.sendMail(isiEmail);
        console.log("📧 Email terkirim ke:", email);
    } catch (error) {
        console.error("❌ Gagal kirim email:", error.message);
    }
}

module.exports = { kirimEmailPelanggan };
