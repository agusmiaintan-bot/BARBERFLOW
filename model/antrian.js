const { Schema, model, models } = require('mongoose');

const antrianSchema = new Schema({
    nomor: { 
        type: Number, 
        required: true, 
        unique: true, 
        index: true 
    },
    nama_pelanggan: { 
        type: String, 
        required: true 
    },
    email: { 
        type: String, 
        lowercase: true,
        sparse: true
    },
    layanan: { 
        type: String, 
        required: false 
    },
    barber: { 
        type: String, 
        sparse: true
    },
    status: { 
        type: String, 
        enum: ['menunggu', 'dilayani', 'selesai', 'batal'],
        default: 'menunggu',
        index: true
    },
    created_at: { 
        type: Date, 
        default: Date.now,
        index: true
    },
    updated_at: { 
        type: Date, 
        default: Date.now 
    }
}, { timestamps: true });

// Middleware untuk update timestamp
antrianSchema.pre('save', function(next) {
    this.updated_at = Date.now();
    next();
});

// Gunakan model yang sudah ada atau buat baru
const Antrian = models.Antrian || model('Antrian', antrianSchema);

module.exports = Antrian;
