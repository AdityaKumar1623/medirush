# MongoDB Atlas Setup — Step by Step

## Step 1 — Create free account
Go to: https://www.mongodb.com/atlas
Click "Try Free" → Sign up

## Step 2 — Create a cluster
1. Click "Build a Database"
2. Choose **FREE** (M0 Sandbox)
3. Select region: **Mumbai (ap-south-1)** for India
4. Cluster name: "Cluster0" (default)
5. Click "Create"

## Step 3 — Create database user
1. In Security → "Database Access" → "Add New Database User"
2. Username: `medirush`
3. Password: `medirush123` (or anything you want — NOTE IT DOWN)
4. Role: "Atlas admin"
5. Click "Add User"

## Step 4 — Allow your IP
1. Security → "Network Access" → "Add IP Address"
2. Click **"Allow Access from Anywhere"** → 0.0.0.0/0
3. Click "Confirm"
   ⚠️ This is important — if you skip this, connection will fail!

## Step 5 — Get connection string
1. Go to Database → Click "Connect" on your cluster
2. Choose "Connect your application"
3. Driver: Node.js, Version: 5.5 or later
4. Copy the string — it looks like:
   mongodb+srv://medirush:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority

## Step 6 — Update backend/.env
Open `backend/.env` and update MONGODB_URI:

```
MONGODB_URI=mongodb+srv://medirush:medirush123@cluster0.xxxxx.mongodb.net/medirush?retryWrites=true&w=majority&appName=Cluster0
```

IMPORTANT:
- Replace <password> with your actual password
- Add `/medirush` before the `?` — this is your database name
- Keep everything else as-is

## Step 7 — Test the connection
```bash
cd backend
npm run dev
```

You should see:
  ✅ MongoDB connected → cluster0.xxxxx.mongodb.net

## Common Errors

### MongoServerSelectionError / timeout
→ You forgot Step 4 (Allow IP). Go to Network Access and add 0.0.0.0/0

### Authentication failed
→ Wrong password in connection string. Double-check Step 3 and Step 6.

### ECONNREFUSED 127.0.0.1:27017
→ You're still using the localhost URI. Update .env with Atlas string.

### bad auth / credentials
→ Username or password has special characters — URL-encode them, or use simple alphanumeric password
