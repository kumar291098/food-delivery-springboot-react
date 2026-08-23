# Food Delivery System Architecture & Design

This document details the complete end-to-end **System Architecture** of the Food Delivery Microservices Platform.

---

## 🎨 Visual System Architecture Diagram

![Food Delivery Microservices Architecture](./system_architecture_diagram.png)

---

## 🧩 Interactive Component Architecture (Mermaid)

```mermaid
flowchart TB
    subgraph Clients["Frontend Client Layer"]
        C_APP["Customer Web App\n(Port 3000)"]
        R_APP["Restaurant Admin Portal\n(Port 3001)"]
        D_APP["Delivery Agent App\n(Port 3002)"]
    end

    subgraph Infrastructure["Infrastructure & Edge Layer"]
        GW["API Gateway\n(Port 8080)\n[JWT Auth & Routing]"]
        EUREKA["Eureka Discovery\n(Port 8761)"]
        CONFIG["Config Server\n(Port 8888)"]
    end

    subgraph CoreServices["Core Microservices Domain"]
        USER["User Service\n(Port 8081)\n[Auth, Profiles, Drivers]"]
        REST["Restaurant Service\n(Port 8082)\n[Restaurants, Menus]"]
        ORDER["Order Service\n(Port 8083)\n[Saga / Order Flow]"]
        PAYMENT["Payment Service\n(Port 8084)\n[Transactions & Ledger]"]
        NOTIF["Notification Service\n(Port 8085)\n[Email & SMS Listener]"]
    end

    subgraph DataAndMessaging["Data Stores & Event Broker"]
        PG_USER[("PostgreSQL\nUser DB")]
        PG_REST[("PostgreSQL\nRestaurant DB")]
        PG_ORDER[("PostgreSQL\nOrder DB")]
        PG_PAY[("PostgreSQL\nPayment DB")]
        RABBIT[("RabbitMQ Broker\n(Port 5672 / 15672)")]
        ZIPKIN["Zipkin Tracing\n(Port 9411)"]
    end

    %% Client to Gateway Connections
    C_APP -->|HTTP / REST| GW
    R_APP -->|HTTP / REST| GW
    D_APP -->|HTTP / REST| GW

    %% Service Registration & Config
    GW -.->|Register / Discover| EUREKA
    USER -.->|Register / Discover| EUREKA
    REST -.->|Register / Discover| EUREKA
    ORDER -.->|Register / Discover| EUREKA
    PAYMENT -.->|Register / Discover| EUREKA
    NOTIF -.->|Register / Discover| EUREKA

    GW -.->|Fetch Config| CONFIG
    USER -.->|Fetch Config| CONFIG
    REST -.->|Fetch Config| CONFIG
    ORDER -.->|Fetch Config| CONFIG
    PAYMENT -.->|Fetch Config| CONFIG
    NOTIF -.->|Fetch Config| CONFIG

    %% Gateway Routing
    GW -->|/api/users| USER
    GW -->|/api/restaurants| REST
    GW -->|/api/orders| ORDER
    GW -->|/api/payments| PAYMENT

    %% Microservice Inter-communication
    ORDER -->|Sync REST / Feign| REST
    ORDER -->|Async AMQP Event| RABBIT
    RABBIT -->|Consume Order Events| NOTIF
    PAYMENT -->|Async AMQP Event| RABBIT

    %% Persistence Layer
    USER --> PG_USER
    REST --> PG_REST
    ORDER --> PG_ORDER
    PAYMENT --> PG_PAY

    %% Tracing telemetry
    GW -.->|Brave / Zipkin| ZIPKIN
    USER -.->|Brave / Zipkin| ZIPKIN
    ORDER -.->|Brave / Zipkin| ZIPKIN
    PAYMENT -.->|Brave / Zipkin| ZIPKIN
```

---

## 🏛️ System Layer Breakdown & Design Patterns

### 1. Client Applications (Frontend Layer)
- **Customer Web App (`:3000`)**: Allows users to register/login, browse restaurants & menus, manage shopping carts, checkout, and view order delivery status.
- **Restaurant Owner Portal (`:3001`)**: Enables restaurant managers to update menus, toggle item availability, and accept/prepare incoming orders.
- **Delivery Agent App (`:3002`)**: Dedicated portal for delivery personnel to view active delivery tasks, update delivery status, and complete orders.

### 2. Edge & Infrastructure Layer
- **Spring Cloud API Gateway (`:8080`)**: Single entrance point for all external traffic. Performs JWT token verification, dynamic route allocation, CORS handling, and request logging.
- **Eureka Discovery Server (`:8761`)**: Central service registry allowing services to locate and communicate with each other dynamically without hardcoded IPs.
- **Config Server (`:8888`)**: Central configuration management serving environment-specific properties from git/native configuration storage.

### 3. Core Microservices Domain
- **User Service (`:8081`)**: Manages customer profiles, delivery driver records, BCrypt password encryption, and JWT token issuance.
- **Restaurant Service (`:8082`)**: Catalog of restaurants, categories, menu items, prices, and availability flags.
- **Order Service (`:8083`)**: Handles order creation, cart calculations, order state transitions (CREATED, CONFIRMED, DELIVERED), and AMQP event publication.
- **Payment Service (`:8084`)**: Simulates payment processing, payment transactions, and payment status updates.
- **Notification Service (`:8085`)**: Asynchronous RabbitMQ listener that formats and dispatches email and SMS alerts when order events fire.

### 4. Data & Asynchronous Event Infrastructure
- **Database Per Service**: Each microservice maintains its own isolated PostgreSQL database schema to enforce domain boundaries and eliminate tight coupling.
- **RabbitMQ Message Broker (`:5672`)**: Decouples long-running side-effects (notifications, analytics) from HTTP request/response loops.
- **OpenZipkin (`:9411`)**: Provides end-to-end distributed tracing across all HTTP and AMQP service hops.

---

## 🔐 Security & Communication Flow

1. **Authentication Flow**:
   - Customer logs in via Gateway `POST /api/users/login`.
   - `User Service` validates credentials and returns a signed **JWT Bearer Token**.
   - Subsequent HTTP requests include `Authorization: Bearer <token>`.
   - `API Gateway` validates token integrity before forwarding traffic downstream.

2. **Order Placement Flow (Event-Driven)**:
   - Client sends `POST /api/orders` to Gateway.
   - `Order Service` validates order data, persists order to `Order DB`, and publishes an `order.created` event to RabbitMQ.
   - `Notification Service` listens to `order.created` and asynchronously dispatches confirmation notifications.
