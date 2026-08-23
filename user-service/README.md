# Food Delivery - User Service

Standalone microservice for User Authentication, JWT tokens, Customer profiles, and Delivery Personnel management in the Food Delivery Platform.

## Technology Stack
- Java 17
- Spring Boot 3.4.3
- Spring Security & JWT (JJWT)
- Spring Data JPA & PostgreSQL / H2
- Flyway DB Migrations
- Spring Cloud Netflix Eureka Client & Config Client
- OpenAPI / Swagger UI (`http://localhost:8081/swagger-ui.html`)

## Ports & Endpoints
- Port: `8081`
- Auth Endpoints: `/api/users/register`, `/api/users/login`
- Profile Endpoints: `/api/users/profile`

## Build & Run

### Using Maven Wrapper
```bash
./mvnw clean package
java -jar target/user-service-0.0.1-SNAPSHOT.jar
```

### Using Docker
```bash
docker build -t food-delivery-user-service .
docker run -p 8081:8081 food-delivery-user-service
```
