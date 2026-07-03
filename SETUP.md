# Setup and Getting Started Guide

## Prerequisites

### System Requirements
- **OS**: Windows, macOS, or Linux
- **Java**: JDK 17 or higher
- **Maven**: 3.6+ (included via Maven wrapper)
- **RAM**: Minimum 4GB (8GB recommended for all services running)
- **Disk Space**: 2GB for dependencies

### Installation Steps

#### 1. Install Java 17
- Download from: https://www.oracle.com/java/technologies/javase/jdk17-archive-downloads.html
- Or use package manager:
  - **Windows** (Chocolatey): `choco install temurin17`
  - **macOS** (Homebrew): `brew install openjdk@17`
  - **Linux** (Ubuntu): `sudo apt-get install openjdk-17-jdk`

#### 2. Verify Java Installation
```bash
java -version
# Output should show Java 17
```

#### 3. Clone/Download Project
```bash
git clone <repository-url>
cd food-delivery
```

## Project Structure

```
food-delivery/
├── discovery-service/              # Eureka Server
│   ├── src/main/java/...
│   ├── src/main/resources/
│   │   └── application.properties
│   └── pom.xml
├── gateway-service/                # API Gateway
├── user-service/                   # User Management
├── restaurant-service/             # Restaurant Management
├── order-service/                  # Order Processing
├── payment-service/                # Payment Processing
├── notification-service/           # Notifications
├── pom.xml                         # Parent POM
├── README.md                       # Main documentation
├── ARCHITECTURE.md                 # Architecture details
├── docker-compose.yml              # Docker configuration
├── start-services.bat              # Windows startup script
├── start-services.sh               # Linux/Mac startup script
└── SETUP.md                        # This file
```

## Building the Project

### Option 1: Build All Services at Once

```bash
cd food-delivery
./mvnw.cmd clean install -DskipTests    # Windows
./mvnw clean install -DskipTests        # Linux/Mac
```

**Output**: JAR files created in each service's `target/` directory

### Option 2: Build Specific Service

```bash
cd user-service
../../mvnw.cmd clean install -DskipTests
```

### Troubleshooting Build Issues

**Issue**: `mvnw: command not found`
- **Solution**: Use `mvnw.cmd` on Windows or ensure execute permissions on Linux/Mac

**Issue**: `Java not found`
- **Solution**: Add Java to system PATH or use full path to Java executable

**Issue**: Build takes too long
- **Solution**: First build downloads dependencies; subsequent builds are faster

## Running Services

### Quick Start (Automated)

#### Windows
Double-click: `start-services.bat`

#### Linux/Mac
```bash
chmod +x start-services.sh
./start-services.sh
```

### Manual Start (Individual Services)

#### Step 1: Start Discovery Service
```bash
cd discovery-service
java -jar target/discovery-service-0.0.1-SNAPSHOT.jar
```
Wait for: `Started DiscoveryServiceApplication`

#### Step 2: Start Gateway Service (new terminal)
```bash
cd gateway-service
java -jar target/gateway-service-0.0.1-SNAPSHOT.jar
```

#### Step 3: Start Other Services (in separate terminals)

**User Service:**
```bash
cd user-service
java -jar target/user-service-0.0.1-SNAPSHOT.jar
```

**Restaurant Service:**
```bash
cd restaurant-service
java -jar target/restaurant-service-0.0.1-SNAPSHOT.jar
```

**Order Service:**
```bash
cd order-service
java -jar target/order-service-0.0.1-SNAPSHOT.jar
```

**Payment Service:**
```bash
cd payment-service
java -jar target/payment-service-0.0.1-SNAPSHOT.jar
```

**Notification Service:**
```bash
cd notification-service
java -jar target/notification-service-0.0.1-SNAPSHOT.jar
```

### Run with Maven (Alternative)

Instead of JAR, run directly with Maven:

```bash
cd user-service
../../mvnw.cmd spring-boot:run
```

## Accessing Services

### Service Discovery Dashboard
- **URL**: http://localhost:8761
- **Access**: Open in browser
- **Info**: View all registered services, instances, and health

### API Gateway
- **URL**: http://localhost:8080
- **Purpose**: Single entry point for all APIs

### Service-Specific Ports

| Service | URL | Port |
|---------|-----|------|
| User Service | http://localhost:8081 | 8081 |
| Restaurant Service | http://localhost:8082 | 8082 |
| Order Service | http://localhost:8083 | 8083 |
| Payment Service | http://localhost:8084 | 8084 |
| Notification Service | http://localhost:8085 | 8085 |

### H2 Database Consoles

Access database consoles at:
- User Service: http://localhost:8081/h2-console
- Restaurant Service: http://localhost:8082/h2-console
- Order Service: http://localhost:8083/h2-console
- Payment Service: http://localhost:8084/h2-console

**H2 Credentials**:
- Username: `sa`
- Password: (leave empty)
- JDBC URL: `jdbc:h2:mem:servicename` (e.g., `jdbc:h2:mem:userdb`)

## Testing the APIs

### Using cURL

```bash
# List all restaurants
curl http://localhost:8080/api/restaurants

# Create user
curl -X POST http://localhost:8080/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe"
  }'

# Create order
curl -X POST http://localhost:8080/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "restaurantId": 1,
    "items": [
      {"menuItemId": 1, "quantity": 2}
    ],
    "deliveryAddress": "123 Main St",
    "specialInstructions": "No onions"
  }'
```

### Using Postman

1. Download Postman: https://www.postman.com/downloads/
2. Import collection (if available) or create manually
3. Set base URL: `http://localhost:8080`
4. Create requests for each endpoint

### Using REST Client Extension

VSCode REST Client example (`test.http`):
```http
### List Restaurants
GET http://localhost:8080/api/restaurants

### Register User
POST http://localhost:8080/api/users/register
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "test123",
  "firstName": "Test",
  "lastName": "User"
}
```

## Stopping Services

### Windows
- Close each command window or press `Ctrl+C`
- Automated: Run `stop-services.bat` if available

### Linux/Mac
```bash
# Kill all Java processes
killall java

# Or stop specific process
kill -9 <PID>
```

## Configuration

### Changing Service Ports

Edit service's `application.properties`:
```properties
# Change port from 8081 to 9081
server.port=9081
```

### Database Configuration

For production, modify each service's `application.properties`:
```properties
# Use MySQL instead of H2
spring.datasource.url=jdbc:mysql://localhost:3306/service_db
spring.datasource.username=root
spring.datasource.password=password
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
```

### Email Configuration

In `notification-service/application.properties`:
```properties
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your-email@gmail.com
spring.mail.password=your-app-password
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
```

## Docker Setup (Optional)

### Prerequisites
- Docker Desktop installed
- docker-compose installed

### Build Docker Images

```bash
# Build all services (with Maven)
./mvnw.cmd clean package -DskipTests

# Start services with docker-compose
docker-compose up -d
```

### Verify Containers

```bash
docker ps

# View logs
docker logs gateway-service
docker logs discovery-service
```

### Stop Docker Services

```bash
docker-compose down
```

## Troubleshooting

### Issue: Port Already in Use
```
Address already in use: bind
```
**Solutions**:
1. Change port in `application.properties`
2. Kill existing process:
   - Windows: `netstat -ano | findstr :8081` then `taskkill /PID <PID> /F`
   - Linux/Mac: `lsof -i :8081` then `kill -9 <PID>`

### Issue: Services Not Registering with Eureka
```
ServiceRegistry: No instances available for service
```
**Solutions**:
1. Check Discovery Service is running: http://localhost:8761
2. Verify Eureka URL in `application.properties`: `eureka.client.service-url.defaultZone=http://localhost:8761/eureka/`
3. Check service logs for connection errors

### Issue: Cannot Connect to H2 Database
```
Connection refused
```
**Solutions**:
1. Ensure service is running
2. Use correct JDBC URL: `jdbc:h2:mem:servicename`
3. Check H2 console is enabled: `spring.h2.console.enabled=true`

### Issue: Build Fails with Maven
```
BUILD FAILURE
```
**Solutions**:
1. Check Java version: `java -version`
2. Clear Maven cache: Remove `~/.m2/repository/com/foodapp`
3. Try offline mode: `./mvnw.cmd clean install -o`
4. Check internet connection for downloading dependencies

### Issue: Service Starts But Returns 404
```
HTTP 404 - Not Found
```
**Solutions**:
1. Check correct port in browser
2. Verify service is running: Check console output
3. Check API endpoint path is correct
4. Services may take 10-15 seconds to fully initialize

### Issue: High Memory Usage
```
OutOfMemoryError
```
**Solutions**:
1. Increase JVM memory: `java -Xmx512m -Xms256m -jar service.jar`
2. Close unnecessary services
3. Use Docker with memory limits

## Performance Tuning

### JVM Options
```bash
java -Xms512m -Xmx1024m \
     -XX:+UseG1GC \
     -XX:MaxGCPauseMillis=200 \
     -jar service.jar
```

### Application Configuration
```properties
# Connection pool
spring.datasource.hikari.maximum-pool-size=20
spring.datasource.hikari.minimum-idle=5

# Logging level
logging.level.root=INFO
logging.level.com.foodapp=DEBUG
```

## Development Workflow

### Modify Code and Reload

1. Stop service: `Ctrl+C`
2. Make code changes
3. Rebuild: `./mvnw.cmd clean install`
4. Restart service

### Using IDE (IntelliJ/Eclipse)

1. Open project in IDE
2. Right-click service → Run/Debug
3. Changes auto-compile
4. Use hot reload (if configured)

### Testing Changes

```bash
# Run tests
./mvnw.cmd test

# Run specific test
./mvnw.cmd test -Dtest=UserServiceTest
```

## Next Steps

1. **Read ARCHITECTURE.md** - Understand system design
2. **Implement Features** - Add entities, repositories, services
3. **Write Tests** - Unit and integration tests
4. **Deploy** - Docker/Kubernetes deployment
5. **Monitor** - Add logging and monitoring

## Resources

- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [Spring Cloud Documentation](https://spring.io/projects/spring-cloud)
- [Eureka Documentation](https://cloud.spring.io/spring-cloud-netflix/multi/multi__service_discovery_eureka_clients.html)
- [Spring Cloud Gateway](https://spring.io/projects/spring-cloud-gateway)

## Support

For issues or questions:
1. Check this guide
2. Review ARCHITECTURE.md
3. Check service logs
4. Create GitHub issue with logs and error messages

## Quick Commands Reference

```bash
# Build all services
./mvnw.cmd clean install -DskipTests

# Build specific service
cd user-service && ../../mvnw.cmd clean install -DskipTests

# Run service with Maven
../../mvnw.cmd spring-boot:run

# Run service from JAR
java -jar target/service-0.0.1-SNAPSHOT.jar

# Change port when running
java -Dserver.port=9081 -jar target/service-0.0.1-SNAPSHOT.jar

# View service logs in real-time
tail -f logs/service.log

# List running Java processes
jps -l

# Kill service
kill -9 <PID>  # Linux/Mac
taskkill /PID <PID> /F  # Windows
```

---

**Ready to start?** Run `start-services.bat` (Windows) or `./start-services.sh` (Linux/Mac)!

