# Food Delivery - Discovery Service

Eureka Service Discovery server enabling service registration and client-side load balancing.

## Technology Stack
- Java 17
- Spring Boot 3.4.3
- Spring Cloud Netflix Eureka Server

## Ports & Endpoints
- Port: `8761`
- Dashboard: `http://localhost:8761`

## Build & Run

### Using Maven Wrapper
```bash
./mvnw clean package
java -jar target/discovery-service-0.0.1-SNAPSHOT.jar
```

### Using Docker
```bash
docker build -t food-delivery-discovery-service .
docker run -p 8761:8761 food-delivery-discovery-service
```
