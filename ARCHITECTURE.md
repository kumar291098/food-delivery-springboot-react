# Microservices Architecture Documentation

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         CLIENT APPLICATION                              │
└──────────────────────────────────────┬──────────────────────────────────┘
                                       │
                                       │ HTTP/REST
                                       ▼
        ┌──────────────────────────────────────────────────────┐
        │         API GATEWAY SERVICE (Port 8080)              │
        │  - Request routing                                   │
        │  - Load balancing                                    │
        │  - Authentication/Authorization                      │
        └──────────────────────────────────────────────────────┘
                                       │
                ┌──────────────────────┼──────────────────────┬─────────────┐
                │                      │                      │             │
                ▼                      ▼                      ▼             ▼
        ┌──────────────┐        ┌─────────────┐      ┌──────────────┐  ┌──────────────┐
        │   USER       │        │ RESTAURANT  │      │    ORDER     │  │   PAYMENT    │
        │   SERVICE    │        │   SERVICE   │      │   SERVICE    │  │   SERVICE    │
        │ (Port 8081)  │        │ (Port 8082) │      │ (Port 8083)  │  │ (Port 8084)  │
        │              │        │             │      │              │  │              │
        │ - Auth       │        │ - Restaurants│     │ - Orders     │  │ - Transactions
        │ - Profiles   │        │ - Menus     │      │ - Tracking   │  │ - Invoices   │
        │ - Users      │        │ - Items     │      │ - History    │  │ - Payments   │
        └──────────────┘        └─────────────┘      └──────────────┘  └──────────────┘
                │                      │                      │             │
                │      H2 Database     │      H2 Database     │      H2 Database
                └──────────────┬───────┴──────────────┬───────┴─────────────┘
                               │
                ┌──────────────┴──────────────┐
                │  NOTIFICATION SERVICE       │
                │  (Port 8085)                │
                │                            │
                │ - Email Notifications      │
                │ - SMS Notifications        │
                │ - Order Updates            │
                └────────────────────────────┘

                        ┌──────────────────────┐
                        │  DISCOVERY SERVICE   │
                        │  (Eureka - Port 8761)│
                        │                      │
                        │ - Service Registry   │
                        │ - Service Discovery  │
                        │ - Health Monitoring  │
                        └──────────────────────┘
```

## Service Details

### 1. Discovery Service (Eureka)
**Port**: 8761

**Responsibility**:
- Maintains a registry of all available microservices
- Enables dynamic service discovery
- Monitors service health

**Key Components**:
- Eureka Server
- Service Registration
- Service Lookup

**Technology**: Spring Cloud Netflix Eureka

---

### 2. Gateway Service
**Port**: 8080

**Responsibility**:
- Single entry point for all client requests
- Routing requests to appropriate services
- Cross-cutting concerns (auth, logging, rate limiting)

**Routes**:
- `/api/users/**` → User Service (8081)
- `/api/restaurants/**` → Restaurant Service (8082)
- `/api/orders/**` → Order Service (8083)
- `/api/payments/**` → Payment Service (8084)
- `/api/notifications/**` → Notification Service (8085)

**Technology**: Spring Cloud Gateway

---

### 3. User Service
**Port**: 8081
**Database**: H2 (in-memory, USERDB)

**Responsibilities**:
- User registration and management
- Authentication
- User profile management
- Password management

**Key Entities**:
```java
User
├── userId (PK)
├── email (Unique)
├── password (Hashed)
├── firstName
├── lastName
├── phoneNumber
├── address
├── createdDate
└── isActive
```

**API Endpoints**:
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - User login
- `GET /api/users/{id}` - Get user profile
- `PUT /api/users/{id}` - Update user profile
- `DELETE /api/users/{id}` - Delete user

---

### 4. Restaurant Service
**Port**: 8082
**Database**: H2 (in-memory, RESTAURANTDB)

**Responsibilities**:
- Restaurant management
- Menu management
- Food item management
- Restaurant ratings and reviews

**Key Entities**:
```java
Restaurant
├── restaurantId (PK)
├── name
├── location
├── cuisineType
├── rating
├── operatingHours
├── phoneNumber
└── isActive

MenuItem
├── menuItemId (PK)
├── restaurantId (FK)
├── name
├── description
├── price
├── category
├── image
└── isAvailable
```

**API Endpoints**:
- `GET /api/restaurants` - List all restaurants
- `GET /api/restaurants/{id}` - Get restaurant details
- `POST /api/restaurants` - Create restaurant (admin)
- `GET /api/restaurants/{id}/menu` - Get restaurant menu
- `POST /api/restaurants/{id}/menu` - Add menu item
- `PUT /api/restaurants/{id}/menu/{itemId}` - Update menu item

---

### 5. Order Service
**Port**: 8083
**Database**: H2 (in-memory, ORDERDB)

**Responsibilities**:
- Order creation and management
- Order status tracking
- Order history
- Integration with other services

**Key Entities**:
```java
Order
├── orderId (PK)
├── userId (FK)
├── restaurantId (FK)
├── orderDate
├── totalAmount
├── status (PENDING, CONFIRMED, PROCESSING, OUT_FOR_DELIVERY, DELIVERED)
├── deliveryAddress
├── specialInstructions
└── updatedDate

OrderItem
├── orderItemId (PK)
├── orderId (FK)
├── menuItemId (FK)
├── quantity
└── price
```

**Status Flow**:
```
PENDING → CONFIRMED → PROCESSING → OUT_FOR_DELIVERY → DELIVERED
  ↓                      ↓              ↓
CANCELLED            CANCELLED        CANCELLED
```

**API Endpoints**:
- `POST /api/orders` - Create new order
- `GET /api/orders/{id}` - Get order details
- `GET /api/orders/user/{userId}` - Get user's orders
- `GET /api/orders/restaurant/{restaurantId}` - Get restaurant's orders
- `PUT /api/orders/{id}/status` - Update order status
- `DELETE /api/orders/{id}` - Cancel order

---

### 6. Payment Service
**Port**: 8084
**Database**: H2 (in-memory, PAYMENTDB)

**Responsibilities**:
- Payment processing
- Transaction management
- Invoice generation
- Payment status tracking

**Key Entities**:
```java
Payment
├── paymentId (PK)
├── orderId (FK)
├── userId (FK)
├── amount
├── paymentMethod (CREDIT_CARD, DEBIT_CARD, UPI, NET_BANKING)
├── status (PENDING, PROCESSING, SUCCESS, FAILED, REFUNDED)
├── transactionId
├── timestamp
└── remarks

Invoice
├── invoiceId (PK)
├── orderId (FK)
├── paymentId (FK)
├── issueDate
├── totalAmount
├── tax
└── notes
```

**API Endpoints**:
- `POST /api/payments` - Process payment
- `GET /api/payments/{id}` - Get payment details
- `GET /api/payments/order/{orderId}` - Get payment for order
- `GET /api/payments/user/{userId}` - Get user's payments
- `POST /api/payments/{id}/refund` - Refund payment

---

### 7. Notification Service
**Port**: 8085

**Responsibilities**:
- Send email notifications
- Send SMS notifications
- Send push notifications
- Notification scheduling

**Notification Types**:
- Order Confirmation
- Order Status Update
- Delivery Notification
- Promotional Emails
- System Alerts

**Configuration**:
- Email: Gmail SMTP (configure in application.properties)
- SMS: Twilio (configure credentials)
- Push: Firebase Cloud Messaging

**API Endpoints**:
- `POST /api/notifications/email` - Send email
- `POST /api/notifications/sms` - Send SMS
- `GET /api/notifications/user/{userId}` - Get user notifications

---

## Data Flow Examples

### Order Placement Flow

```
1. Client → API Gateway (/api/orders)
2. API Gateway → Order Service
3. Order Service:
   - Validates user (User Service)
   - Validates restaurant (Restaurant Service)
   - Creates order in database
   - Returns order ID
4. API Gateway → Response to Client
5. Order Service → Notification Service (Email confirmation)
```

### Payment Processing Flow

```
1. Client → API Gateway (/api/payments)
2. API Gateway → Payment Service
3. Payment Service:
   - Validates order (Order Service)
   - Processes payment
   - Updates payment status
   - Triggers notification
4. Payment Service → Notification Service (Payment confirmation)
5. Payment Service → Order Service (Update order status)
```

---

## Communication Patterns

### Service-to-Service Communication

#### 1. **Synchronous (REST)**
Used for immediate responses and real-time data:
```
Order Service → User Service (Validate user)
Order Service → Restaurant Service (Check menu items)
Payment Service → Order Service (Update order status)
```

#### 2. **Asynchronous (Message Queue)**
Planned implementation for:
- Order notifications
- Payment confirmations
- Status updates

---

## Deployment Architecture

### Local Development
- Single machine
- All services on different ports (8080-8085, 8761)
- H2 in-memory databases

### Docker Deployment
- Each service in a container
- Shared network bridge
- Volume mounts for JAR files
- Environment variables for configuration

### Kubernetes Deployment (Future)
- Service mesh (Istio)
- Load balancing
- Auto-scaling
- Service discovery via DNS

---

## Security Architecture

### API Gateway Security
- Request authentication
- JWT token validation
- CORS handling
- Rate limiting

### Service-to-Service Security
- Service-to-service authentication
- Encrypted communication
- API keys/tokens

### Data Security
- Password hashing (BCrypt)
- Sensitive data encryption
- SQL injection prevention
- HTTPS/TLS

---

## Monitoring and Logging

### Health Checks
- Service availability
- Database connectivity
- Memory usage
- Response times

### Logging
- Centralized logging (planned)
- Request/response logging
- Error tracking
- Performance metrics

### Tools (Planned)
- Spring Boot Actuator
- Micrometer metrics
- Zipkin for distributed tracing
- ELK Stack for logging

---

## Scalability Considerations

### Horizontal Scaling
- Services can run on different machines
- Load balancing via Gateway
- Database sharding for large datasets

### Vertical Scaling
- Increase memory/CPU per service
- Connection pool optimization
- Cache implementation

### Caching Strategy
- Redis for distributed caching
- Local caching in services
- Cache invalidation policies

---

## Error Handling

### Error Response Format
```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Invalid order data",
  "path": "/api/orders"
}
```

### Retry Mechanism
- Exponential backoff
- Circuit breaker pattern
- Maximum retry attempts

---

## Performance Optimization

### Database Optimization
- Indexing strategies
- Query optimization
- Connection pooling

### Caching
- Cache-aside pattern
- Cache warm-up
- TTL management

### API Optimization
- Response pagination
- Compression
- Async processing

---

## Testing Strategy

### Unit Testing
- Service layer tests
- Repository tests
- Utility function tests

### Integration Testing
- Service-to-service communication
- Database integration
- API endpoint testing

### Load Testing
- JMeter/Gatling
- Performance baselines
- Stress testing

---

## Future Enhancements

1. **Microservices Enhancements**
   - Add ConfigServer for centralized configuration
   - Add ServiceRegistry with health monitoring
   - Add Circuit Breaker (Resilience4j)

2. **Infrastructure**
   - Containerize with Docker
   - Kubernetes deployment
   - Service mesh (Istio)

3. **Observability**
   - Distributed tracing (Spring Cloud Sleuth + Zipkin)
   - Centralized logging (ELK Stack)
   - Metrics collection (Prometheus + Grafana)

4. **Advanced Features**
   - Message queues (RabbitMQ/Kafka)
   - Caching (Redis)
   - GraphQL API
   - Real-time notifications (WebSockets)

---

## Quick Reference

| Service | Port | Database | Purpose |
|---------|------|----------|---------|
| Gateway | 8080 | - | API routing |
| User | 8081 | H2 (userdb) | User management |
| Restaurant | 8082 | H2 (restaurantdb) | Restaurant/menu |
| Order | 8083 | H2 (orderdb) | Order processing |
| Payment | 8084 | H2 (paymentdb) | Payment handling |
| Notification | 8085 | - | Notifications |
| Discovery | 8761 | - | Service registry |

