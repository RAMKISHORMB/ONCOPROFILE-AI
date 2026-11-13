@echo off
echo =====================================================================
echo  ONCOPROFILE AI - Starting FastAPI Backend Server (Port 8000)
echo  Multi-Omics Breast Cancer Treatment Strategy Platform
echo =====================================================================
cd /d "%~dp0"
python -m uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 8000 --reload
pause
