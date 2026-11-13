@echo off
echo =====================================================================
echo  ONCOPROFILE AI - Starting Unified Single-Port Application (Port 8000)
echo  Serves both FastAPI Backend & React Frontend at http://localhost:8000
echo =====================================================================
cd /d "%~dp0"
python -m uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 8000
pause
