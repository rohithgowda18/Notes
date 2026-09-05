# 🚪 04 — Spring Cloud API Gateway

> **Covers Edge Routing, Filtering & Centralized Edge Security**  
> Why direct client-to-microservice communication fails, anatomy of **Spring Cloud Gateway**, Route Predicates, Pre/Post Gateway Filters, dynamic discovery routing, and edge cross-cutting concerns.

---

## 📑 Table of Contents
1. [The Edge Problem: Why Direct Client Access Fails](#1-the-edge-problem-why-direct-client-access-fails)
2. [What is an API Gateway?](#2-what-is-an-api-gateway)
3. [Spring Cloud Gateway Architecture](#3-spring-cloud-gateway-architecture)
4. [Route Predicates & Filters Explained](#4-route-predicates--filters-explained)
5. [Configuring Routes: Static vs. Dynamic Discovery](#5-configuring-routes-static-vs-dynamic-discovery)
6. [Writing Custom Gateway Filters (Pre & Post)](#6-writing-custom-gateway-filters-pre--post)
7. [Cross-Cutting Concerns at the Edge](#7-cross-cutting-concerns-at-the-edge)
8. [Anti-Pattern: The Gateway as a Business Dump](#8-anti-pattern-the-gateway-as-a-business-dump)
9. [Interview Questions & Deep-Dive Answers](#9-interview-questions--deep-dive-answers)
10. [Core Architectural Summary](#10-core-architectural-summary)

---

## 1. The Edge Problem: Why Direct Client Access Fails

In a naive microservices setup, external mobile apps, SPAs, and third-party partners communicate directly with individual backend microservices:

```mermaid
graph TD
    Client[Web App / iOS / Android]
    Client -->|Direct Call :8081| US[User Service]
    Client -->|Direct Call :8082| OS[Order Service]
    Client -->|Direct Call :8083| PS[Payment Service]
    Client -->|Direct Call :8084| IS[Inventory Service]
```

### Severe Vulnerabilities of Direct Client Access
1. **Massive Attack Surface**: Every backend service must be exposed to the public Internet with public IPs and open firewall ports.
2. **Duplicated Cross-Cutting Logic**: Every microservice must independently implement JWT token validation, SSL termination, CORS policies, rate limiting, and request logging.
3. **High Chatty Network Latency**: Rendering a single mobile screen (e.g., Order Detail) requires the phone to fire 5 separate cellular HTTP calls to 5 services.
4. **Client-Backend Coupling**: If the backend team refactors and splits `Order Service` into `Order Service` and `Fulfillment Service`, client apps break immediately.

---

## 2. What is an API Gateway?

An **API Gateway** serves as the **single, reverse-proxy entry point** shielding the entire internal microservices cluster from external traffic:

```mermaid
flowchart TD
    Client([External Clients / Mobile / Web]) -->|Single HTTPS Port :8080| GW[Spring Cloud API Gateway]

    subgraph InternalDMZ ["Secure Internal VPC (Private IPs)"]
        GW -->|Route /api/v1/users/**| US[User Service :8081]
        GW -->|Route /api/v1/orders/**| OS[Order Service :8082]
        GW -->|Route /api/v1/payments/**| PS[Payment Service :8083]
    end
```

### Primary Edge Responsibilities
- **Intelligent Routing**: Forwarding inbound URLs to appropriate downstream microservices.
- **Security & Authentication**: Validating JWT Bearer tokens and terminating SSL.
- **Traffic Control & Rate Limiting**: Throttling abusive IP addresses or client IDs.
- **CORS Handling**: Managing Cross-Origin Resource Sharing centrally for all SPAs.
- **Protocol Translation & Header Enrichment**: Sanitizing headers and appending internal user identity headers (`X-User-Id`, `X-User-Role`).

---

## 3. Spring Cloud Gateway Architecture

Unlike older gateways (such as Netflix Zuul 1.x which used blocking I/O with a thread-per-connection), **Spring Cloud Gateway** is built on top of **Spring 5, Project Reactor, and Netty**:

```mermaid
flowchart TD
    Client([Inbound Request]) --> Dispatcher[Gateway Handler Mapping]
    Dispatcher --> Handler[Gateway Web Handler]
    
    subgraph FilterPipeline ["Filter Execution Chain"]
        direction TB
        F1["Pre-Filter 1 (Log & Validate JWT)"] --> F2["Pre-Filter 2 (Rate Limiter)"]
        F2 --> Routing["Routing Filter (Proxy to Microservice)"]
        Routing --> P1["Post-Filter 1 (Add Security Headers)"]
        P1 --> P2["Post-Filter 2 (Latency Metric Timer)"]
    end

    Handler --> FilterPipeline
    FilterPipeline --> Downstream[Internal Microservice]
```

### Core Concepts
1. **Route**: The basic building block of the gateway. Defined by an **ID**, a **destination URI**, a collection of **Predicates**, and a collection of **Filters**.
2. **Predicate**: A Java 8 `Predicate` matching HTTP request attributes (Path, Method, Headers, Cookies, Query Params).
3. **Filter**: Spring Framework `GatewayFilter` instances that intercept, inspect, or modify the request before routing and/or modify the response before returning.

---

## 4. Route Predicates & Filters Explained

### Common Built-in Route Predicates
Predicates determine *if* a request matches a route:
- `Path=/api/v1/orders/**`: Matches incoming URI paths.
- `Method=GET,POST`: Matches specific HTTP verbs.
- `Header=X-Request-Id, \d+`: Matches if a header is present and satisfies regex.
- `After=2026-01-01T00:00:00+00:00[UTC]`: Matches requests that occur after a given timestamp (useful for scheduled feature rollouts).

### Common Built-in Gateway Filters
Filters modify the request or response:
- `RewritePath=/api/v1/(?<segment>.*), /$\{segment}`: Rewrites `/api/v1/orders` to `/orders`.
- `AddRequestHeader=X-Gateway-Origin, SpringCloudGateway`: Injects custom headers to downstream services.
- `AddResponseHeader=X-Frame-Options, DENY`: Enhances security headers on egress.
- `RequestRateLimiter`: Leverages Redis token-bucket to throttle requests.

---

## 5. Configuring Routes: Static vs. Dynamic Discovery

### Approach A: Static URI Routing (application.yml)
Routes configured with fixed backend IP/domain:

```yaml
spring:
  cloud:
    gateway:
      routes:
        - id: user-service-route
          uri: http://localhost:8081
          predicates:
            - Path=/api/v1/users/**
          filters:
            - StripPrefix=1
```

### Approach B: Dynamic Discovery Routing via Eureka (`lb://`)
Instead of hardcoded URLs, the gateway uses **logical service names** resolved dynamically from Netflix Eureka with client-side load balancing:

```yaml
spring:
  cloud:
    gateway:
      routes:
        - id: order-service-route
          uri: lb://ORDER-SERVICE      # Dynamic lookup in Eureka + Load Balancing
          predicates:
            - Path=/api/v1/orders/**
          filters:
            - RewritePath=/api/v1/(?<segment>.*), /$\{segment}
            - AddRequestHeader=X-Forwarded-By, API-Gateway

        - id: payment-service-route
          uri: lb://PAYMENT-SERVICE
          predicates:
            - Path=/api/v1/payments/**
```

---

## 6. Writing Custom Gateway Filters (Pre & Post)

You can write custom global or route-specific filters using reactive `Mono`:

```java
@Component
public class LoggingAndAuthGlobalFilter implements GlobalFilter, Ordered {

    private static final Logger log = LoggerFactory.getLogger(LoggingAndAuthGlobalFilter.class);

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        long startTime = System.currentTimeMillis();

        // --- PRE-FILTER LOGIC ---
        log.info("[GATEWAY PRE] Inbound {} {}", request.getMethod(), request.getURI());
        
        // Example: Validate Header or Token
        if (!request.getHeaders().containsKey("Authorization") && request.getPath().toString().startsWith("/api/v1/secure")) {
            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
            return exchange.getResponse().setComplete();
        }

        // --- DELEGATE TO DOWNSTREAM & RUN POST-FILTER ---
        return chain.filter(exchange).then(Mono.fromRunnable(() -> {
            // --- POST-FILTER LOGIC ---
            long duration = System.currentTimeMillis() - startTime;
            HttpStatusCode statusCode = exchange.getResponse().getStatusCode();
            log.info("[GATEWAY POST] Completed {} with status {} in {}ms",
                    request.getURI(), statusCode, duration);
        }));
    }

    @Override
    public int getOrder() {
        return -1; // Highest priority in filter order
    }
}
```

---

## 7. Cross-Cutting Concerns at the Edge

```mermaid
graph TD
    Client[Client Request] --> Gateway[API Gateway Edge]
    
    subgraph Concerns ["Gateway Cross-Cutting Capabilities"]
        Gateway --> C1[JWT Signature & Expiry Check]
        Gateway --> C2[Redis Token Bucket Rate Limiting]
        Gateway --> C3[Global CORS Preflight Handling]
        Gateway --> C4[Centralized Access Logs & Zipkin Spans]
        Gateway --> C5[SSL / TLS Termination]
    end

    Concerns --> Services[Protected Backend Microservices]
```

### Handling Centralized CORS
```yaml
spring:
  cloud:
    gateway:
      globalcors:
        cors-configurations:
          '[/**]':
            allowedOrigins: "https://myfrontend.com"
            allowedMethods:
              - GET
              - POST
              - PUT
              - DELETE
            allowedHeaders: "*"
            allowCredentials: true
```

---

## 8. Anti-Pattern: The Gateway as a Business Dump

> [!CAUTION]
> **Do not write Domain Business Logic in the API Gateway.**

```text
❌ CRITICAL ANTI-PATTERNS IN GATEWAY:
├── Calculating discounts or order taxes
├── Performing complex database JOIN queries
├── Orchestrating domain entities directly
└── Storing relational domain tables
```

### Why this breaks architecture:
- Turns the gateway into a **monolithic bottleneck**.
- High CPU computation in the gateway blocks the non-blocking Netty event loop, slowing down routing for all other services.
- Violates domain separation of concerns.

The Gateway should focus strictly on **Transport, Routing, Edge Security, and Protocol Governance**.

---

## 9. Interview Questions & Deep-Dive Answers

### Q1: What is the underlying runtime difference between Netflix Zuul 1.x and Spring Cloud Gateway?
> **Answer**:  
> Netflix Zuul 1.x was built on standard Java Servlet APIs using synchronous blocking I/O (one dedicated thread per incoming request). When downstream services became slow, threads backed up quickly, causing thread pool starvation. Spring Cloud Gateway is built on **Spring WebFlux and Netty**, utilizing an asynchronous, non-blocking event-driven loop. A small fixed number of threads handles tens of thousands of concurrent connections efficiently.

### Q2: What does the `lb://` prefix mean in route configuration?
> **Answer**:  
> `lb://` stands for **Load Balanced**. When configured (e.g., `uri: lb://ORDER-SERVICE`), the gateway does not interpret `ORDER-SERVICE` as a DNS hostname. Instead, it instructs Spring Cloud LoadBalancer to look up the available registered IP/port instances in the Eureka registry and balance incoming traffic across them.

### Q3: How do you pass authenticated user details from Gateway to downstream services?
> **Answer**:  
> The Gateway authenticates the external JWT token at the edge. Once verified, custom Gateway Pre-Filters extract user claims (such as `userId`, `username`, `roles`) and mutate the outbound request by adding internal headers like `X-User-Id: 1042` and `X-User-Role: ADMIN`. Downstream services simply inspect these headers without needing to re-parse the JWT token.

---

## 10. Core Architectural Summary

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                      API GATEWAY CHEAT SHEET                            │
├─────────────────────────────────────────────────────────────────────────┤
│ 1. Acts as the single perimeter shield for all backend microservices    │
│ 2. Route = Predicates (matching conditions) + Filters (transformations) │
│ 3. Use 'lb://SERVICE-NAME' for dynamic Eureka integration               │
│ 4. Offload Edge concerns: JWT Auth, Rate Limiting, CORS, SSL, Logging   │
│ 5. NEVER put business domain rules or database logic in the Gateway     │
└─────────────────────────────────────────────────────────────────────────┘
```
