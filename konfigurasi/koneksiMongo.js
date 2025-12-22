// Database connection utility
const mongoose = require('mongoose');

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

/**
 * Connect to MongoDB dengan caching untuk serverless environment
 * @returns {Promise} MongoDB connection
 */
async function connectDB() {
    if (cached.conn) {
        console.log('✅ Using cached MongoDB connection');
        return cached.conn;
    }

    if (!cached.promise) {
        const mongoUri = process.env.MONGO_URI;

        if (!mongoUri) {
            throw new Error('❌ MONGO_URI environment variable not set');
        }

        const opts = {
            bufferCommands: false,
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
        };

        console.log('📡 Connecting to MongoDB...');

        cached.promise = mongoose.connect(mongoUri, opts)
            .then(() => {
                console.log('✅ MongoDB connected successfully');
                return mongoose;
            })
            .catch((err) => {
                console.error('❌ MongoDB connection error:', err.message);
                throw err;
            });
    }

    try {
        cached.conn = await cached.promise;
        return cached.conn;
    } catch (error) {
        cached.promise = null;
        throw error;
    }
}

module.exports = { connectDB };
