# Food Delivery - Configuration Server

Centralized Spring Cloud Config Server providing configuration properties to all microservices.

## Technology Stack
- Java 17
- Spring Boot 3.4.3
- Spring Cloud Config Server

## Ports & Endpoints
- Port: `8888`
- Native Search Locations: `config-repo`

## Build & Run

### Using Maven Wrapper
```bash
./mvnw clean package
java -jar target/config-server-0.0.1-SNAPSHOT.jar
```

### Using Docker
```bash
docker build -t food-delivery-config-server .
docker run -p 8888:8888 food-delivery-config-server
```
