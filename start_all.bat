@echo off
echo Starting Smart Daily Life Manager System...

echo Starting MongoDB (Ensure it is installed and running)...
REM Assuming MongoDB service is running or manually started.

echo Starting Python ML Service...
REM Using python -m uvicorn to ensure it finds the module
start cmd /k "cd backend-python && python -m uvicorn main:app --reload --port 8000"

echo Starting Node.js Backend...
start cmd /k "cd backend-node && npm start"

echo Starting Frontend...
start cmd /k "cd frontend-react && npm run dev"

echo All services started! 
echo Frontend: http://localhost:5173
echo Backend: http://localhost:5000
echo ML Service: http://localhost:8000
