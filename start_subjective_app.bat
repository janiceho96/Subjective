@echo off
title Subjective App Launcher
cd /d "C:\Users\User"
echo ==========================================
echo   Cleaning up old Electron instances...
echo ==========================================
taskkill /F /IM electron.exe >nul 2>&1
echo ==========================================
echo   Launching Subjective Knowledge App...
echo ==========================================
npm start
pause
