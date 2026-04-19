@echo off
title MediRush Setup
color 0A
echo.
echo  ███╗   ███╗███████╗██████╗ ██╗██████╗ ██╗   ██╗███████╗██╗  ██╗
echo  ████╗ ████║██╔════╝██╔══██╗██║██╔══██╗██║   ██║██╔════╝██║  ██║
echo  ██╔████╔██║█████╗  ██║  ██║██║██████╔╝██║   ██║███████╗███████║
echo  ██║╚██╔╝██║██╔══╝  ██║  ██║██║██╔══██╗██║   ██║╚════██║██╔══██║
echo  ██║ ╚═╝ ██║███████╗██████╔╝██║██║  ██║╚██████╔╝███████║██║  ██║
echo  ╚═╝     ╚═╝╚══════╝╚═════╝ ╚═╝╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚═╝  ╚═╝
echo.
echo  Smart Medicine Delivery System — Setup
echo ================================================
echo.

:: Check Node.js
node --version >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo  [ERROR] Node.js not found!
    echo  Download from: https://nodejs.org
    echo.
    pause
    exit /b 1
)
echo  [OK] Node.js found:
node --version
echo.

:: Backend
echo  [1/2] Installing backend packages...
cd backend
call npm install
IF %ERRORLEVEL% NEQ 0 (
    echo  [ERROR] Backend install failed
    pause
    exit /b 1
)
cd ..
echo  [OK] Backend ready
echo.

:: Frontend
echo  [2/2] Installing frontend packages...
cd frontend
call npm install
IF %ERRORLEVEL% NEQ 0 (
    echo  [ERROR] Frontend install failed
    pause
    exit /b 1
)
cd ..
echo  [OK] Frontend ready
echo.

echo ================================================
echo  NEXT STEPS:
echo.
echo  1. Open backend\.env and set your MongoDB URI
echo     (see ATLAS_SETUP.md for help)
echo.
echo  2. Terminal 1 (Backend):
echo     cd backend
echo     npm run seed    (run ONCE)
echo     npm run dev
echo.
echo  3. Terminal 2 (Frontend):
echo     cd frontend
echo     npm start
echo.
echo  4. Open: http://localhost:3000
echo ================================================
echo.
pause
