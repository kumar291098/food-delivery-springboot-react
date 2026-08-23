# Food Delivery - Payment Service

Standalone microservice for Payment processing, gateway simulation, and payment transaction logs.

## Technology Stack
- Java 17
- Spring Boot 3.4.3
- Spring Data JPA & PostgreSQL / H2
- Flyway DB Migrations
- Spring Cloud Netflix Eureka Client & Config Client
- OpenAPI / Swagger UI (`http://localhost:8084/swagger-ui.html`)

## Ports & Endpoints
- Port: `8084`
- Endpoints: `/api/payments`

## Build & Run

### Using Maven Wrapper
```bash
./mvnw clean package
java -jar target/payment-service-0.0.1-SNAPSHOT.jar
```

### Using Docker
```bash
docker build -t food-delivery-payment-service .
docker run -p 8084:8084 food-delivery-payment-service
```
