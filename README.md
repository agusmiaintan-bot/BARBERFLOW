# BARBERFLOW - Backend API

Sistem antrian barbershop modern dengan backend Node.js + Express + MongoDB

## 📋 Requirements

- Node.js 18.x atau lebih tinggi
- MongoDB (cloud atau local)
- Gmail dengan App Password (untuk fitur email)

## 🚀 Instalasi & Setup Lokal

### 1. Clone/Download Repository
```bash
cd BARBERFLOW
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Buat file `.env` di root folder dengan referensi dari `.env.example`:
```bash
cp .env.example .env
```

Edit `.env` dengan konfigurasi Anda:
```env
PORT=3001
NODE_ENV=development
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/barberflow
EMAIL_PENGIRIM=your-email@gmail.com
PASSWORD_EMAIL=your-app-password
```

**⚠️ PENTING untuk Gmail:**
- Aktifkan 2-Step Verification di akun Google
- Generate App Password: https://myaccount.google.com/apppasswords
- Gunakan App Password (bukan password akun Google) di `PASSWORD_EMAIL`

### 4. Run Development Server
```bash
npm run dev
```

Server akan berjalan di `http://localhost:3001`

### 5. Check Health
```bash
curl http://localhost:3001/api/health
```

## 📦 Deploy ke Vercel

### 1. Push ke GitHub
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### 2. Deploy ke Vercel
- Masuk ke https://vercel.com
- Click "New Project"
- Import repository GitHub
- Set Environment Variables:
  - `MONGO_URI`: MongoDB connection string
  - `EMAIL_PENGIRIM`: Email Gmail Anda
  - `PASSWORD_EMAIL`: App Password Gmail Anda
  - `NODE_ENV`: production
- Click Deploy

### 3. Verifikasi Deployment
```bash
curl https://your-project.vercel.app/api/health
```

## 🔌 API Endpoints

### Antrian Management

#### GET /api/antrian
Lihat semua antrian dengan pagination & filtering

**Query Parameters:**
- `status`: Filter by status (menunggu, dilayani, selesai, batal)
- `skip`: Offset (default: 0)
- `limit`: Jumlah data (default: 100)

**Response:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "total": 10,
    "skip": 0,
    "limit": 100
  }
}
```

#### GET /api/antrian/:id
Lihat detail antrian spesifik

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "nomor": 1,
    "nama_pelanggan": "John Doe",
    "status": "menunggu",
    "created_at": "2024-01-01T12:00:00Z"
  }
}
```

#### POST /api/antrian/add atau /api/antrian/tambah
Tambah antrian baru

**Request Body:**
```json
{
  "nama": "John Doe",
  "email": "john@example.com",
  "barber": "Ahmad",
  "layanan": "Potong Rambut"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Antrian berhasil ditambahkan",
  "data": {
    "_id": "...",
    "nomor": 1,
    "nama_pelanggan": "John Doe",
    "status": "menunggu",
    "created_at": "2024-01-01T12:00:00Z"
  }
}
```

#### PATCH /api/antrian/:id
Update status antrian

**Request Body:**
```json
{
  "status": "dilayani"
}
```

**Valid Status:** `menunggu`, `dilayani`, `selesai`, `batal`

#### PUT /api/antrian/:id
Update data antrian lengkap

**Request Body:**
```json
{
  "nama_pelanggan": "John Doe",
  "email": "john@example.com",
  "barber": "Ahmad",
  "layanan": "Potong Rambut",
  "status": "dilayani"
}
```

#### DELETE /api/antrian/:id
Hapus antrian

**Response:**
```json
{
  "success": true,
  "message": "Antrian berhasil dihapus",
  "data": {...}
}
```

## ⚙️ File Structure

```
BARBERFLOW/
├── api/                          # Serverless API functions (untuk Vercel)
│   └── antrian/
│       ├── index.js             # GET handler
│       └── tambah.js            # POST handler
├── konfigurasi/
│   └── koneksiMongo.js          # MongoDB connection utility
├── layanan/
│   ├── botAntrian.js            # Bot logic
│   └── pengirimEmail.js         # Email service
├── model/
│   ├── antrian.js               # Antrian schema
│   ├── ModelChat.js             # Chat model
│   └── pelanggan.js             # Customer model
├── public/                       # Static files
│   ├── admin.html               # Admin dashboard
│   ├── layar.html               # Display screen
│   └── pelanggan.html           # Customer page
├── rute/                         # Alternative routing
│   └── apiAntrian.js
├── routes/
│   └── antrian.js               # Express routes (MAIN)
├── socket/
│   └── socketAntrian.js         # WebSocket logic
├── server.js                     # Main server file
├── vercel.json                   # Vercel configuration
├── package.json                  # Dependencies
├── .env                          # Environment variables (local only)
├── .env.example                  # Template untuk .env
├── .gitignore                    # Git ignore rules
└── README.md                     # Dokumentasi ini
```

## 🔒 Security Best Practices

1. **Environment Variables**
   - Jangan commit `.env` ke repository
   - Gunakan `.env.example` sebagai template
   - Set semua variables di Vercel dashboard

2. **MongoDB**
   - Gunakan connection string yang aman
   - Enable IP whitelist di MongoDB Atlas
   - Gunakan database user dengan permission minimal

3. **Email Credentials**
   - Gunakan Gmail App Password (bukan password utama)
   - Aktifkan 2-Step Verification
   - Jangan share credentials

4. **API Security**
   - Implement rate limiting (future)
   - Validate all inputs
   - Use HTTPS only (Vercel default)
   - CORS configured untuk production

## 🧪 Testing

### Health Check
```bash
curl http://localhost:3001/api/health
```

### Create Queue
```bash
curl -X POST http://localhost:3001/api/antrian/tambah \
  -H "Content-Type: application/json" \
  -d '{
    "nama": "Test User",
    "email": "test@example.com",
    "barber": "Ahmad"
  }'
```

### Get All Queues
```bash
curl http://localhost:3001/api/antrian
```

## 🐛 Troubleshooting

### MongoDB Connection Error
- Verifikasi MONGO_URI di .env
- Check IP whitelist di MongoDB Atlas
- Pastikan database user memiliki akses yang tepat

### Email Tidak Terkirim
- Verifikasi EMAIL_PENGIRIM dan PASSWORD_EMAIL
- Gunakan App Password, bukan password Google
- Check Gmail "Less secure app" settings (jika applicable)

### Vercel Deployment Gagal
- Check build logs di Vercel dashboard
- Verifikasi semua environment variables
- Pastikan Node.js version compatible (18.x)

## 📚 Resources

- [Express.js Docs](https://expressjs.com/)
- [MongoDB Mongoose](https://mongoosejs.com/)
- [Vercel Deployment Guide](https://vercel.com/docs)
- [Nodemailer Docs](https://nodemailer.com/)

## 📝 License

MIT

## 👨‍💻 Author

BARBERFLOW Development Team

---

**Last Updated:** December 2024
