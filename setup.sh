#!/bin/bash
set -e

echo ""
echo "  MediRush — Setup Script"
echo "================================"
echo ""

# Node check
if ! command -v node &>/dev/null; then
  echo "ERROR: Node.js not found. Install from https://nodejs.org"
  exit 1
fi
echo "[OK] Node.js $(node --version)"
echo ""

echo "[1/2] Installing backend packages..."
cd backend && npm install && cd ..
echo "[OK] Backend ready"
echo ""

echo "[2/2] Installing frontend packages..."
cd frontend && npm install && cd ..
echo "[OK] Frontend ready"
echo ""

echo "================================"
echo " NEXT STEPS:"
echo ""
echo " 1. Edit backend/.env — set your MongoDB URI"
echo "    (See ATLAS_SETUP.md for help)"
echo ""
echo " 2. Terminal 1 — Backend:"
echo "    cd backend && npm run seed  (once)"
echo "    cd backend && npm run dev"
echo ""
echo " 3. Terminal 2 — Frontend:"
echo "    cd frontend && npm start"
echo ""
echo " 4. Open: http://localhost:3000"
echo "================================"
