# 🏛️ 01 — Microservices Fundamentals

> **Covers Foundation & Architectural Trade-offs**  
> Understanding when to transition from a Monolith to Microservices, defining clean Domain Boundaries, adopting the **Database-per-Service** pattern, and contrasting **Synchronous vs. Asynchronous** inter-service communication with production Spring Boot code and architectural illustrations.

---

## 📑 Table of Contents
1. [Monolithic Architecture: Anatomy & Challenges](#1-monolithic-architecture-anatomy--challenges)
2. [Microservices Architecture: Core Principles & Trade-offs](#2-microservices-architecture-core-principles--trade-offs)
3. [Domain Boundaries & Sizing Services](#3-domain-boundaries--sizing-services)
4. [Database-per-Service Pattern](#4-database-per-service-pattern)
5. [End-to-End Microservice Topology](#5-end-to-end-microservice-topology)
6. [Synchronous Communication (RPC / REST) with Code](#6-synchronous-communication-rpc--rest-with-code)
7. [Asynchronous Event-Driven Architecture with Kafka Code](#7-asynchronous-event-driven-architecture-with-kafka-code)
8. [Architectural Comparison: Sync vs. Async](#8-architectural-comparison-sync-vs-async)
9. [Handling Cross-Service Data: The Saga Pattern with Code](#9-handling-cross-service-data-the-saga-pattern-with-code)
10. [Interview Questions & Deep-Dive Answers](#10-interview-questions--deep-dive-answers)
11. [Core Architectural Summary](#11-core-architectural-summary)

---

## 1. Monolithic Architecture: Anatomy & Challenges

In a **Monolithic application**, all functional areas, business logic, UI rendering/controllers, and database access are packaged and deployed as a single executable artifact (e.g., a single `.jar` or `.war` file).

```mermaid
graph TD
    Client[Client / Browser] --> UI[UI / Web Controllers]
    subgraph Monolith ["Single JVM Process (Monolith Application)"]
        UI --> B1[User Logic]
        UI --> B2[Order Logic]
        UI --> B3[Payment Logic]
        B1 --> DAL[Shared Data Access Layer / Hibernate]
        B2 --> DAL
        B3 --> DAL
    end
    DAL --> DB[(Single Shared Database)]
```

### Advantages of a Monolith
- **Simplicity**: Easy to develop, test locally, and run with a single `mvn spring-boot:run`.
- **Zero Network Overhead**: Calls between components are in-memory method invocations inside the same JVM (nanoseconds latency).
- **ACID Transactions**: Cross-entity transactions (`User` + `Order` + `Payment`) are trivially managed within a single database transaction via `@Transactional`.
- **Straightforward Deployment**: One pipeline, one build artifact, and simple infrastructure monitoring.

### Where Monoliths Break Down at Scale
- **Deployment Coupling**: A small bug fix in the payment module requires testing, building, and deploying the entire application.
- **Scaling Inefficiency**: If `Order` processing requires high CPU while `User` profile requires high memory, you cannot scale them independently. The entire monolith must be duplicated across multiple servers.
- **Blast Radius**: A memory leak or uncaught OutOfMemoryError in a non-critical module (e.g., PDF generation) crashes the entire JVM process for all users.
- **Tech Stack Lock-in**: The whole system is bound to a single framework and language version; upgrading Spring Boot or Java versions becomes a massive high-risk undertaking.

---

## 2. Microservices Architecture: Core Principles & Trade-offs

A **Microservices Architecture** structures an application as a collection of small, autonomous, loosely coupled services organized around specific **business capabilities**. Each service runs in its own process and communicates via lightweight network protocols.

![Monolith vs Microservices Architecture](images/monolith-vs-microservices.png)

```mermaid
graph LR
    subgraph Users ["User Service"]
        U_API[REST API] --> U_DB[(User DB)]
    end
    subgraph Orders ["Order Service"]
        O_API[REST API] --> O_DB[(Order DB)]
    end
    subgraph Payments ["Payment Service"]
        P_API[REST API] --> P_DB[(Payment DB)]
    end

    Client[Clients] --> Gateway[API Gateway]
    Gateway --> U_API
    Gateway --> O_API
    Gateway --> P_API
```

### Core Advantages
1. **Independent Deployability**: Teams can deploy updates to `Order Service` 10 times a day without touching or redeploying `User Service`.
2. **Horizontal Scalability on Demand**: Scale only the bottleneck service (e.g., spin up 20 instances of `Payment Service` during Black Friday, while keeping `User Service` at 2 instances).
3. **Resilience & Fault Isolation**: An outage in `Payment Service` does not crash `Order Service` if proper fallback and circuit-breaker patterns are implemented.
4. **Polyglot Flexibility**: Services can leverage different technology stacks where justified (e.g., Spring Boot for transactional processing, Python/FastAPI for ML inference).

### The Hidden Costs & Operational Complexities
> [!WARNING]
> Microservices are **not a free lunch**. They exchange software design complexity for **distributed systems operational complexity**.

- **Network Reliability & Latency**: In-memory calls (~10ns) are replaced with network calls (~10–50ms) that can fail, timeout, or experience packet loss.
- **Distributed Transactions**: You can no longer rely on single-database `@Transactional`. Maintaining data consistency across services requires patterns like **Saga** (Choreography / Orchestration) or **Two-Phase Commit (2PC)**.
- **Operational Overhead**: Requires automated CI/CD pipelines, container orchestration (Docker, Kubernetes), centralized logging, and service registries.
- **Debugging & Tracing**: A single user click might hop across 6 distinct services; diagnosing latency or errors requires distributed tracing tools (Micrometer, Zipkin, OpenTelemetry).

---

## 3. Domain Boundaries & Sizing Services

A common architectural anti-pattern is decomposing services by **technical layers** rather than **business domains**.

```text
❌ WRONG (Technical Layering):
├── Controller-Service   (Only routing)
├── Service-Layer-Service (Business logic)
└── Repository-Service   (Database access)
```
*Result*: Extreme network latency for every request, zero business autonomy, and tight coupling.

```text
✅ CORRECT (Domain-Driven Design / Business Capabilities):
├── User Service        (Authentication, Profiles, Roles)
├── Order Service       (Cart, Checkout, Order Lifecycle)
├── Inventory Service   (Stock reservations, Warehouses)
└── Payment Service     (Gateway integrations, Refunds)
```

### Guiding Rules for Service Boundaries
- **Single Responsibility Principle (SRP)**: A service should have one reason to change, driven by a specific business domain stakeholder.
- **High Cohesion, Loose Coupling**: Logic that changes together should live inside the same service. Interactions with other services should occur strictly through stable public APIs.
- **Autonomous Team Ownership**: A "Two-Pizza Team" should be able to design, develop, test, and deploy a service without blocking on other teams.

---

## 4. Database-per-Service Pattern

In true microservices, **each microservice must own and manage its private database**. No other service is permitted to access that database directly.

```mermaid
graph TD
    subgraph Antipattern ["❌ Anti-Pattern: Shared Database"]
        S1[Order Service] --> SDB[(Shared Corporate DB)]
        S2[Inventory Service] --> SDB
    end

    subgraph Recommended ["✅ Recommended: Database per Service"]
        O1[Order Service] --> ODB[(Order Database)]
        I1[Inventory Service] --> IDB[(Inventory Database)]
        O1 -. "REST / Feign / Kafka" .-> I1
    end
```

### Why Shared Databases are Dangerous
1. **Hidden Schema Coupling**: If `Inventory Service` renames a column in table `product_stock`, `Order Service` breaks at runtime without warning.
2. **Connection Pool Contention**: High query volume from reporting or analytics can starve critical transactional connections.
3. **Impeded Technology Choice**: Forces all domains into the same storage paradigm, preventing `Order Service` from using PostgreSQL while `Recommendation Service` uses Neo4j or Redis.

### Dedicated Database Configuration (`application.yml`)
Each service defines its isolated datasource and Flyway/Liquibase migration paths:

```yaml
# Order Service - application.yml
spring:
  application:
    name: order-service
  datasource:
    url: jdbc:postgresql://localhost:5432/order_db
    username: ${DB_USER:order_user}
    password: ${DB_PASS:order_secret}
  jpa:
    hibernate:
      ddl-auto: validate
    properties:
      hibernate.dialect: org.hibernate.dialect.PostgreSQLDialect
```

---

## 5. End-to-End Microservice Topology

A production Spring Boot microservices landscape requires supporting infrastructure alongside business services:

```mermaid
flowchart TD
    Client([External Client / Frontend]) -->|HTTPS| Gateway[API Gateway :8080]

    subgraph Discovery ["Service Discovery"]
        Eureka[Netflix Eureka Server :8761]
    end

    subgraph Microservices ["Business Services"]
        Gateway -->|Route & Balance| US[User Service :8081]
        Gateway -->|Route & Balance| OS[Order Service :8082]
        Gateway -->|Route & Balance| PS[Payment Service :8083]
        OS -->|Feign Client| IS[Inventory Service :8084]
    end

    subgraph EventStream ["Asynchronous Event Broker"]
        OS -. "OrderCreatedEvent" .-> Kafka[(Apache Kafka)]
        Kafka -.-> PS
        Kafka -.-> NS[Notification Service :8085]
    end

    US -. Register & Heartbeat .-> Eureka
    OS -. Register & Heartbeat .-> Eureka
    PS -. Register & Heartbeat .-> Eureka
    IS -. Register & Heartbeat .-> Eureka
    Gateway -. Fetch Registry .-> Eureka
```

---

## 6. Synchronous Communication (RPC / REST) with Code

In **Synchronous Communication**, the caller sends a request over HTTP/REST and blocks or waits for the downstream service to compute and return a response.

```text
Order Service                               Payment Service
      │                                            │
      │── 1. POST /payments (Process $150) ───────>│
      │   [Thread Waiting / Non-blocking IO]       │── 2. Validate Card & Process
      │<── 3. 200 OK (PaymentStatus: SUCCESS) ─────│
      ▼                                            ▼
```

### Spring Boot Controller Example: Synchronous Endpoint
```java
@RestController
@RequestMapping("/api/v1/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    public ResponseEntity<OrderResponse> placeOrder(@Valid @RequestBody CreateOrderRequest request) {
        // Synchronous call blocks until order is created and confirmed
        OrderResponse response = orderService.createOrder(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
```

---

## 7. Asynchronous Event-Driven Architecture with Kafka Code

In **Asynchronous Communication**, the producer publishes an event message to a broker (Kafka, RabbitMQ) and returns immediately. Consumers process the event independently.

![Asynchronous Message Broker Architecture](images/async-message-broker.png)

```mermaid
sequenceDiagram
    autonumber
    actor Customer
    participant OS as Order Service
    participant KB as Message Broker (Kafka)
    participant PS as Payment Service
    participant NS as Notification Service

    Customer->>OS: Place Order (POST /orders)
    OS->>OS: Persist Order (Status: PENDING)
    OS->>KB: Publish "OrderCreatedEvent"
    OS-->>Customer: 202 Accepted (OrderId: 101, Status: PENDING)
    
    par Async Event Processing
        KB->>PS: Consume "OrderCreatedEvent"
        PS->>PS: Charge Credit Card
    and
        KB->>NS: Consume "OrderCreatedEvent"
        NS->>NS: Send Email/SMS Confirmation
    end
```

### Kafka Producer in `Order Service`
```java
// Immutable Event Payload
public record OrderCreatedEvent(
    String orderId,
    String customerId,
    BigDecimal totalAmount,
    Instant timestamp
) {}
```

```java
@Service
public class OrderEventPublisher {

    private static final String TOPIC = "order-created-events";
    private final KafkaTemplate<String, OrderCreatedEvent> kafkaTemplate;

    public OrderEventPublisher(KafkaTemplate<String, OrderCreatedEvent> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    public void publishOrderCreated(OrderCreatedEvent event) {
        // Asynchronous publish using orderId as the partition key
        CompletableFuture<SendResult<String, OrderCreatedEvent>> future = 
                kafkaTemplate.send(TOPIC, event.orderId(), event);

        future.whenComplete((result, ex) -> {
            if (ex == null) {
                log.info("Event sent successfully to partition {}", result.getRecordMetadata().partition());
            } else {
                log.error("Failed to publish OrderCreatedEvent for orderId={}", event.orderId(), ex);
            }
        });
    }
}
```

### Kafka Consumer in `Payment Service`
```java
@Service
public class PaymentEventListener {

    private final PaymentProcessor paymentProcessor;

    public PaymentEventListener(PaymentProcessor paymentProcessor) {
        this.paymentProcessor = paymentProcessor;
    }

    @KafkaListener(topics = "order-created-events", groupId = "payment-group")
    public void handleOrderCreated(OrderCreatedEvent event, Acknowledgment ack) {
        log.info("Received OrderCreatedEvent for orderId={}", event.orderId());
        
        try {
            paymentProcessor.processPayment(event.orderId(), event.totalAmount());
            ack.acknowledge(); // Commit Kafka offset only after successful processing
        } catch (Exception ex) {
            log.error("Payment failed for orderId={}, routing to DLQ", event.orderId(), ex);
            // Handle error or dead letter queue
        }
    }
}
```

---

## 8. Architectural Comparison: Sync vs. Async

| Dimension | Synchronous (REST / OpenFeign) | Asynchronous (Kafka / RabbitMQ) |
|---|---|---|
| **Interaction Model** | Request / Response | Publish / Subscribe or Message Queue |
| **Caller Blocking** | Caller waits for completion | Caller fire-and-forgets (non-blocking) |
| **Coupling** | High temporal coupling (both must be up) | Loose temporal and spatial coupling |
| **Protocol** | HTTP / HTTPS (JSON/Protobuf) | TCP-based Broker Protocol (AMQP / Kafka Binary) |
| **Failure Mode** | Cascading timeouts if downstream fails | Messages queue up; consumers recover gracefully |
| **Consistency Model** | Immediate Consistency | Eventual Consistency |
| **Debugging Complexity** | Moderate (standard stack traces) | High (tracing messages across async boundaries) |
| **Typical Use Cases** | Read queries, immediate validation | Background jobs, checkout pipelines, notifications |

---

## 9. Handling Cross-Service Data: The Saga Pattern with Code

When creating an order requires reserving stock in `Inventory Service` and charging money in `Payment Service`, we cannot use `@Transactional`. Instead, we use the **Saga Pattern** (Choreography or Orchestration).

![Saga Pattern Architecture](images/saga-pattern.png)

```mermaid
sequenceDiagram
    autonumber
    participant O as Order Service
    participant I as Inventory Service
    participant P as Payment Service

    Note over O,P: Happy Path
    O->>I: 1. Reserve Stock
    I-->>O: Stock Reserved
    O->>P: 2. Process Payment
    P-->>O: Payment Successful
    O->>O: 3. Order Status -> CONFIRMED

    Note over O,P: Compensating Transaction (Failure Path)
    O->>P: 2. Process Payment (Card Declined!)
    P-->>O: Payment Failed
    O->>I: 3. COMPENSATE: Release Reserved Stock
    O->>O: 4. Order Status -> CANCELLED
```

### Orchestrator Example (Java)
```java
@Service
public class OrderSagaOrchestrator {

    private final InventoryClient inventoryClient;
    private final PaymentClient paymentClient;
    private final OrderRepository orderRepository;

    public OrderSagaOrchestrator(InventoryClient ic, PaymentClient pc, OrderRepository or) {
        this.inventoryClient = ic;
        this.paymentClient = pc;
        this.orderRepository = or;
    }

    public void executeOrderSaga(Order order) {
        // Step 1: Reserve Inventory
        boolean stockReserved = inventoryClient.reserveStock(order.getProductId(), order.getQuantity());
        if (!stockReserved) {
            order.setStatus(OrderStatus.REJECTED_OUT_OF_STOCK);
            orderRepository.save(order);
            return;
        }

        try {
            // Step 2: Process Payment
            paymentClient.charge(order.getId(), order.getTotalAmount());
            order.setStatus(OrderStatus.CONFIRMED);
            orderRepository.save(order);
        } catch (PaymentFailedException ex) {
            // COMPENSATING ACTION: Undo Step 1
            log.warn("Payment failed for orderId={}. Triggering compensating inventory release", order.getId());
            inventoryClient.releaseStock(order.getProductId(), order.getQuantity());
            
            order.setStatus(OrderStatus.FAILED_PAYMENT_DECLINED);
            orderRepository.save(order);
        }
    }
}
```

---

## 10. Interview Questions & Deep-Dive Answers

### Q1: When should an engineering team choose a Monolith over Microservices?
> **Answer**:  
> A Monolith is preferred when:
> 1. **Early Stage / MVP**: Domain boundaries are still fluctuating rapidly, and business models are unproven.
> 2. **Small Team Size**: When a team has fewer than 10–15 developers, the operational tax of microservices (registries, gateways, CI/CD pipelines, distributed tracing) outweighs the architectural benefits.
> 3. **High Co-locality Needs**: When ultra-low latency (<1ms) and strict ACID transactional guarantees across all entities are non-negotiable.

### Q2: Why is the Database-per-Service pattern mandatory in microservices?
> **Answer**:  
> Sharing a database creates hidden runtime coupling. If Service A alters a table schema, Service B breaks without compile-time warnings. It also prevents independent database scaling, creates connection starvation under load, and prevents teams from choosing polyglot storage engines optimized for their workload.

### Q3: How do you achieve transactional consistency across microservices without distributed ACID locks?
> **Answer**:  
> We use the **Saga Pattern**, which coordinates a sequence of local transactions across multiple services:
> - **Choreography**: Each service executes its local transaction and publishes an event that triggers the next service. If a step fails, compensating events are emitted to undo previous steps.
> - **Orchestration**: A centralized Saga Orchestrator tells participants what transactions to execute and triggers compensating transactions upon failure.

---

## 11. Core Architectural Summary

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                      MICROSERVICES GOLDEN RULES                         │
├─────────────────────────────────────────────────────────────────────────┤
│ 1. Align boundaries to Business Capabilities (DDD), not Technical layers│
│ 2. Enforce Database-per-Service — never share transactional databases   │
│ 3. Favor Asynchronous Messaging for state changes (Eventual Consistency)│
│ 4. Protect Synchronous REST calls with Timeouts and Circuit Breakers    │
│ 5. Use Saga Patterns with compensating transactions for distributed flow│
│ 6. Treat Operational Tooling (CI/CD, Tracing, Gateway) as 1st-class code│
└─────────────────────────────────────────────────────────────────────────┘
```
