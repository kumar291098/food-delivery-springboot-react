# Food Delivery - Order Service

Standalone microservice for Order creation, processing, status updates, and RabbitMQ event messaging.

## Technology Stack
- Java 17
- Spring Boot 3.4.3
- Spring Data JPA & PostgreSQL / H2
- RabbitMQ Integration (AMQP)
- Resilience4j Circuit Breaker
- Spring Cloud Netflix Eureka Client & Config Client
- OpenAPI / Swagger UI (`http://localhost:8083/swagger-ui.html`)

## Ports & Endpoints
- Port: `8083`
- Endpoints: `/api/orders`

## Build & Run

### Using Maven Wrapper
```bash
./mvnw clean package
java -jar target/order-service-0.0.1-SNAPSHOT.jar
```

### Using Docker
```bash
docker build -t food-delivery-order-service .
docker run -p 8083:8083 food-delivery-order-service
```
