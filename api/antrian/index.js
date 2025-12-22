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

        // GET - Lihat semua antrian dengan pagination & filter
        if (req.method === 'GET') {
            const { status, skip = 0, limit = 100 } = req.query;
            const filter = status ? { status } : {};

            const data = await Antrian.find(filter)
                .sort({ created_at: -1 })
                .skip(parseInt(skip))
                .limit(parseInt(limit));

            const total = await Antrian.countDocuments(filter);

            return res.status(200).json({
                success: true,
                data,
                pagination: { total, skip: parseInt(skip), limit: parseInt(limit) }
            });
        }

        // Metode lain tidak didukung di endpoint ini
        res.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
};
