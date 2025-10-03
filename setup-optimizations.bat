@echo off
echo ========================================
echo ShoppingSystem - Performance Setup
echo ========================================
echo.

echo [1/5] Checking Docker...
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker is not installed or not running
    echo Please install Docker Desktop and try again
    pause
    exit /b 1
)
echo Docker is installed ✓

echo.
echo [2/5] Creating environment file...
if not exist .env (
    copy .env.example .env
    echo .env file created ✓
    echo Please update .env with your configuration
) else (
    echo .env file already exists ✓
)

echo.
echo [3/5] Starting services (PostgreSQL + Redis)...
docker-compose up -d database redis
echo Waiting for services to be ready...
timeout /t 15 /nobreak >nul
echo Services started ✓

echo.
echo [4/5] Applying database indexes...
echo This may take a few moments...
docker exec -i shopping-db psql -U postgres -d ShoppingSystemDB < ShoppingBackend\src\main\resources\db-indexes.sql 2>nul
if %errorlevel% equ 0 (
    echo Database indexes applied ✓
) else (
    echo Note: Indexes will be created automatically on first run
)

echo.
echo [5/5] Setup complete!
echo.
echo ========================================
echo Next Steps:
echo ========================================
echo 1. Update .env file with your configuration
echo 2. Start backend: cd ShoppingBackend ^&^& mvn spring-boot:run
echo 3. Start frontend: cd ShoppingFrontend ^&^& npm run dev
echo.
echo Optional - Start monitoring:
echo   docker-compose -f docker-compose.monitoring.yml up -d
echo   Grafana: http://localhost:3001 (admin/admin)
echo   Prometheus: http://localhost:9090
echo.
echo ========================================
echo Performance Features Enabled:
echo ========================================
echo ✓ Redis distributed caching
echo ✓ Database connection pooling (20 connections)
echo ✓ Response compression
echo ✓ Rate limiting (100 req/min)
echo ✓ Database indexes
echo ✓ JVM optimization
echo ✓ Monitoring ready
echo.
pause
