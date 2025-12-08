# Local Setup Guide - Fix Server Errors

## Quick Fix Steps

### 1. Check Backend is Running
```bash
cd backend
npm install
npm run dev
```

You should see:
```
🚀 Server is running on port 5000
✅ MongoDB connected successfully
```

### 2. Check Frontend Configuration
```bash
cd frontend
npm install
```

Make sure `frontend/src/services/api.js` has:
```javascript
const API_BASE_URL = 'http://localhost:5000/api';
```

### 3. Start Frontend
```bash
cd frontend
npm start
```

---

## Common Server Errors & Fixes

### Error: "Server Error" on Login

**Cause**: Backend not running or MongoDB not connected

**Fix**:
1. Start backend first:
```bash
cd backend
npm run dev
```

2. Check MongoDB Atlas:
   - Network Access → Whitelist `0.0.0.0/0`
   - Verify connection string in `backend/.env`

3. Test backend:
   - Open browser: `http://localhost:5000/api/health`
   - Should show: `{"status":"OK","message":"EVENTRA API is running"}`

---

### Error: "Network Error" or 404

**Cause**: Frontend calling wrong URL

**Fix**:
1. Edit `frontend/src/services/api.js`:
```javascript
const API_BASE_URL = 'http://localhost:5000/api';
```

2. Restart frontend completely (Ctrl+C then `npm start`)

---

### Error: "ECONNREFUSED"

**Cause**: Backend not running on port 5000

**Fix**:
```bash
# Kill any process on port 5000
netstat -ano | findstr :5000
taskkill /PID <PID_NUMBER> /F

# Start backend
cd backend
npm run dev
```

---

### Error: "MongooseError: buffering timed out"

**Cause**: Can't connect to MongoDB

**Fix**:
1. Check `backend/.env`:
```
MONGODB_URI=mongodb+srv://sa:sa@cluster0.ebov5r5.mongodb.net/eventra?retryWrites=true&w=majority
```

2. MongoDB Atlas:
   - Network Access → Add `0.0.0.0/0`
   - Verify username/password

---

### Error: "Port 5000 already in use"

**Fix**:
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID_NUMBER> /F

# Then restart
cd backend
npm run dev
```

---

## Complete Fresh Start

If nothing works, do a complete reset:

```bash
# 1. Stop all servers (Ctrl+C)

# 2. Clean backend
cd backend
rmdir /s /q node_modules
del package-lock.json
npm install

# 3. Clean frontend
cd ../frontend
rmdir /s /q node_modules
rmdir /s /q .cache
del package-lock.json
npm install

# 4. Start backend
cd ../backend
npm run dev

# 5. Start frontend (new terminal)
cd ../frontend
npm start
```

---

## Verify Setup

### Backend Check:
```bash
curl http://localhost:5000/api/health
```
Should return: `{"status":"OK","message":"EVENTRA API is running"}`

### Frontend Check:
1. Open browser: `http://localhost:3000`
2. Open Console (F12)
3. Should see: `🔗 API Base URL: http://localhost:5000/api`

### Database Check:
Backend terminal should show:
```
✅ MongoDB connected successfully
📊 Database: cluster0.ebov5r5.mongodb.net
```

---

## Test Login

1. Go to: `http://localhost:3000/admin/login`
2. Login with:
   - Email: `admin@eventra.com`
   - Password: `Admin@123`

If you get "Invalid credentials", seed the database:
```bash
cd backend
npm run seed
```

---

## Environment Files

### backend/.env
```
PORT=5000
MONGODB_URI=mongodb+srv://sa:sa@cluster0.ebov5r5.mongodb.net/eventra?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=MyStrongKey1234
NODE_ENV=development
```

### frontend/src/services/api.js
```javascript
const API_BASE_URL = 'http://localhost:5000/api';
```

---

## Still Having Issues?

1. **Check backend terminal** - Look for error messages
2. **Check browser console** (F12) - Look for network errors
3. **Check Network tab** (F12 → Network) - See what URL is being called
4. **Verify both servers are running**:
   - Backend: `http://localhost:5000/api/health`
   - Frontend: `http://localhost:3000`

---

## Default Test Accounts

After seeding:
- **Admin**: `admin@eventra.com` / `Admin@123`
- **Coordinator**: `coordinator1@eventra.com` / `Coord@123`
- **Student**: `student1@eventra.com` / `Student@123`
