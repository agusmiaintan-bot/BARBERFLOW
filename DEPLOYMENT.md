# Deployment Checklist untuk Vercel

## ✅ Pre-Deployment Checklist

- [ ] Semua dependencies sudah ter-install dan updated
- [ ] Test local development dengan `npm run dev`
- [ ] Environment variables tersedia di `.env`
- [ ] MongoDB connection string valid dan tested
- [ ] Email credentials (Gmail App Password) sudah di-generate
- [ ] Repository sudah ter-push ke GitHub
- [ ] Tidak ada hardcoded credentials di dalam kode

## 📋 Environment Variables untuk Vercel

Pastikan semua variables ini sudah di-set di Vercel Dashboard (Project Settings > Environment Variables):

```
PORT=3001
NODE_ENV=production
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/barberflow?retryWrites=true&w=majority
EMAIL_PENGIRIM=your-email@gmail.com
PASSWORD_EMAIL=your-app-password
ALLOWED_ORIGINS=https://yourdomain.com,https://youradmin.com
```

## 🚀 Langkah Deployment ke Vercel

### 1. Push ke GitHub
```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

### 2. Login ke Vercel
- Visit https://vercel.com
- Click "New Project"
- Import your GitHub repository

### 3. Configure Project
- **Framework Preset:** Other
- **Root Directory:** ./
- **Build Command:** `npm run build` (bisa skip)
- **Start Command:** `node server.js`

### 4. Set Environment Variables
Dalam "Environment Variables" section, tambahkan:
- MONGO_URI
- EMAIL_PENGIRIM
- PASSWORD_EMAIL
- NODE_ENV=production
- PORT=3001

### 5. Deploy
Click "Deploy" button dan wait untuk completion

### 6. Verify Deployment
```bash
curl https://your-project.vercel.app/api/health
```

Response harus:
```json
{"status":"OK","message":"Server is running"}
```

## 🔍 Troubleshooting Deployment

### Build Failed
- Check Vercel deployment logs
- Verify semua dependencies di `package.json`
- Pastikan no syntax errors dengan `node -c server.js`

### Runtime Error / 500 Error
- Check Vercel function logs
- Verify environment variables sudah set
- Test MongoDB connection string

### Timeout Error
- Increase timeout di `vercel.json`
- Check database query performance
- Verify network connectivity

### Email Not Sending
- Verify `EMAIL_PENGIRIM` dan `PASSWORD_EMAIL`
- Pastikan Gmail 2-Step Verification aktif
- Generate ulang App Password jika perlu

## 📊 Monitoring & Logs

### View Logs
- Vercel Dashboard → Deployments → [Select Deployment] → Function Logs

### Monitor Performance
- Vercel Analytics (available in Pro plan)
- Check response times & error rates

## 🔐 Security Checklist

- [ ] Tidak ada `.env` file di repository
- [ ] `.gitignore` properly configured
- [ ] Semua credentials hanya di Vercel env vars
- [ ] CORS configuration restricted untuk production
- [ ] Input validation implemented
- [ ] Error messages tidak leak sensitive info

## 📝 Production Best Practices

1. **Database**
   - Enable SSL/TLS untuk MongoDB connection
   - Set IP whitelist di MongoDB Atlas
   - Regular backups configured

2. **API Security**
   - Implement rate limiting (future enhancement)
   - Add request validation middleware
   - Use HTTPS (Vercel default)

3. **Monitoring**
   - Setup error tracking (Sentry, etc)
   - Monitor database connection pool
   - Track API response times

4. **Scaling**
   - Monitor function execution time
   - Optimize database queries
   - Implement caching if needed

## 🔄 Update & Rollback

### Update Code
```bash
git push origin main
```
Vercel automatically redeploys latest version

### Rollback to Previous Version
- Vercel Dashboard → Deployments
- Select previous deployment
- Click "Redeploy"

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Node.js Runtime](https://vercel.com/docs/runtimes/node)
- [MongoDB Atlas Docs](https://docs.mongodb.com/atlas/)
- [Troubleshooting Guide](https://vercel.com/support)

---

**Last Updated:** December 2024
