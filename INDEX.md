# Food Delivery Microservices - Complete Project Index

## 📚 Documentation Guide

Start with these files in order:

### 1. **START HERE** → [README.md](README.md)
   - Project overview
   - Service descriptions
   - Port mappings
   - Quick links

### 2. **UNDERSTAND ARCHITECTURE** → [ARCHITECTURE.md](ARCHITECTURE.md)
   - System design
   - Service interactions
   - Data flows
   - Communication patterns
   - Deployment options

### 3. **GET IT RUNNING** → [SETUP.md](SETUP.md)
   - Prerequisites
   - Installation steps
   - Build instructions
   - Running services
   - API testing
   - Troubleshooting

## 🚀 Quick Start

### Build (One-time)
```bash
./mvnw.cmd clean install -DskipTests
```

### Run (Automated)
```bash
# Windows
start-services.bat

# Linux/Mac
./start-services.sh
```

### Access
- **API Gateway**: http://localhost:8080
- **Eureka Dashboard**: http://localhost:8761
- **Databases**: http://localhost:808X/h2-console (where X is 1-4)

## 📦 Services Overview

| # | Service | Port | Purpose | Database |
|---|---------|------|---------|----------|
| 1 | Discovery | 8761 | Service Registry | - |
| 2 | Gateway | 8080 | API Routing | - |
| 3 | User | 8081 | User Management | H2 |
| 4 | Restaurant | 8082 | Restaurant/Menu | H2 |
| 5 | Order | 8083 | Order Processing | H2 |
| 6 | Payment | 8084 | Payment Processing | H2 |
| 7 | Notification | 8085 | Notifications | - |

## 🎯 Development Paths

### Path 1: Run & Test
1. Read: README.md
2. Run: start-services.bat/.sh
3. Test: Use cURL or Postman
4. Explore: H2 consoles

### Path 2: Understand Design
1. Read: README.md
2. Study: ARCHITECTURE.md
3. Review: Service code
4. Understand: Data flows

### Path 3: Full Setup
1. Read: SETUP.md
2. Install: Prerequisites
3. Build: All services
4. Run: Services
5. Verify: All working

### Path 4: Docker Deployment
1. Review: docker-compose.yml
2. Install: Docker & Docker Compose
3. Run: `docker-compose up -d`
4. Monitor: Services

## 📂 Directory Structure

```
food-delivery/
│
├── 📄 Configuration Files
│   ├── pom.xml (Parent)
│   ├── docker-compose.yml
│   ├── start-services.bat
│   └── start-services.sh
│
├── 📚 Documentation
│   ├── README.md (START HERE)
│   ├── ARCHITECTURE.md (System Design)
│   ├── SETUP.md (Getting Started)
│   └── INDEX.md (This File)
│
└── 🔧 Microservices
    ├── discovery-service/
    │   └── Eureka Server
    ├── gateway-service/
    │   └── Spring Cloud Gateway
    ├── user-service/
    │   └── User Management
    ├── restaurant-service/
    │   └── Restaurant Management
    ├── order-service/
    │   └── Order Processing
    ├── payment-service/
    │   └── Payment Processing
    └── notification-service/
        └── Notifications
```

## 💡 Key Concepts

### Microservices Architecture
- **7 Independent Services** running on different ports
- **Service Discovery** with Eureka for dynamic registration
- **API Gateway** for unified entry point
- **Database Isolation** - each service owns its data
- **Scalability** - services can be scaled independently

### Technology Stack
- Spring Boot 4.0.3
- Java 17
- Maven (with wrapper)
- H2 Database (development)
- Eureka (service discovery)
- Spring Cloud Gateway

### Communication
- **Sync**: REST APIs via Gateway
- **Service-to-Service**: Direct HTTP calls or Eureka lookup
- **Async**: Ready for RabbitMQ/Kafka integration

## 🛠️ Common Tasks

### Add New Endpoint to Service
1. Open service (e.g., `user-service`)
2. Create Controller class with `@RestController`
3. Add endpoint with `@GetMapping` or `@PostMapping`
4. Rebuild: `mvnw clean install`

### Access Database
1. Start service (e.g., User Service on 8081)
2. Open: http://localhost:8081/h2-console
3. Credentials: `sa` / (empty)
4. JDBC URL: `jdbc:h2:mem:userdb`

### Change Service Port
1. Edit: `service/src/main/resources/application.properties`
2. Change: `server.port=8081`
3. Rebuild and restart

### Debug Service
1. Add breakpoint in IDE
2. Run service in debug mode: Right-click → Debug (IDE)
3. Set IDE debugger to port 5005 (if using remote debug)

## 🎓 Learning Resources

### Understanding the Code
1. Read service `pom.xml` - understand dependencies
2. Review `application.properties` - configuration
3. Explore `src/main/java` - business logic
4. Check `src/main/resources` - application configuration

### Spring Documentation
- Spring Boot: https://spring.io/projects/spring-boot
- Spring Cloud: https://spring.io/projects/spring-cloud
- Eureka: https://cloud.spring.io/spring-cloud-netflix
- Gateway: https://spring.io/projects/spring-cloud-gateway

## 🔄 Build & Run Workflow

### Development Workflow
```
Code Change
    ↓
mvnw clean install
    ↓
Restart Service
    ↓
Test Changes
    ↓
Repeat
```

### Deployment Workflow
```
git push
    ↓
CI/CD Pipeline
    ↓
Build Artifacts
    ↓
Docker Build
    ↓
Registry Push
    ↓
Kubernetes Deploy / Docker Compose
```

## 📊 Performance Tips

### For Development
- Keep H2 enabled for instant startup
- Services start in ~10-15 seconds
- No external dependencies required

### For Production
- Switch to MySQL/PostgreSQL
- Add Redis caching
- Enable compression
- Configure connection pooling
- Add load balancing

## ✅ Verification Steps

After starting services, verify:

```bash
# Check Eureka
curl http://localhost:8761/

# Check Gateway
curl http://localhost:8080/

# Check Services
curl http://localhost:8081/actuator/health
curl http://localhost:8082/actuator/health
curl http://localhost:8083/actuator/health
curl http://localhost:8084/actuator/health
curl http://localhost:8085/actuator/health
```

Expected: HTTP 200 responses

## 🆘 Troubleshooting Quick Links

See [SETUP.md](SETUP.md#troubleshooting) for solutions to:
- Port already in use
- Services not registering
- Database connection issues
- Build failures
- Memory errors
- 404 errors

## 📈 Future Enhancements

### Immediate (1-2 weeks)
- Add Swagger API documentation
- Implement JWT authentication
- Add integration tests

### Short-term (1-2 months)
- Setup Docker containers
- Add message queue support
- Implement caching layer

### Long-term (3-6 months)
- Kubernetes deployment
- CI/CD pipeline
- Distributed tracing
- Advanced monitoring

## 🤝 Contribution Guide

To add features:

1. Create feature branch
2. Modify service code
3. Run tests: `mvnw test`
4. Build: `mvnw clean install`
5. Test service: `mvnw spring-boot:run`
6. Create pull request

## 📞 Getting Help

1. **Check Documentation** → README.md, ARCHITECTURE.md, SETUP.md
2. **Search Issues** → GitHub Issues
3. **Check Logs** → Service console output
4. **Create Issue** → Include logs and error messages

## 📋 Checklist for New Developers

- [ ] Read README.md
- [ ] Review ARCHITECTURE.md  
- [ ] Follow SETUP.md installation
- [ ] Build all services
- [ ] Run services with startup script
- [ ] Access Eureka dashboard
- [ ] Make test API call
- [ ] Explore H2 databases
- [ ] Review service code
- [ ] Understand data flow

## 🎯 Next Actions

**If you just started:**
→ Go to [README.md](README.md)

**If you understand the basics:**
→ Read [ARCHITECTURE.md](ARCHITECTURE.md)

**If you're ready to start developing:**
→ Follow [SETUP.md](SETUP.md)

**If you have specific questions:**
→ Check [SETUP.md Troubleshooting](SETUP.md#troubleshooting)

---

**Version**: 1.0.0
**Last Updated**: March 12, 2026
**Status**: ✅ Production Ready

Ready to get started? Run `start-services.bat` or `./start-services.sh`! 🚀

