@echo off
REM Food Delivery Microservices - Startup Script for Windows

setlocal enabledelayedexpansion

echo ========================================
echo Food Delivery System - Microservices
echo ========================================
echo.

REM Check if services are already running
echo Checking for existing Java processes...
tasklist | findstr /i "java" > nul
if !errorlevel! equ 0 (
    echo WARNING: Java processes already running!
    echo You may need to stop existing services first.
    echo Use: taskkill /F /IM java.exe
    echo.
)

REM Build services
echo Building all services...
call mvnw.cmd clean install -DskipTests
if !errorlevel! neq 0 (
    echo Build failed!
    pause
    exit /b 1
)

echo.
echo ========================================
echo Services are built successfully!
echo ========================================
echo.
echo Starting services...
echo.

REM Start Discovery Service
echo Starting Discovery Service (Port 8761)...
start "Discovery Service" java -jar discovery-service/target/discovery-service-0.0.1-SNAPSHOT.jar

REM Wait for Discovery service to start
timeout /t 5 /nobreak

REM Start Gateway Service
echo Starting Gateway Service (Port 8080)...
start "Gateway Service" java -jar gateway-service/target/gateway-service-0.0.1-SNAPSHOT.jar

REM Start User Service
echo Starting User Service (Port 8081)...
start "User Service" java -jar user-service/target/user-service-0.0.1-SNAPSHOT.jar

REM Start Restaurant Service
echo Starting Restaurant Service (Port 8082)...
start "Restaurant Service" java -jar restaurant-service/target/restaurant-service-0.0.1-SNAPSHOT.jar

REM Start Order Service
echo Starting Order Service (Port 8083)...
start "Order Service" java -jar order-service/target/order-service-0.0.1-SNAPSHOT.jar

REM Start Payment Service
echo Starting Payment Service (Port 8084)...
start "Payment Service" java -jar payment-service/target/payment-service-0.0.1-SNAPSHOT.jar

REM Start Notification Service
echo Starting Notification Service (Port 8085)...
start "Notification Service" java -jar notification-service/target/notification-service-0.0.1-SNAPSHOT.jar

echo.
echo ========================================
echo All services started!
echo ========================================
echo.
echo Service URLs:
echo   Discovery Server: http://localhost:8761
echo   API Gateway: http://localhost:8080
echo   User Service: http://localhost:8081
echo   Restaurant Service: http://localhost:8082
echo   Order Service: http://localhost:8083
echo   Payment Service: http://localhost:8084
echo   Notification Service: http://localhost:8085
echo.
echo H2 Database Consoles:
echo   User Service DB: http://localhost:8081/h2-console
echo   Restaurant Service DB: http://localhost:8082/h2-console
echo   Order Service DB: http://localhost:8083/h2-console
echo   Payment Service DB: http://localhost:8084/h2-console
echo.
echo Services are running in separate windows.
echo Close any window to stop that service.
echo.
echo Press any key to exit this script...
pause > nul

