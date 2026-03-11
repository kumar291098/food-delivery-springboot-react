# Food Delivery System - Microservices Architecture

## Overview

This is a complete microservices-based Food Delivery System built with Spring Boot. The architecture includes service discovery, API gateway, and multiple domain services.

## Microservices

### 1. **Discovery Service** (Port: 8761)
- **Service**: Eureka Server
- **Purpose**: Service registry for all microservices
- **URL**: http://localhost:8761/eureka/
- **Dashboard**: http://localhost:8761

### 2. **Gateway Service** (Port: 8080)
- **Service**: API Gateway (Spring Cloud Gateway)
- **Purpose**: Single entry point for all client requests, routing to appropriate services
- **URL**: http://localhost:8080

### 3. **User Service** (Port: 8081)
- **Database**: H2 (in-memory)
- **Purpose**: User authentication, profile management, and registration
- **Database Console**: http://localhost:8081/h2-console
- **API Endpoints**:
  - `POST /api/users/register` - Register new user
  - `POST /api/users/login` - User login
  - `GET /api/users/{id}` - Get user profile

### 4. **Restaurant Service** (Port: 8082)
- **Database**: H2 (in-memory)
- **Purpose**: Restaurant management, menu items, and restaurant details
- **Database Console**: http://localhost:8082/h2-console
- **API Endpoints**:
  - `GET /api/restaurants` - List all restaurants
  - `GET /api/restaurants/{id}` - Get restaurant details
  - `POST /api/restaurants` - Create new restaurant
  - `GET /api/restaurants/{id}/menu` - Get restaurant menu

### 5. **Order Service** (Port: 8083)
- **Database**: H2 (in-memory)
- **Purpose**: Order processing, order history, and order tracking
- **Database Console**: http://localhost:8083/h2-console
- **API Endpoints**:
  - `POST /api/orders` - Create new order
  - `GET /api/orders/{id}` - Get order details
  - `GET /api/orders/user/{userId}` - Get user's orders
  - `PUT /api/orders/{id}/status` - Update order status

### 6. **Payment Service** (Port: 8084)
- **Database**: H2 (in-memory)
- **Purpose**: Payment processing and transaction management
- **Database Console**: http://localhost:8084/h2-console
- **API Endpoints**:
  - `POST /api/payments` - Process payment
  - `GET /api/payments/{id}` - Get payment details
  - `GET /api/payments/order/{orderId}` - Get payment for order

### 7. **Notification Service** (Port: 8085)
- **Purpose**: Send emails and SMS notifications
- **Features**: 
  - Order confirmation emails
  - Delivery status updates
  - User notifications
- **Configuration**: Update email credentials in `application.properties`

## Project Structure

```
food-delivery/
├── discovery-service/           # Eureka Server
├── gateway-service/             # API Gateway
├── user-service/                # User Management
├── restaurant-service/          # Restaurant Management
├── order-service/               # Order Processing
├── payment-service/             # Payment Processing
├── notification-service/        # Notifications
└── pom.xml                       # Parent POM
```

## Prerequisites

- Java 17 or higher
- Maven 3.6+
- Windows PowerShell (for scripts) or Unix shell

## Quick Start

### Build All Services

```bash
cd food-delivery
./mvnw.cmd clean install -DskipTests
```

### Run All Services

**Start Discovery Service First:**
```bash
cd discovery-service
java -jar target/discovery-service-0.0.1-SNAPSHOT.jar
```

Wait 5 seconds for Eureka to start, then start other services.

**Start Gateway Service:**
```bash
cd gateway-service
java -jar target/gateway-service-0.0.1-SNAPSHOT.jar
```

**Start Other Services (in separate terminals):**
```bash
cd user-service
java -jar target/user-service-0.0.1-SNAPSHOT.jar
```

```bash
cd restaurant-service
java -jar target/restaurant-service-0.0.1-SNAPSHOT.jar
```

```bash
cd order-service
java -jar target/order-service-0.0.1-SNAPSHOT.jar
```

```bash
cd payment-service
java -jar target/payment-service-0.0.1-SNAPSHOT.jar
```

```bash
cd notification-service
java -jar target/notification-service-0.0.1-SNAPSHOT.jar
```

### Access Services

| Service | URL | Port |
|---------|-----|------|
| API Gateway | http://localhost:8080 | 8080 |
| Discovery (Eureka) | http://localhost:8761 | 8761 |
| User Service | http://localhost:8081 | 8081 |
| Restaurant Service | http://localhost:8082 | 8082 |
| Order Service | http://localhost:8083 | 8083 |
| Payment Service | http://localhost:8084 | 8084 |
| Notification Service | http://localhost:8085 | 8085 |

## Running with Maven

Run each service directly with Maven (no JAR build needed):

```bash
cd user-service
../../mvnw.cmd spring-boot:run
```

## Database Access

H2 Database Consoles (for services with databases):

- User Service: http://localhost:8081/h2-console
- Restaurant Service: http://localhost:8082/h2-console
- Order Service: http://localhost:8083/h2-console
- Payment Service: http://localhost:8084/h2-console

**H2 Credentials:**
- Username: `sa`
- Password: (empty)

## Service Communication

Services communicate through:
1. **Direct HTTP Calls** - Using RestTemplate or WebClient
2. **Service Discovery** - Using Eureka for service location
3. **API Gateway** - Routes external requests to appropriate services

## Key Features

✅ **Service Discovery** - Automatic service registration and discovery using Eureka
✅ **API Gateway** - Central routing point with Spring Cloud Gateway
✅ **Database Isolation** - Each service has its own database
✅ **Configuration Management** - Centralized configuration per service
✅ **H2 In-Memory Databases** - No external DB setup required for development
✅ **Scalability** - Services can be run on different ports/machines
✅ **Monitoring** - Actuator endpoints for health checks

## Configuration

### Adding Gateway Routes

Edit `gateway-service/src/main/resources/application.properties`:

```properties
spring.cloud.gateway.routes[0].id=user-service
spring.cloud.gateway.routes[0].uri=http://localhost:8081
spring.cloud.gateway.routes[0].predicates[0]=Path=/api/users/**
```

### Adding Eureka Clients

Services automatically register with Eureka via:

```properties
eureka.client.service-url.defaultZone=http://localhost:8761/eureka/
```

## Development

### Adding a New Service

1. Create new directory: `new-service`
2. Create directory structure:
   ```
   new-service/
   ├── src/main/java/com/foodapp/newservice/
   ├── src/main/resources/
   └── src/test/java/
   ```
3. Add to parent `pom.xml` modules section
4. Create service-specific `pom.xml`
5. Create Spring Boot application class with `@SpringBootApplication`

### Adding Database Entities

1. Create entity class with `@Entity` and `@Table` annotations
2. Create JPA Repository interface extending `JpaRepository<Entity, ID>`
3. Use in service layer with `@Service` annotation

## Troubleshooting

### Port Already in Use
- Change the port in service's `application.properties`
- Kill existing process: `netstat -ano | findstr :PORT_NUMBER`

### Services Not Registering with Eureka
- Ensure Discovery Service is running first
- Check Eureka dashboard: http://localhost:8761
- Verify `eureka.client.service-url.defaultZone` is correct

### H2 Console Access
- Ensure service is running
- URL: http://localhost:SERVICE_PORT/h2-console
- JDBC URL: `jdbc:h2:mem:SERVICE_NAME`

### Build Failures
- Clean Maven cache: `rm -rf ~/.m2/repository/com/foodapp` (Unix) or delete folder (Windows)
- Rebuild: `mvnw.cmd clean install -DskipTests`

## Next Steps

1. **Add API Documentation** - Implement Swagger/SpringFox for API docs
2. **Service-to-Service Communication** - Add Feign clients for inter-service calls
3. **Configuration Server** - Use Spring Cloud Config for centralized config
4. **Message Queue** - Add RabbitMQ/Kafka for async communication
5. **Security** - Implement OAuth2/JWT authentication
6. **Load Balancing** - Add Ribbon or LoadBalancer client
7. **Circuit Breaker** - Add Resilience4j for fault tolerance
8. **Tracing** - Add Spring Cloud Sleuth + Zipkin for distributed tracing
9. **Docker** - Containerize services and add docker-compose
10. **Kubernetes** - Deploy to K8s with Helm charts

## Contributing

When adding new services:
1. Follow naming convention: `service-name-service`
2. Use `@SpringBootApplication` annotation
3. Register with Eureka using `spring.cloud.netflix.eureka.client`
4. Add service port to this README

## License

MIT License - Open for educational and commercial use

## Support

For issues, questions, or contributions, please create an issue in the repository.

