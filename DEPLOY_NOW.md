# 🚀 Deploy Now - Step by Step

Everything is ready! Just follow these steps:

---

## ✅ Prerequisites Done
- ✅ All code is deployment-ready
- ✅ CORS configured
- ✅ Environment variables prepared
- ✅ Build configurations set

---

## 📋 What You Need

1. **GitHub Account** - [github.com](https://github.com)
2. **Render Account** - [render.com](https://render.com) (sign up with GitHub)
3. **Vercel Account** - [vercel.com](https://vercel.com) (sign up with GitHub)
4. **MongoDB Atlas** - Your existing cluster: `cluster0.ebov5r5.mongodb.net`

---

## 🎯 Step 1: Push to GitHub (5 minutes)

```bash
cd "d:\MCA\Sem 1\Web Designing\Eventra Project"

# Initialize git
git init

# Add all files
git add .

# Commit
git commit -m "Ready for deployment"

# Create repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/eventra.git
git branch -M main
git push -u origin main
```

---

## 🎯 Step 2: Deploy Backend to Render (5 minutes)

1. Go to **[render.com](https://render.com)** → Sign in with GitHub

2. Click **New +** → **Web Service**

3. Connect your `eventra` repository

4. **Configure:**
   - Name: `eventra-backend`
   - Root Directory: `backend`
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Instance Type: `Free`

5. **Add Environment Variables:**
   ```
   MONGODB_URI = mongodb+srv://sa:sa@cluster0.ebov5r5.mongodb.net/eventra?retryWrites=true&w=majority&appName=Cluster0
   JWT_SECRET = MyStrongKey1234
   NODE_ENV = production
   PORT = 5000
   ```

6. Click **Create Web Service**

7. **Wait 5-10 minutes** for deployment

8. **Copy your backend URL** (e.g., `https://eventra-20w8.onrender.com`)

---

## 🎯 Step 3: Deploy Frontend to Vercel (3 minutes)

1. Go to **[vercel.com](https://vercel.com)** → Sign in with GitHub

2. Click **Add New** → **Project**

3. Import your `eventra` repository

4. **Configure:**
   - Framework Preset: `Create React App`
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `build`

5. **Add Environment Variable:**
   ```
   REACT_APP_API_URL = https://eventra-20w8.onrender.com/api
   ```
   ⚠️ **Replace with YOUR actual Render URL + /api**

6. Click **Deploy**

7. **Wait 2-3 minutes**

8. **Copy your frontend URL** (e.g., `https://eventra.vercel.app`)

---

## 🎯 Step 4: Update Backend CORS (2 minutes)

1. Go back to **Render Dashboard** → Your backend service

2. Click **Environment**

3. **Add new variable:**
   ```
   FRONTEND_URL = https://eventra.vercel.app
   ```
   ⚠️ **Use YOUR actual Vercel URL**

4. Click **Save Changes** (auto-redeploys in 2-3 minutes)

---

## 🎯 Step 5: Seed Database (Optional - 2 minutes)

Run locally to add test accounts:

```bash
cd backend

# Make sure .env has production MongoDB URI
npm run seed
```

This creates:
- Admin: `admin@eventra.com` / `Admin@123`
- Coordinator: `coordinator1@eventra.com` / `Coord@123`
- Student: `student1@eventra.com` / `Student@123`

---

## 🎉 Step 6: Test Your Live App

1. Visit your Vercel URL: `https://eventra.vercel.app`

2. Try registering a new student account

3. Login and test features

4. Try admin login:
   - Email: `admin@eventra.com`
   - Password: `Admin@123`

---

## 📝 Save Your URLs

**Frontend (Vercel):** `_______________________________`

**Backend (Render):** `_______________________________`

**Database:** `cluster0.ebov5r5.mongodb.net`

---

## ⚠️ Important Notes

1. **Render Free Tier:**
   - Backend sleeps after 15 minutes of inactivity
   - First request takes 30-60 seconds to wake up
   - This is normal!

2. **MongoDB Atlas:**
   - Make sure Network Access allows `0.0.0.0/0`
   - Verify username `sa` and password `sa` work

3. **Auto-Deploy:**
   - Any push to GitHub = auto-deploy on both services
   - No need to manually redeploy

---

## 🔧 If Something Goes Wrong

### Backend Issues
- Check Render logs: Dashboard → Logs tab
- Verify all environment variables are set
- Test: `https://your-backend.onrender.com/api/health`

### Frontend Issues
- Check Vercel logs: Dashboard → Deployments → Function Logs
- Verify `REACT_APP_API_URL` ends with `/api`
- Clear browser cache (Ctrl+Shift+R)

### CORS Errors
- Make sure `FRONTEND_URL` is set in Render backend
- Redeploy backend after adding it

---

## ✅ Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] Backend deployed to Render
- [ ] Backend environment variables added
- [ ] Backend URL copied
- [ ] Frontend deployed to Vercel
- [ ] Frontend environment variable added (with `/api`)
- [ ] Backend CORS updated with frontend URL
- [ ] Database seeded
- [ ] Tested login on live site

---

## 🎊 You're Done!

Your app is now live and accessible worldwide!

**Share your app:** Send your Vercel URL to anyone

**Make updates:** Just push to GitHub and both services auto-deploy

**Monitor:** Check Render and Vercel dashboards for logs and analytics
