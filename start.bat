@echo off

start "Collector" cmd /k ".venv\Scripts\python.exe data\parking_collector.py"

start "Backend" cmd /k "cd backend && mvnw.cmd spring-boot:run"

start "Frontend" cmd /k "cd frontend && npm run dev"