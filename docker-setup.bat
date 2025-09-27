@echo off
REM AI Data Agent Docker Setup Script for Windows

echo 🚀 Setting up AI Data Agent with Docker...

REM Create necessary directories
echo 📁 Creating directories...
if not exist "data" mkdir data
if not exist "logs" mkdir logs
if not exist "ssl" mkdir ssl

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not running. Please start Docker Desktop first.
    pause
    exit /b 1
)

REM Check if docker-compose is available
docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo ❌ docker-compose not found. Please install Docker Desktop with Compose.
    pause
    exit /b 1
)

REM Build and start services
echo 🔨 Building and starting services...
docker-compose up --build -d

REM Wait for services to be ready
echo ⏳ Waiting for services to start...
timeout /t 10 /nobreak >nul

REM Check if services are running
echo 🔍 Checking service status...
docker-compose ps

REM Pull and setup Ollama model
echo 🤖 Setting up Ollama model...
docker-compose exec ollama ollama pull gemma2:2b

echo ✅ Setup complete!
echo.
echo 🌐 Access your application at:
echo    - Application: http://localhost:8001
echo    - Ollama API: http://localhost:11434
echo    - Redis: localhost:6379
echo.
echo 📊 Useful commands:
echo    - View logs: docker-compose logs -f
echo    - Stop services: docker-compose down
echo    - Restart services: docker-compose restart
echo    - Update model: docker-compose exec ollama ollama pull gemma2:2b
echo.
echo 🎉 Your AI Data Agent is ready to use!
pause
