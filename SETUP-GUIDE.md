# 🚀 BARBERFLOW - Setup dan Testing Guide

## ✅ Status Sistem

### Socket.IO
- ✅ **INSTALLED** - Version 4.8.2
- ✅ **CONFIGURED** - Ready untuk real-time communication
- ✅ **HANDLERS SETUP** - Socket handlers sudah dikonfigurasi

### Database
- ⚠️ **CONFIGURED** - MongoDB connection setup sudah benar
- ⚠️ **PERLU KONFIGURASI** - Perlu whitelist IP di MongoDB Atlas

---

## 📋 Langkah Setup Database

### 1. **Konfigurasi MongoDB Atlas**

a. Login ke [MongoDB Atlas](https://cloud.mongodb.com/)
b. Pilih cluster Anda
c. Klik **Network Access** di menu kiri
d. Klik **Add IP Address**
e. Pilih salah satu:
   - **Allow Access from Anywhere**: `0.0.0.0/0` (untuk development)
   - **Add Current IP Address**: (untuk production)
f. Klik **Confirm**

### 2. **Update File .env**

Edit file `.env` dan isi dengan kredensial yang benar:

```env
# Database Configuration
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/barberflow?retryWrites=true&w=majority
```

Ganti:
- `username` dengan username MongoDB Atlas Anda
- `password` dengan password MongoDB Atlas Anda
- `cluster` dengan nama cluster Anda
- `barberflow` dengan nama database yang diinginkan

### 3. **Test Koneksi Ulang**

```bash
npm run test
```

---

## 🔌 Fitur Socket.IO yang Tersedia

### Client Events (Dari Client ke Server)

| Event | Deskripsi | Data |
|-------|-----------|------|
| `gabung-room` | Join ke room spesifik | `room: string` |
| `gabung-admin-room` | Join ke admin room | - |
| `ambil-antrian` | Request daftar antrian | - |
| `panggil-antrian` | Panggil antrian berikutnya | - |
| `tambah-antrian` | Broadcast antrian baru | `data: object` |
| `chat-pelanggan` | Kirim pesan ke chatbot | `pesan: string` |
| `chat-ke-admin` | Kirim pesan ke admin | `{room, pesan}` |
| `balas-ke-pelanggan` | Admin balas ke pelanggan | `{room, pesan}` |

### Server Events (Dari Server ke Client)

| Event | Deskripsi | Data |
|-------|-----------|------|
| `data-antrian` | Daftar antrian menunggu | `Array<Antrian>` |
| `antrian-dipanggil` | Antrian yang dipanggil | `Antrian` |
| `antrian-baru` | Notifikasi antrian baru | `Antrian` |
| `balasan-bot` | Balasan dari chatbot | `string` |
| `chat-admin` | Pesan dari pelanggan ke admin | `{room, pesan}` |
| `chat-pelanggan` | Pesan dari admin ke pelanggan | `{pesan}` |
| `error` | Error message | `{message}` |
| `info` | Info message | `{message}` |

---

## 🧪 Testing

### 1. Test Koneksi
```bash
node test-connection.js
```

### 2. Start Development Server
```bash
npm run dev
```

### 3. Start Production Server
```bash
npm start
```

### 4. Test Endpoints

#### Health Check
```bash
curl http://localhost:3001/api/health
```

Expected Response:
```json
{
  "status": "OK",
  "message": "Server is running",
  "database": "connected",
  "socketio": "active"
}
```

#### Get Antrian
```bash
curl http://localhost:3001/api/antrian
```

#### Add Antrian
```bash
curl -X POST http://localhost:3001/api/antrian/tambah \
  -H "Content-Type: application/json" \
  -d '{"nama_pelanggan":"John Doe","email":"john@example.com","layanan":"Potong Rambut"}'
```

---

## 🌐 Testing Socket.IO dari Browser

Buka Console Browser di halaman web dan test:

```javascript
// Connect ke server
const socket = io('http://localhost:3001');

// Listen untuk koneksi
socket.on('connect', () => {
  console.log('✅ Connected:', socket.id);
});

// Request daftar antrian
socket.emit('ambil-antrian');

// Listen response
socket.on('data-antrian', (data) => {
  console.log('📋 Antrian:', data);
});

// Test chatbot
socket.emit('chat-pelanggan', 'Berapa antrian yang menunggu?');

socket.on('balasan-bot', (balasan) => {
  console.log('🤖 Bot:', balasan);
});
```

---

## 📁 File-File yang Sudah Diupdate

### ✅ Backend Core
- [api/index.js](api/index.js) - Main server dengan Socket.IO
- [socket/socketAntrian.js](socket/socketAntrian.js) - Socket handlers
- [konfigurasi/koneksiMongo.js](konfigurasi/koneksiMongo.js) - Database connection
- [package.json](package.json) - Dependencies dengan Socket.IO

### ✅ Frontend Pages
- [public/index.html](public/index.html) - Landing page
- [public/admin.html](public/admin.html) - Admin dashboard
- [public/pelanggan.html](public/pelanggan.html) - Customer page
- [public/layar.html](public/layar.html) - Display screen

### ✅ Models
- [model/antrian.js](model/antrian.js) - Queue model
- [model/chat.js](model/chat.js) - Chat model
- [model/pelanggan.js](model/pelanggan.js) - Customer model

---

## 🔧 Troubleshooting

### Socket.IO tidak connect
1. Pastikan server sudah running
2. Check CORS configuration di `api/index.js`
3. Check browser console untuk error

### Database tidak connect
1. Check MONGO_URI di file `.env`
2. Whitelist IP address di MongoDB Atlas
3. Check username/password yang benar

### Email tidak terkirim
1. Check EMAIL_PENGIRIM dan PASSWORD_EMAIL di `.env`
2. Pastikan menggunakan App Password, bukan password Google biasa
3. Enable 2FA di Google Account

---

## 📞 Support

Jika ada masalah:
1. Check file log di console
2. Jalankan `node test-connection.js` untuk diagnostic
3. Periksa konfigurasi di file `.env`

---

**Status Terakhir Update:** 23 Desember 2025
**Socket.IO:** ✅ READY
**Database:** ⚠️ Perlu konfigurasi MONGO_URI
