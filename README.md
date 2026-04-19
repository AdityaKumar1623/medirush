# 🏥 MediRush — Smart Medicine Delivery System

React + Node.js + MongoDB Atlas + Socket.io

---

## 🚀 Setup in 5 steps

### Step 1 — Install Node.js
Download from https://nodejs.org (v18 or above)

### Step 2 — Setup MongoDB Atlas (FREE)
Read the file: **ATLAS_SETUP.md** — step by step guide

### Step 3 — Configure backend
Open `backend/.env` and set your Atlas connection string:
```
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/medirush?retryWrites=true&w=majority
```

### Step 4 — Install and run

Windows:
```
setup.bat
```

Mac/Linux:
```bash
chmod +x setup.sh && ./setup.sh
```

Manual:
```bash
# Terminal 1 — Backend
cd backend
npm install
npm run seed     ← run this ONCE to create demo accounts
npm run dev      ← keep this running

# Terminal 2 — Frontend
cd frontend
npm install
npm start
```

Open http://localhost:3000

---

## 🔑 Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| 👤 User | raj@example.com | user123 |
| 🛡️ Admin | admin@medirush.com | admin123 |
| 🚴 Delivery | arjun@medirush.com | delivery123 |

---

## ❗ Common Errors

| Error | Fix |
|-------|-----|
| `MongoServerSelectionError` | In Atlas → Network Access → Add 0.0.0.0/0 |
| `Authentication failed` | Wrong password in MONGODB_URI |
| `ECONNREFUSED 27017` | Still using localhost URI — paste Atlas string |
| `Cannot find module` | Run `npm install` in backend/ folder |
| `CORS error` in browser | Make sure CLIENT_URL=http://localhost:3000 in .env |
| Port 5000 in use | Change PORT=5001 in .env and REACT_APP_API_URL in frontend/.env |

