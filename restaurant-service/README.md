# Food Delivery - Restaurant Service

Standalone microservice for Restaurant management, Menu creation, Category cataloging, and Item availability.

## Technology Stack
- Java 17
- Spring Boot 3.4.3
- Spring Data JPA & PostgreSQL / H2
- Flyway DB Migrations
- Spring Cloud Netflix Eureka Client & Config Client
- OpenAPI / Swagger UI (`http://localhost:8082/swagger-ui.html`)

## Ports & Endpoints
- Port: `8082`
- Endpoints: `/api/restaurants`, `/api/menus`

## Build & Run

### Using Maven Wrapper
```bash
./mvnw clean package
java -jar target/restaurant-service-0.0.1-SNAPSHOT.jar
```

### Using Docker
```bash
docker build -t food-delivery-restaurant-service .
docker run -p 8082:8082 food-delivery-restaurant-service
```
