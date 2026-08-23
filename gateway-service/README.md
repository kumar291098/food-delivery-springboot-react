# Food Delivery - API Gateway Service

Spring Cloud API Gateway handling unified API routing, JWT token validation, rate limiting, and cross-cutting concerns.

## Technology Stack
- Java 17
- Spring Boot 3.4.3 (WebFlux)
- Spring Cloud Gateway
- Spring Cloud Eureka Client

## Ports & Endpoints
- Port: `8080`
- Unified Base URL: `http://localhost:8080/api/...`

## Build & Run

### Using Maven Wrapper
```bash
./mvnw clean package
java -jar target/gateway-service-0.0.1-SNAPSHOT.jar
```

### Using Docker
```bash
docker build -t food-delivery-gateway-service .
docker run -p 8080:8080 food-delivery-gateway-service
```
