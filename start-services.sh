#!/bin/bash

# Food Delivery Microservices - Startup Script for Linux/Mac

echo "========================================"
echo "Food Delivery System - Microservices"
echo "========================================"
echo ""

# Check if services are already running
echo "Checking for existing Java processes..."
if pgrep -x "java" > /dev/null; then
    echo "WARNING: Java processes already running!"
    echo "You may need to stop existing services first."
    echo "Use: killall java"
    echo ""
fi

# Build services
echo "Building all services..."
./mvnw clean install -DskipTests
if [ $? -ne 0 ]; then
    echo "Build failed!"
    exit 1
fi

echo ""
echo "========================================"
echo "Services are built successfully!"
echo "========================================"
echo ""
echo "Starting services..."
echo ""

# Create logs directory
mkdir -p logs

# Start Discovery Service
echo "Starting Discovery Service (Port 8761)..."
java -jar discovery-service/target/discovery-service-0.0.1-SNAPSHOT.jar > logs/discovery-service.log 2>&1 &
DISCOVERY_PID=$!
echo "Discovery Service PID: $DISCOVERY_PID"

# Wait for Discovery service to start
sleep 5

# Start Gateway Service
echo "Starting Gateway Service (Port 8080)..."
java -jar gateway-service/target/gateway-service-0.0.1-SNAPSHOT.jar > logs/gateway-service.log 2>&1 &
GATEWAY_PID=$!
echo "Gateway Service PID: $GATEWAY_PID"

# Start User Service
echo "Starting User Service (Port 8081)..."
java -jar user-service/target/user-service-0.0.1-SNAPSHOT.jar > logs/user-service.log 2>&1 &
USER_PID=$!
echo "User Service PID: $USER_PID"

# Start Restaurant Service
echo "Starting Restaurant Service (Port 8082)..."
java -jar restaurant-service/target/restaurant-service-0.0.1-SNAPSHOT.jar > logs/restaurant-service.log 2>&1 &
RESTAURANT_PID=$!
echo "Restaurant Service PID: $RESTAURANT_PID"

# Start Order Service
echo "Starting Order Service (Port 8083)..."
java -jar order-service/target/order-service-0.0.1-SNAPSHOT.jar > logs/order-service.log 2>&1 &
ORDER_PID=$!
echo "Order Service PID: $ORDER_PID"

# Start Payment Service
echo "Starting Payment Service (Port 8084)..."
java -jar payment-service/target/payment-service-0.0.1-SNAPSHOT.jar > logs/payment-service.log 2>&1 &
PAYMENT_PID=$!
echo "Payment Service PID: $PAYMENT_PID"

# Start Notification Service
echo "Starting Notification Service (Port 8085)..."
java -jar notification-service/target/notification-service-0.0.1-SNAPSHOT.jar > logs/notification-service.log 2>&1 &
NOTIFICATION_PID=$!
echo "Notification Service PID: $NOTIFICATION_PID"

echo ""
echo "========================================"
echo "All services started!"
echo "========================================"
echo ""
echo "Service URLs:"
echo "  Discovery Server: http://localhost:8761"
echo "  API Gateway: http://localhost:8080"
echo "  User Service: http://localhost:8081"
echo "  Restaurant Service: http://localhost:8082"
echo "  Order Service: http://localhost:8083"
echo "  Payment Service: http://localhost:8084"
echo "  Notification Service: http://localhost:8085"
echo ""
echo "H2 Database Consoles:"
echo "  User Service DB: http://localhost:8081/h2-console"
echo "  Restaurant Service DB: http://localhost:8082/h2-console"
echo "  Order Service DB: http://localhost:8083/h2-console"
echo "  Payment Service DB: http://localhost:8084/h2-console"
echo ""
echo "View logs in 'logs' directory"
echo ""

# Create a stop script
cat > stop-services.sh << 'EOF'
#!/bin/bash
echo "Stopping all services..."
kill $DISCOVERY_PID 2>/dev/null
kill $GATEWAY_PID 2>/dev/null
kill $USER_PID 2>/dev/null
kill $RESTAURANT_PID 2>/dev/null
kill $ORDER_PID 2>/dev/null
kill $PAYMENT_PID 2>/dev/null
kill $NOTIFICATION_PID 2>/dev/null
echo "All services stopped!"
EOF

chmod +x stop-services.sh

echo "To stop all services, run: ./stop-services.sh"
echo ""
echo "Waiting for services to start..."
sleep 10

# Check if services are running
echo ""
echo "Service Status:"
curl -s http://localhost:8761 > /dev/null && echo "✓ Discovery Service (8761)" || echo "✗ Discovery Service (8761)"
curl -s http://localhost:8080 > /dev/null && echo "✓ Gateway Service (8080)" || echo "✗ Gateway Service (8080)"
curl -s http://localhost:8081 > /dev/null && echo "✓ User Service (8081)" || echo "✗ User Service (8081)"
curl -s http://localhost:8082 > /dev/null && echo "✓ Restaurant Service (8082)" || echo "✗ Restaurant Service (8082)"
curl -s http://localhost:8083 > /dev/null && echo "✓ Order Service (8083)" || echo "✗ Order Service (8083)"
curl -s http://localhost:8084 > /dev/null && echo "✓ Payment Service (8084)" || echo "✗ Payment Service (8084)"
curl -s http://localhost:8085 > /dev/null && echo "✓ Notification Service (8085)" || echo "✗ Notification Service (8085)"

