const mongoose = require('mongoose');
const Antrian = require('../../model/antrian');

// MongoDB connection
let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
            maxPoolSize: 10,
        };

        cached.promise = mongoose.connect(process.env.MONGO_URI, opts)
            .then((mongoose) => {
                return mongoose;
            });
    }

    cached.conn = await cached.promise;
    return cached.conn;
}

// Handler untuk tambah antrian
module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        await connectDB();

        const { nama, nama_pelanggan, email, barber, layanan } = req.body;
        const nama_final = nama || nama_pelanggan;

        if (!nama_final || nama_final.trim() === '') {
            return res.status(400).json({ error: 'Nama pelanggan wajib diisi' });
        }

        // Generate nomor antrian otomatis
        const lastAntrian = await Antrian.findOne().sort({ nomor: -1 });
        const nomorBaru = lastAntrian ? lastAntrian.nomor + 1 : 1;

        const newAntrian = await Antrian.create({
            nomor: nomorBaru,
            nama_pelanggan: nama_final.trim(),
            email: email?.trim() || '',
            barber: barber?.trim() || '',
            layanan: layanan?.trim() || '',
            status: 'menunggu'
        });

        return res.status(201).json({
            success: true,
            message: 'Antrian berhasil ditambahkan',
            data: newAntrian
        });
    } catch (error) {
        console.error('Error tambah antrian:', error);
        return res.status(500).json({ error: error.message });
    }
};
