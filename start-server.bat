@echo off
cd /d "C:\Users\mypc\work\manwol-workspace"
start "" "http://localhost:3000"
powershell -ExecutionPolicy RemoteSigned -Command "npm run dev"
pause
