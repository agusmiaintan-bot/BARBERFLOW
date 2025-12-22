#!/bin/bash

# BARBERFLOW - Pre-Deployment Verification Script
# Run this script sebelum deploy ke Vercel

echo "🔍 BARBERFLOW Pre-Deployment Verification"
echo "=========================================="
echo ""

# Check Node.js version
echo "✓ Checking Node.js version..."
node --version
echo ""

# Check npm packages
echo "✓ Checking npm packages..."
npm list --depth=0
echo ""

# Check essential files
echo "✓ Checking essential files..."
files=(
  "server.js"
  "package.json"
  "vercel.json"
  ".env"
  ".gitignore"
  "routes/antrian.js"
  "model/antrian.js"
  "konfigurasi/koneksiMongo.js"
)

missing=0
for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "  ✅ $file"
  else
    echo "  ❌ $file (MISSING)"
    ((missing++))
  fi
done

if [ $missing -gt 0 ]; then
  echo ""
  echo "⚠️  Some files are missing!"
  exit 1
fi

echo ""
echo "✓ Checking .env variables..."
if [ -f ".env" ]; then
  echo "  ✅ .env exists"
  # Check for required variables
  if grep -q "MONGO_URI" .env; then
    echo "  ✅ MONGO_URI found"
  else
    echo "  ⚠️  MONGO_URI not found in .env"
  fi
  
  if grep -q "EMAIL_PENGIRIM" .env; then
    echo "  ✅ EMAIL_PENGIRIM found"
  else
    echo "  ⚠️  EMAIL_PENGIRIM not found in .env"
  fi
  
  if grep -q "PASSWORD_EMAIL" .env; then
    echo "  ✅ PASSWORD_EMAIL found"
  else
    echo "  ⚠️  PASSWORD_EMAIL not found in .env"
  fi
else
  echo "  ❌ .env file not found"
fi

echo ""
echo "✓ Checking .gitignore..."
if grep -q ".env" .gitignore; then
  echo "  ✅ .env is in .gitignore"
else
  echo "  ⚠️  .env should be in .gitignore"
fi

if grep -q "node_modules" .gitignore; then
  echo "  ✅ node_modules is in .gitignore"
else
  echo "  ⚠️  node_modules should be in .gitignore"
fi

echo ""
echo "✓ Checking syntax..."
if node -c server.js 2>/dev/null; then
  echo "  ✅ server.js syntax OK"
else
  echo "  ❌ server.js has syntax errors"
fi

echo ""
echo "=========================================="
echo "✅ Pre-Deployment Verification Complete!"
echo ""
echo "Next steps:"
echo "1. Verify all checks passed"
echo "2. Test locally: npm run dev"
echo "3. Verify endpoints work"
echo "4. git add . && git commit"
echo "5. git push origin main"
echo "6. Deploy via Vercel dashboard"
echo ""
