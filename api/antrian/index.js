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

// Handler utama
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

    try {
        await connectDB();

        // GET - Lihat semua antrian
        if (req.method === 'GET') {
            const data = await Antrian.find().sort({ created_at: 1 });
            return res.status(200).json(data);
        }

        // Metode lain tidak didukung di endpoint ini
        res.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
};
