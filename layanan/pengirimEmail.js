const nodemailer = require('nodemailer');

// Konfigurasi transporter email dengan error handling
let transporter;

/**
 * Initialize email transporter
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

transporter = initializeTransporter();

/**
 * Kirim email ke pelanggan dengan retry logic
 * @param {string} email - Email tujuan
 * @param {string} nama - Nama pelanggan
 * @param {number} nomor - Nomor antrian
 * @param {number} maxRetries - Maksimal retry
 */
async function kirimEmailPelanggan(email, nama, nomor, maxRetries = 2) {
    try {
        // Validasi email
        if (!email || email.trim() === '' || !transporter) {
            console.warn('⚠️  Email tidak valid atau transporter tidak tersedia, skip pengiriman');
            return { success: false, reason: 'invalid_email_or_transporter' };
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            console.warn('⚠️  Format email tidak valid:', email);
            return { success: false, reason: 'invalid_format' };
        }

        const isiEmail = {
            from: `"BARBERFLOW" <${process.env.EMAIL_PENGIRIM}>`,
            to: email.trim(),
            subject: '💈 Antrian Anda Dipanggil - BARBERFLOW',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background-color: #2c3e50; color: white; padding: 20px; border-radius: 5px 5px 0 0; }
                        .content { background-color: #ecf0f1; padding: 20px; border-radius: 0 0 5px 5px; }
                        .queue-number { font-size: 32px; font-weight: bold; color: #e74c3c; text-align: center; margin: 20px 0; }
                        .footer { font-size: 12px; color: #7f8c8d; text-align: center; margin-top: 20px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h2 style="margin: 0;">BARBERFLOW</h2>
                            <p style="margin: 5px 0 0 0;">Sistem Antrian Barbershop</p>
                        </div>
                        <div class="content">
                            <p>Halo <strong>${nama}</strong>,</p>
                            <p>Antrian Anda sedang dipanggil:</p>
                            <div class="queue-number">NOMOR ${nomor}</div>
                            <p style="text-align: center; font-size: 16px;">
                                ✨ Silakan menuju kursi barber sekarang ✨
                            </p>
                            <hr style="border: none; border-top: 1px solid #bdc3c7;">
                            <div class="footer">
                                <p>Email ini dikirim otomatis oleh sistem BARBERFLOW</p>
                                <p>Jangan reply email ini</p>
                            </div>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        let attempt = 0;
        let lastError;

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
                
                // Wait before retry
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
 * Kirim notifikasi admin
 * @param {string} subjek - Subjek email
 * @param {string} pesan - Isi pesan
 */
async function kirimEmailAdmin(subjek, pesan) {
    try {
        if (!transporter) {
            console.warn('⚠️  Transporter tidak tersedia');
            return { success: false };
        }

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

module.exports = { 
    kirimEmailPelanggan,
    kirimEmailAdmin,
    transporter
};
