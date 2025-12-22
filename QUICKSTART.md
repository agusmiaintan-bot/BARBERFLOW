# BARBERFLOW Backend - Quick Start Guide

## 🚀 Quick Setup (5 menit)

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Environment
Buat file `.env`:
```bash
cp .env.example .env
```

Edit `.env` dengan database credentials:
```env
PORT=3001
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/barberflow
EMAIL_PENGIRIM=your@gmail.com
PASSWORD_EMAIL=your-app-password
```

### 3. Run Development Server
```bash
npm run dev
```

Server running di `http://localhost:3001`

### 4. Test API
```bash
# Health check
curl http://localhost:3001/api/health

# Create queue
curl -X POST http://localhost:3001/api/antrian/tambah \
  -H "Content-Type: application/json" \
  -d '{
    "nama": "John Doe",
    "email": "john@example.com"
  }'

# Get all queues
curl http://localhost:3001/api/antrian
```

## 📚 API Documentation

See [README.md](README.md) for complete API documentation.

## 🔧 Project Structure

```
├── api/                    # Serverless API handlers
├── konfigurasi/           # Configuration files
├── layanan/               # Business logic services
├── model/                 # Mongoose schemas
├── public/                # Static files
├── routes/                # Express routes
├── socket/                # WebSocket handlers
└── server.js              # Main entry point
```

## 📖 Documentation Files

- [README.md](README.md) - Full documentation & API reference
- [DEPLOYMENT.md](DEPLOYMENT.md) - Vercel deployment guide
- [CHANGELOG.md](CHANGELOG.md) - Version history & changes
- [QUICKSTART.md](QUICKSTART.md) - This file

## 🚀 Deploy to Vercel

See [DEPLOYMENT.md](DEPLOYMENT.md) untuk langkah-langkah deployment.

Quick: `git push origin main` → Vercel auto-deploys

## 💡 Tips

- Use `.env.example` as reference
- Never commit `.env` file
- Check logs: `npm run dev` untuk development
- Production logs: Vercel dashboard → Deployments → Logs

## ❓ FAQ

**Q: Bagaimana cara reset nomor antrian?**
A: Hapus dokumen di MongoDB collection `antrians`

**Q: Email tidak terkirim?**
A: Check Gmail credentials, pastikan 2-Step Verification aktif

**Q: Database connection error?**
A: Verify MONGO_URI, check IP whitelist di MongoDB Atlas

Untuk Q&A lengkap, lihat [README.md](README.md#troubleshooting)

---

Butuh bantuan? Baca dokumentasi lengkap di README.md
