# Food Delivery - Notification Service

Standalone microservice listening to RabbitMQ events to dispatch Email and SMS notifications to customers, restaurants, and delivery drivers.

## Technology Stack
- Java 17
- Spring Boot 3.4.3
- Spring Boot Starter AMQP (RabbitMQ)
- Spring Boot Starter Mail
- Spring Cloud Netflix Eureka Client & Config Client
- OpenAPI / Swagger UI (`http://localhost:8085/swagger-ui.html`)

## Ports & Endpoints
- Port: `8085`

## Build & Run

### Using Maven Wrapper
```bash
./mvnw clean package
java -jar target/notification-service-0.0.1-SNAPSHOT.jar
```

### Using Docker
```bash
docker build -t food-delivery-notification-service .
docker run -p 8085:8085 food-delivery-notification-service
```
