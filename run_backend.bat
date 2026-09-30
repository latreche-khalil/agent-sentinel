@echo off
echo ========================================================
echo  AGENT SENTINEL - Runtime Security Gateway Backend
echo  Port: 8000 (FastAPI / Uvicorn)
echo ========================================================
set PYTHONPATH=.
python -m uvicorn backend.api.app:app --host 0.0.0.0 --port 8000 --reload
