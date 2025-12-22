const mongoose = require('mongoose');

// Model Antrian
const antrianSchema = new mongoose.Schema({
    nomor: { type: Number, required: true },
    nama: { type: String, required: true },
    email: { type: String },
    barber: { type: String },
    status: { type: String, default: 'menunggu' },
    created_at: { type: Date, default: Date.now }
});

const Antrian = mongoose.models.Antrian || mongoose.model('Antrian', antrianSchema);

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
        };

        cached.promise = mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/barberflow', opts)
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

        const { nama, email, barber } = req.body;

        if (!nama) {
            return res.status(400).json({ error: 'Nama pelanggan wajib diisi' });
        }

        // Generate nomor antrian otomatis
        const lastAntrian = await Antrian.findOne().sort({ nomor: -1 });
        const nomorBaru = lastAntrian ? lastAntrian.nomor + 1 : 1;

        const newAntrian = await Antrian.create({
            nomor: nomorBaru,
            nama: nama,
            email: email || '',
            barber: barber || '',
            status: 'menunggu'
        });

        return res.status(201).json({
            pesan: 'Antrian berhasil ditambahkan',
            data: newAntrian
        });
    } catch (error) {
        console.error('Error tambah antrian:', error);
        return res.status(500).json({ error: error.message });
    }
};
