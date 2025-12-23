
// Import library nodemailer untuk mengirim email via SMTP
const nodemailer = require('nodemailer');


// Variabel transporter untuk koneksi email
// Akan diinisialisasi dengan konfigurasi SMTP
let transporter;


/**
 * Inisialisasi transporter email (koneksi ke SMTP server)
 * Menggunakan email dan password dari environment variable
 */
function initializeTransporter() {
    if (!process.env.EMAIL_PENGIRIM || !process.env.PASSWORD_EMAIL) {
        console.warn('⚠️  Email credentials not configured');
        return null;
    }

    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_PENGIRIM,
            pass: process.env.PASSWORD_EMAIL
        }
    });
}


// Inisialisasi transporter saat file dijalankan
transporter = initializeTransporter();


/**
 * Fungsi untuk mengirim email ke pelanggan ketika antrian dipanggil
 * Terdapat retry logic jika pengiriman gagal
 * @param {string} email - Email tujuan
 * @param {string} nama - Nama pelanggan
 * @param {number} nomor - Nomor antrian
 * @param {number} maxRetries - Maksimal percobaan ulang
 */
async function kirimEmailPelanggan(email, nama, nomor, maxRetries = 2) {
    try {
        // Validasi email dan transporter
        if (!email || email.trim() === '' || !transporter) {
            console.warn('⚠️  Email tidak valid atau transporter tidak tersedia, skip pengiriman');
            return { success: false, reason: 'invalid_email_or_transporter' };
        }

        // Validasi format email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            console.warn('⚠️  Format email tidak valid:', email);
            return { success: false, reason: 'invalid_format' };
        }

        // Membuat isi email HTML
        const isiEmail = {
            from: `"BARBERFLOW" <${process.env.EMAIL_PENGIRIM}>`,
            to: email.trim(),
            subject: '💈 Antrian Anda Dipanggil - BARBERFLOW',
            html: `...HTML email...`
        };

        let attempt = 0;
        let lastError;

        // Coba kirim email, retry jika gagal
        while (attempt < maxRetries) {
            try {
                const info = await transporter.sendMail(isiEmail);
                console.log('📧 Email terkirim ke:', email, 'Message ID:', info.messageId);
                return { success: true, messageId: info.messageId };
            } catch (error) {
                lastError = error;
                attempt++;
                console.warn(`⚠️  Retry ${attempt}/${maxRetries} - Error mengirim email:`, error.message);
                // Jangan retry jika error adalah masalah kredensial
                if (error.message.includes('Invalid login') || error.message.includes('Authentication failed')) {
                    break;
                }
                // Tunggu sebelum retry
                if (attempt < maxRetries) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }
        }

        console.error('❌ Gagal kirim email setelah beberapa percobaan:', lastError?.message);
        return { success: false, reason: 'send_failed', error: lastError?.message };
    } catch (error) {
        console.error('❌ Error dalam kirimEmailPelanggan:', error.message);
        return { success: false, reason: 'unexpected_error', error: error.message };
    }
}


/**
 * Fungsi untuk mengirim email notifikasi ke admin
 * @param {string} subjek - Subjek email
 * @param {string} pesan - Isi pesan
 */
async function kirimEmailAdmin(subjek, pesan) {
    try {
        if (!transporter) {
            console.warn('⚠️  Transporter tidak tersedia');
            return { success: false };
        }

        // Membuat isi email untuk admin
        const isiEmail = {
            from: `"BARBERFLOW System" <${process.env.EMAIL_PENGIRIM}>`,
            to: process.env.EMAIL_PENGIRIM,
            subject: `[ADMIN] ${subjek}`,
            text: pesan
        };

        const info = await transporter.sendMail(isiEmail);
        console.log('📧 Email admin terkirim, Message ID:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Gagal kirim email admin:', error.message);
        return { success: false, error: error.message };
    }
}


// Mengekspor fungsi-fungsi utama untuk digunakan di file lain
module.exports = { 
    kirimEmailPelanggan,
    kirimEmailAdmin,
    transporter
};
