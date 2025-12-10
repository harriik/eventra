# 🚀 Deploy EVENTRA - Simple Guide

## What You Need
- GitHub account
- Render account (free)
- Vercel account (free)

---

## Step 1: Push to GitHub (5 min)

```bash
cd "d:\MCA\Sem 1\Web Designing\Eventra Project"
git init
git add .
git commit -m "Deploy EVENTRA"
git remote add origin https://github.com/YOUR_USERNAME/eventra.git
git push -u origin main
```

---

## Step 2: Deploy Backend (Render) (5 min)

1. Go to **render.com** → Sign up with GitHub
2. **New +** → **Web Service**
3. Connect your `eventra` repository
4. Settings:
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
5. Environment Variables:
   ```
   MONGODB_URI = mongodb+srv://sa:sa@cluster0.ebov5r5.mongodb.net/eventra?retryWrites=true&w=majority&appName=Cluster0
   JWT_SECRET = MyStrongKey1234
   NODE_ENV = production
   ```
6. **Create Web Service**
7. Copy your backend URL (e.g., `https://eventra-abc123.onrender.com`)

---

## Step 3: Deploy Frontend (Vercel) (3 min)

1. Go to **vercel.com** → Sign up with GitHub
2. **New Project** → Import your `eventra` repository
3. Settings:
   - Root Directory: `frontend`
   - Framework: Create React App
4. Environment Variable:
   ```
   REACT_APP_API_URL = https://YOUR-BACKEND-URL.onrender.com/api
   ```
   ⚠️ Replace with YOUR actual Render URL + `/api`
5. **Deploy**
6. Copy your frontend URL (e.g., `https://eventra.vercel.app`)

---

## Step 4: Update Backend CORS (2 min)

1. Render Dashboard → Your backend → Environment
2. Add variable:
   ```
   FRONTEND_URL = https://YOUR-FRONTEND-URL.vercel.app
   ```
3. Save (auto-redeploys)

---

## Step 5: Add Test Data (2 min)

Run locally:
```bash
cd backend
npm run seed
```

Creates accounts:
- Admin: `admin@eventra.com` / `Admin@123`
- Student: `student1@eventra.com` / `Student@123`

---

## ✅ Test Your App

Visit your Vercel URL and try logging in!

---

## 🔧 Troubleshooting

**Login fails?**
- Check Render logs for errors
- Verify MongoDB Atlas allows `0.0.0.0/0` IP access
- Make sure `REACT_APP_API_URL` ends with `/api`

**Backend slow?**
- Normal for Render free tier (sleeps after 15 min)
- First request takes 30-60 seconds

---

## 📝 Your URLs

**Frontend:** `_________________________`

**Backend:** `_________________________`

🎉 **Done! Your app is live!**