# 🍃 Spring Boot — Complete Placement & Technical Interview Master Guide

> **Target Audience**: Fresher / Entry-Level Java Backend Engineers, SWE / SDE Candidates.  
> **Source Foundation**: Curated from The Curious Coder Java Spring Boot Interview Series + High-Yield Placement Deep Dives.  
> **Core Focus**: Intuitive explanations, clear architectural diagrams (Mermaid), real-world Java 17 / Spring Boot 3 code snippets, 2-3 word memory hooks, and equal, in-depth coverage of all core topics and beyond-the-playlist essentials (Spring Security, JPA Relationships, N+1 Query Problem, Testing, Maven, and SQL).

---

## 📑 Table of Contents

- [1. Inversion of Control (IoC) & Dependency Injection (DI)](#1-inversion-of-control-ioc--dependency-injection-di)
- [2. `@RestController` vs. `@Controller`](#2-restcontroller-vs-controller)
- [3. Stereotype Annotations: `@RestController` vs. `@Service` vs. `@Repository` vs. `@Component`](#3-stereotype-annotations-restcontroller-vs-service-vs-repository-vs-component)
- [4. Spring Boot & Starters](#4-spring-boot--starters)
- [5. Spring Framework vs. Spring Boot](#5-spring-framework-vs-spring-boot)
- [6. `@SpringBootApplication` Internals](#6-springbootapplication-internals)
- [7. Spring Boot Actuator](#7-spring-boot-actuator)
- [8. Global Exception Handling (`@RestControllerAdvice`)](#8-global-exception-handling-restcontrolleradvice)
- [9. Project Lombok in Spring Boot](#9-project-lombok-in-spring-boot)
- [10. Spring Bean Scopes](#10-spring-bean-scopes)
- [11. Request Scope vs. Session Scope](#11-request-scope-vs-session-scope)
- [12. Spring Profiles (Multi-Environment Setup)](#12-spring-profiles-multi-environment-setup)
- [13. `application.properties` vs. `application.yaml`](#13-applicationproperties-vs-applicationyaml)
- [14. Property Injection: `@Value` vs. `@ConfigurationProperties` vs. `Environment`](#14-property-injection-value-vs-configurationproperties-vs-environment)
- [15. Persistence Stack: JDBC vs. Hibernate vs. JPA vs. Spring Data JPA](#15-persistence-stack-jdbc-vs-hibernate-vs-jpa-vs-spring-data-jpa)
- [16. `@Transactional` Mechanics](#16-transactional-mechanics)
- [17. Transaction Propagation](#17-transaction-propagation)
- [18. Bean Disambiguation: `@Primary` vs. `@Qualifier`](#18-bean-disambiguation-primary-vs-qualifier)
- [19. Injection Types: Constructor vs. Setter vs. Field Injection](#19-injection-types-constructor-vs-setter-vs-field-injection)
- [20. `@Lookup` Annotation (Singleton with Prototype Dependency)](#20-lookup-annotation-singleton-with-prototype-dependency)
- [21. Servlet Filters vs. Spring MVC Interceptors](#21-servlet-filters-vs-spring-mvc-interceptors)
- [22. Cyclic Dependencies & `@Lazy`](#22-cyclic-dependencies--lazy)
- [23. `@PathVariable` vs. `@RequestParam`](#23-pathvariable-vs-requestparam)
- [24. `ResponseEntity<T>`](#24-responseentityt)
- [25. `DispatcherServlet` & Spring MVC Request Flow](#25-dispatcherservlet--spring-mvc-request-flow)
- [26. Pagination, Sorting & Filtering](#26-pagination-sorting--filtering)
- [27. Object Mapping with MapStruct & DTO Pattern](#27-object-mapping-with-mapstruct--dto-pattern)
- [28. Core Spring Boot Annotations Quick Reference](#28-core-spring-boot-annotations-quick-reference)
- [29. Input Validation & `@Valid`](#29-input-validation--valid)
- [30. Rapid-Fire Interview Questions & Answers](#30-rapid-fire-interview-questions--answers)
- [31. End-to-End Project Explanation Framework](#31-end-to-end-project-explanation-framework)
- [32. High-Yield Topics Beyond the Playlist](#32-high-yield-topics-beyond-the-playlist)
  - [A. Spring Security & Stateless JWT Authentication](#a-spring-security--stateless-jwt-authentication)
  - [B. JPA Relationships (`@OneToMany`, `@ManyToOne`) & Cascade Rules](#b-jpa-relationships-onetomany-manytoone--cascade-rules)
  - [C. Fetch Types: LAZY vs. EAGER & The N+1 Query Problem](#c-fetch-types-lazy-vs-eager--the-n1-query-problem)
  - [D. REST API Design & HTTP Idempotency](#d-rest-api-design--http-idempotency)
  - [E. SQL & DBMS Essentials for Java Backend Interviews](#e-sql--dbms-essentials-for-java-backend-interviews)
  - [F. Automated Testing with JUnit 5 & Mockito](#f-automated-testing-with-junit-5--mockito)
  - [G. Maven Build Lifecycle & Dependency Scopes](#g-maven-build-lifecycle--dependency-scopes)
- [33. 1-Page Master Revision Cheat Sheet](#33-1-page-master-revision-cheat-sheet)

---

## 1. Inversion of Control (IoC) & Dependency Injection (DI)

> 💡 **Quick Revision Anchor (2-3 Words)**: `Spring Controls Objects`

### What is IoC (Inversion of Control)?
In standard Java programming, if class `OrderService` needs `PaymentService`, it creates it directly using the `new` keyword:
```java
// Traditional Java (Tight Coupling)
class OrderService {
    private PaymentService paymentService = new PaymentService(); // OrderService controls creation
}
```
**Inversion of Control (IoC)** is an architectural principle where the control of object creation, configuration, and lifecycle management is transferred from the application code to an external container—the **Spring IoC Container**.

```mermaid
flowchart LR
    subgraph TraditionalJava ["Traditional Java (Tight Coupling)"]
        A["OrderService"] -->|Calls 'new' directly| B["PaymentService"]
    end

    subgraph SpringIoC ["Spring IoC Container (Loose Coupling)"]
        Container["Spring IoC Container (ApplicationContext)"]
        Container -->|Instantiates| P["PaymentService Bean"]
        Container -->|Injects via Constructor| O["OrderService Bean"]
    end
```

### What is Dependency Injection (DI)?
**Dependency Injection** is the concrete design pattern used to implement IoC. Instead of an object searching for its dependencies, the Spring container **injects** the required dependencies into the object at runtime.

```java
// Spring IoC (Loose Coupling via Dependency Injection)
@Service
public class OrderService {
    private final PaymentService paymentService;

    // Spring automatically supplies PaymentService here
    public OrderService(PaymentService paymentService) {
        this.paymentService = paymentService;
    }
}
```

### The Spring IoC Container (`ApplicationContext`)
The Spring container is the runtime engine that:
1. Scans your codebase for bean definitions (`@Component`, `@Service`, `@Bean`).
2. Instantiates objects (called **Spring Beans**).
3. Resolves and wires dependencies between beans.
4. Manages the complete lifecycle (initialization to destruction).

The primary interface representing the container is **`ApplicationContext`**.

> [!TIP]
> **1-Sentence Interview Answer**:  
> *"IoC is the principle of transferring object lifecycle management from manual application code to the Spring container; Dependency Injection is the mechanism Spring uses to inject those managed objects into dependent classes."*

---

## 2. `@RestController` vs. `@Controller`

> 💡 **Quick Revision Anchor (2-3 Words)**: `JSON vs HTML-Views`

```mermaid
flowchart TD
    Req["Incoming HTTP Request"] --> Router{"Controller Type?"}
    Router -->|"Traditional @Controller"| C1["Returns View Name (e.g. 'home')"] --> VR["View Resolver -> Renders home.html"]
    Router -->|"REST @RestController"| C2["Returns Java Object (e.g. User)"] --> MC["HttpMessageConverter (Jackson) -> Writes JSON directly to Response Body"]
```

### Comparison Matrix

| Dimension | `@Controller` | `@RestController` |
|---|---|---|
| **Primary Purpose** | Traditional MVC web apps rendering HTML web pages. | Modern RESTful APIs serving raw data (JSON / XML). |
| **Return Value** | Treated as a **view name** (resolved by a `ViewResolver` to a JSP/Thymeleaf template). | Written directly to the **HTTP response body** as JSON. |
| **Composition** | Base stereotype annotation. | `@RestController = @Controller + @ResponseBody` |
| **Returning JSON?** | Requires explicit `@ResponseBody` on each method. | Automatically enabled for **all** handler methods. |

### Code Comparison
```java
// 1. Traditional MVC Controller
@Controller
public class WebPageController {
    @GetMapping("/home")
    public String renderHomePage() {
        return "home"; // Renders home.html or home.jsp
    }
}

// 2. REST API Controller
@RestController
@RequestMapping("/api/users")
public class UserApiController {
    @GetMapping("/{id}")
    public User getUser(@PathVariable Long id) {
        return userService.findById(id); // Jackson serializes User object directly into JSON
    }
}
```

---

## 3. Stereotype Annotations: `@RestController` vs. `@Service` vs. `@Repository` vs. `@Component`

> 💡 **Quick Revision Anchor (2-3 Words)**: `Layered Component Roles`

All four annotations tell Spring: *"This class is a Spring Bean—manage its lifecycle."* However, using specific stereotypes provides architectural clarity and enables specialized framework features.

```mermaid
flowchart TD
    Client(["HTTP Client / Frontend"]) --> Controller["@RestController\n(Presentation / API Layer)"]
    Controller --> Service["@Service\n(Business Logic / Transaction Layer)"]
    Service --> Repo["@Repository\n(Data Access / Persistence Layer)"]
    Repo --> DB[("Database")]

    Component["@Component\n(Generic Utilities / Helpers / Listeners)"] -.-> Service
```

| Annotation | Layer | Special Framework Behavior |
|---|---|---|
| **`@RestController`** | Presentation / API Layer | Handles HTTP requests, parses JSON, and binds responses. |
| **`@Service`** | Business Logic Layer | Communicates business intent; common target for `@Transactional` boundaries. |
| **`@Repository`** | Data Access / DAO Layer | Interacts with databases. **Crucial**: Automatically translates low-level database exceptions (e.g., `SQLException`) into Spring's unified `DataAccessException` hierarchy. |
| **`@Component`** | Generic Utility Layer | Generic stereotype for any Spring-managed component that does not fit into the other three layers (e.g., mail senders, background processors). |

> [!IMPORTANT]
> **Interview Question**: *"Why not annotate every class with `@Component`?"*  
> **Answer**: *"While technically valid, using specialized stereotypes communicates the architectural intent of the class, allows team members to navigate layers easily, and enables framework-specific behavior—such as automatic persistence exception translation with `@Repository`."*

---

## 4. Spring Boot & Starters

> 💡 **Quick Revision Anchor (2-3 Words)**: `Curated Dependency Bundles`

### What is Spring Boot?
Spring Boot is an extension of the Spring Framework designed to eliminate boilerplate configuration and streamline production-ready application development through:
1. **Auto-Configuration**: Guesses configuration based on jar dependencies on the classpath.
2. **Starter Dependencies**: Curated dependency aggregators.
3. **Embedded Web Servers**: Tomcat, Jetty, or Undertow packaged directly inside the executable JAR.
4. **Production Metrics**: Ready-to-use health checks and metrics via Actuator.

### What is a Spring Boot Starter?
A **Starter** is a convenient dependency descriptor (`pom.xml`) that bundles all compatible, version-aligned libraries needed for a specific capability. You add one starter rather than hunting down 10 individual Maven coordinates.

```xml
<!-- Brings in Spring MVC, REST support, Jackson JSON, and Embedded Tomcat -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>

<!-- Brings in Hibernate, Spring Data JPA, HikariCP Connection Pool, and JDBC -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>
```

---

## 5. Spring Framework vs. Spring Boot

> 💡 **Quick Revision Anchor (2-3 Words)**: `Core vs Automated`

```mermaid
flowchart LR
    subgraph SpringFramework ["Spring Framework"]
        SF1["Core IoC Container"]
        SF2["Manual XML or @Configuration"]
        SF3["Manual Dependency Version Management"]
        SF4["Requires External WAR deployment (Tomcat)"]
    end

    subgraph SpringBoot ["Spring Boot"]
        SB1["Built on top of Spring"]
        SB2["Auto-Configuration by convention"]
        SB3["Starters manage version compatibility"]
        SB4["Embedded Server -> Self-contained 'java -jar'"]
    end

    SpringFramework -->|Evolved Into| SpringBoot
```

| Dimension | Spring Framework | Spring Boot |
|---|---|---|
| **Goal** | Provides the core dependency injection and enterprise features. | Eliminates configuration overhead and speeds up development. |
| **Configuration** | Heavy boilerplate (XML files or extensive Java `@Configuration` classes). | Opinionated auto-configuration ("convention over configuration"). |
| **Server Deployment** | Packaged as `.war` and deployed to an external application server (Tomcat/JBoss). | Generates standalone `.jar` with an **embedded server** (Tomcat runs via `java -jar app.jar`). |
| **Dependency Management** | Developer manually specifies individual artifact versions and resolves version conflicts. | **Starters** manage coordinated, tested dependency versions automatically. |

---

## 6. `@SpringBootApplication` Internals

> 💡 **Quick Revision Anchor (2-3 Words)**: `Three-in-One Bootstrap`

The entry point of every Spring Boot app is annotated with `@SpringBootApplication`:
```java
@SpringBootApplication
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
```

`@SpringBootApplication` is a meta-annotation that bundles **three essential annotations**:

```mermaid
flowchart TD
    SBA["@SpringBootApplication"]
    SBA --> C["@Configuration\n(Class can define @Bean methods)"]
    SBA --> EAC["@EnableAutoConfiguration\n(Auto-configures beans based on classpath JARs)"]
    SBA --> CS["@ComponentScan\n(Scans current package & subpackages for Spring Beans)"]
```

1. **`@Configuration`**: Marks the class as a configuration class capable of declaring `@Bean` factory methods.
2. **`@EnableAutoConfiguration`**: Instructs Spring Boot to examine classpath libraries and intelligently configure beans (e.g., if `h2.jar` is found, it automatically provisions an in-memory database).
3. **`@ComponentScan`**: Recursively scans the package of the main class and all its subpackages to discover and register `@Component`, `@Service`, `@Repository`, and `@RestController` beans.

> [!WARNING]
> **Placement Gotcha**: If you create a service in package `com.example.service` while your `@SpringBootApplication` class is in `com.example.app`, Spring will **never find your service** unless you explicitly adjust `@ComponentScan`. Always place your main class in the root parent package!

---

## 7. Spring Boot Actuator

> 💡 **Quick Revision Anchor (2-3 Words)**: `Production Health Monitoring`

Spring Boot Actuator provides built-in HTTP endpoints to monitor and inspect application health, runtime metrics, and environment details in production.

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
```

### Key Actuator Endpoints:
- **`/actuator/health`**: Returns basic application status (`{"status": "UP"}`), database connectivity, and disk space.
- **`/actuator/info`**: Exposes arbitrary application metadata (build version, git commit details).
- **`/actuator/metrics`**: Displays JVM memory usage, active thread counts, and garbage collection stats.

```properties
# Exposing endpoints in application.properties
management.endpoints.web.exposure.include=health,info,metrics
# Showing full component health details
management.endpoint.health.show-details=always
```

> [!CAUTION]
> **Security Rule**: In production, never expose sensitive endpoints like `/actuator/env` or `/actuator/beans` publicly without securing them behind Spring Security or internal firewalls.

---

## 8. Global Exception Handling (`@RestControllerAdvice`)

> 💡 **Quick Revision Anchor (2-3 Words)**: `Centralized Error Interceptor`

Without centralized exception handling, controllers end up cluttered with repetitive `try-catch` blocks. Spring provides `@RestControllerAdvice` and `@ExceptionHandler` to intercept exceptions across all controllers in a clean, decoupled manner.

```mermaid
flowchart LR
    Controller["Controller Throws UserNotFoundException"] --> Advisor["@RestControllerAdvice Interceptor"]
    Advisor --> Handler["@ExceptionHandler(UserNotFoundException.class)"]
    Handler --> JSON["Standard Error JSON (404 Not Found)"]
```

### Production Implementation
```java
// 1. Custom Business Exception
public class UserNotFoundException extends RuntimeException {
    public UserNotFoundException(String message) {
        super(message);
    }
}

// 2. Structured Error Response DTO
public record ErrorResponse(
    LocalDateTime timestamp,
    int status,
    String error,
    String message,
    String path
) {}

// 3. Centralized Controller Advice
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleUserNotFound(UserNotFoundException ex, HttpServletRequest request) {
        ErrorResponse error = new ErrorResponse(
            LocalDateTime.now(),
            HttpStatus.NOT_FOUND.value(),
            "USER_NOT_FOUND",
            ex.getMessage(),
            request.getRequestURI()
        );
        return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
    }
}
```

---

## 9. Project Lombok in Spring Boot

> 💡 **Quick Revision Anchor (2-3 Words)**: `Boilerplate Code Reducer`

Lombok uses compile-time annotation processing to automatically generate getters, setters, constructors, builders, and `toString` methods into bytecode, keeping Java source files compact.

### Most Common Lombok Annotations:
- **`@Getter` / `@Setter`**: Generates getters and setters for all fields.
- **`@NoArgsConstructor`**: Generates a default parameterless constructor (required by Hibernate/JPA).
- **`@AllArgsConstructor`**: Generates a constructor with one parameter for each field.
- **`@RequiredArgsConstructor`**: Generates a constructor specifically for all `final` fields (ideal for constructor-based dependency injection).
- **`@Builder`**: Implements the clean GoF Builder pattern for object creation.

```java
@Service
@RequiredArgsConstructor // Automatically generates constructor for all final fields!
public class UserService {
    private final UserRepository userRepository; // Injected without manual constructor!
}
```

> [!WARNING]
> **JPA Entity Warning**: Avoid using `@Data` on JPA `@Entity` classes. `@Data` generates `equals()`, `hashCode()`, and `toString()`, which can trigger circular references, break Hibernate proxy equality, and inadvertently trigger lazy-loading queries. Use `@Getter` and `@Setter` on entities instead.

---

## 10. Spring Bean Scopes

> 💡 **Quick Revision Anchor (2-3 Words)**: `Bean Lifecycle Duration`

A bean's scope defines its lifecycle and how instances are shared across the application.

```mermaid
flowchart TD
    Req1["Request A for Service"] --> S["Singleton Scope (Default)"]
    Req2["Request B for Service"] --> S
    S --> Instance["Single Shared Bean Instance across entire ApplicationContext"]

    Req3["Request A for Task"] --> P1["Prototype Scope -> Creates New Instance 1"]
    Req4["Request B for Task"] --> P2["Prototype Scope -> Creates New Instance 2"]
```

| Scope | Description | Use Case |
|---|---|---|
| **`singleton`** *(Default)* | Exactly **one** instance created per Spring IoC Container. Shared across all callers. | Stateless services (`@Service`), controllers, repositories. |
| **`prototype`** | A **new** instance is created every time the bean is requested from the container. | Stateful objects or non-thread-safe task runners. |
| **`request`** | One instance per HTTP request (Web applications). | User audit logging, request tracing tokens. |
| **`session`** | One instance per HTTP session. | E-commerce shopping cart, user session state. |
| **`application`** | One instance per `ServletContext`. | Application-wide global web cache. |

---

## 11. Request Scope vs. Session Scope

> 💡 **Quick Revision Anchor (2-3 Words)**: `Per-Request vs Per-User`

Both scopes exist strictly within web-aware Spring application contexts:

```mermaid
flowchart TD
    subgraph RequestScope ["Request Scope (@RequestScope)"]
        R1["HTTP Request 1"] --> B1["Bean Instance A"]
        R2["HTTP Request 2"] --> B2["Bean Instance B (New instance)"]
    end

    subgraph SessionScope ["Session Scope (@SessionScope)"]
        U1["User Browser (Session 1)"] --> S1["HTTP Req 1"] & S2["HTTP Req 2"] --> BS1["Same Bean Instance A"]
    end
```

- **`@RequestScope`**: Created when an HTTP request arrives, destroyed when the HTTP response completes. Ideal for tracking unique request IDs or multi-tenant customer IDs.
- **`@SessionScope`**: Persists across multiple HTTP requests originating from the same client session (tracked via `JSESSIONID` cookie). Ideal for shopping carts or login state in stateful applications.

---

## 12. Spring Profiles (Multi-Environment Setup)

> 💡 **Quick Revision Anchor (2-3 Words)**: `Environment-Specific Config`

Profiles let you segregate configuration across environments (e.g., `dev`, `test`, `prod`) without touching source code.

### Configuration Files:
- `application.properties` (Common base configuration)
- `application-dev.properties` (Local development: H2 or local Postgres)
- `application-prod.properties` (Production: AWS RDS, real credentials)

### Activating a Profile:
```properties
# In application.properties:
spring.profiles.active=dev
```
Or via CLI argument at launch:
```bash
java -jar app.jar --spring.profiles.active=prod
```

### Conditional Bean Loading with `@Profile`:
```java
@Service
@Profile("dev")
public class MockEmailService implements EmailService {
    public void sendEmail(String to) { System.out.println("Dev: Simulated email to " + to); }
}

@Service
@Profile("prod")
public class SmtpEmailService implements EmailService {
    public void sendEmail(String to) { /* Connects to real AWS SES / SendGrid */ }
}
```

---

## 13. `application.properties` vs. `application.yaml`

> 💡 **Quick Revision Anchor (2-3 Words)**: `Flat vs Hierarchical`

Both formats store external application configuration. Neither provides superior runtime performance, but YAML is preferred for hierarchical clarity.

### Side-by-Side Comparison:

#### `application.properties` (Flat keys)
```properties
server.port=8080
spring.datasource.url=jdbc:postgresql://localhost:5432/career_os
spring.datasource.username=postgres
spring.datasource.password=secret
```

#### `application.yaml` (Hierarchical structure)
```yaml
server:
  port: 8080

spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/career_os
    username: postgres
    password: secret
```

---

## 14. Property Injection: `@Value` vs. `@ConfigurationProperties` vs. `Environment`

> 💡 **Quick Revision Anchor (2-3 Words)**: `Injecting Config Values`

| Approach | Best Use Case | Type Safety | Relaxed Binding |
|---|---|---|---|
| **`@Value`** | Injecting 1 or 2 isolated primitive properties. | ❌ No (String based) | ❌ No |
| **`@ConfigurationProperties`** | Grouping a related tree of structured properties (e.g., mail server or payment gateway settings). | ✅ Full Type-Safety | ✅ Yes (handles camelCase, kebab-case) |
| **`Environment`** | Programmatically querying properties dynamically at runtime. | ❌ Manual cast | ❌ No |

### Code Demonstration
```java
// Approach 1: @Value
@Value("${app.jwt.secret}")
private String jwtSecret;

// Approach 2: @ConfigurationProperties (Enterprise Standard)
@Component
@ConfigurationProperties(prefix = "app.payment")
@Getter @Setter
public class PaymentProperties {
    private String apiKey;
    private String secretKey;
    private int timeoutMs;
}
```

---

## 15. Persistence Stack: JDBC vs. Hibernate vs. JPA vs. Spring Data JPA

> 💡 **Quick Revision Anchor (2-3 Words)**: `Database Abstraction Layers`

Candidates often confuse these four terms. Understand the exact hierarchy:

```mermaid
flowchart TD
    JDBC["JDBC (Raw Java Database Connection API - Manual SQL, RowSets)"]
    JPA["JPA (Java Persistence API - Official Java Specification / Interfaces)"]
    Hibernate["Hibernate (Concrete ORM Engine that implements JPA specification)"]
    SpringData["Spring Data JPA (Spring abstraction generating automated CRUD repositories)"]

    SpringData -->|Simplifies| JPA
    JPA -->|Implemented By| Hibernate
    Hibernate -->|Under the hood uses| JDBC
```

1. **JDBC (Java Database Connectivity)**: The lowest-level Java standard library for talking to databases. You write raw SQL strings, manually open connections, and loop through `ResultSet` cursors. Lots of boilerplate.
2. **JPA (Java Persistence API / Jakarta Persistence)**: A **standard specification** (a collection of interfaces like `EntityManager`, annotations like `@Entity`, `@Table`) defining how ORMs should behave. It contains *no actual implementation code*.
3. **Hibernate**: The popular **Object-Relational Mapping (ORM) framework** that provides a complete, battle-tested implementation of the JPA specification. It maps Java objects to database rows.
4. **Spring Data JPA**: A high-level library from Spring that sits on top of JPA/Hibernate. It eliminates boilerplate DAO implementations by allowing you to define simple interfaces (`UserRepository extends JpaRepository<User, Long>`) where Spring automatically generates standard CRUD queries and dynamic finders (`findByNameContaining`) at runtime.

---

## 16. `@Transactional` Mechanics

> 💡 **Quick Revision Anchor (2-3 Words)**: `All-or-Nothing ACID`

### What is `@Transactional`?
`@Transactional` guarantees that a series of database operations execute within a single transactional boundary following ACID rules: **either all operations succeed (COMMIT) or if any error occurs, all changes are undone (ROLLBACK)**.

```mermaid
flowchart TD
    Call["transferMoney(accountA, accountB, $100)"] --> Start["Spring AOP Proxy: BEGIN Transaction"]
    Start --> Op1["Step 1: Debit $100 from Account A"]
    Op1 --> Op2["Step 2: Credit $100 to Account B"]
    Op2 --> Check{Did error occur?}
    Check -->|No Error| Commit["COMMIT Transaction (Changes saved permanently)"]
    Check -->|Exception Thrown| Rollback["ROLLBACK Transaction (Account A gets money back!)"]
```

### Under the Hood: Spring AOP Proxies
`@Transactional` is powered by **Spring AOP (Aspect-Oriented Programming)**. When Spring discovers `@Transactional` on a class or method:
1. Spring creates a dynamic **Proxy wrapper** around your bean.
2. When an external caller invokes the method, the proxy intercepts the call.
3. The proxy opens a database connection transaction.
4. The proxy executes your target business method.
5. If the method finishes cleanly, the proxy commits the transaction.
6. If an unchecked exception (`RuntimeException` or `Error`) is thrown, the proxy commands a rollback.

> [!CAUTION]
> **Placement Interview Trap**:  
> *"If method A calls method B within the same service class, and method B has `@Transactional`, will the transaction work?"*  
> **Answer**: **NO!** Because the call is an internal `this.methodB()` invocation, it bypasses the Spring AOP Proxy wrapper completely! The proxy never gets the chance to start a transaction.

---

## 17. Transaction Propagation

> 💡 **Quick Revision Anchor (2-3 Words)**: `Transaction Boundary Rules`

Transaction propagation determines what happens when a transactional method is called by another method that already has an active transaction.

<p align="center">
  <img src="images/transaction-propagation.png" alt="Transaction Propagation Decision Tree" width="550"/>
</p>

### 🎯 Transaction Propagation Decision Matrix

| Propagation Level | Caller Has Active Txn? (**YES**) | Caller Has No Active Txn? (**NO**) | Common Placement Use Case |
|---|---|---|---|
| **`REQUIRED`** *(Default)* | **Join Existing** transaction | **Start new** transaction | Standard business flow (Order + Payment commit together). |
| **`REQUIRES_NEW`** | **Suspend** current, **start new** transaction | **Start new** transaction | **Audit logs / payment attempts** (must save even if caller fails!). |
| **`SUPPORTS`** | **Join Existing** transaction | **Run without** transaction | Read-only lookup methods. |
| **`NOT_SUPPORTED`** | **Suspend** current, **run without** transaction | **Run without** transaction | External network/API calls (sending email/SMS) to avoid holding DB locks. |
| **`MANDATORY`** | **Join Existing** transaction | **Throws Error** | Sub-calculations that strictly require an existing transaction context. |
| **`NEVER`** | **Throws Error** | **Run without** transaction | Strict operations forbidden from executing inside any transaction. |
| **`NESTED`** | Execute inside a database **Savepoint** | **Start new** transaction | Sub-steps that can roll back individually without failing the entire parent transaction. |

---

## 18. Bean Disambiguation: `@Primary` vs. `@Qualifier`

> 💡 **Quick Revision Anchor (2-3 Words)**: `Default vs Explicit Bean`

When multiple beans implement the same interface, Spring cannot decide which bean to inject and throws a `NoUniqueBeanDefinitionException`.

```mermaid
flowchart TD
    Candidate["Multiple Matching Beans Found"] --> CheckQ{"Is @Qualifier present?"}
    CheckQ -- "Yes" --> Q["Inject by Specific Name (Highest Priority) ✅"]
    CheckQ -- "No" --> CheckP{"Is one marked @Primary?"}
    CheckP -- "Yes" --> P["Inject Default @Primary Bean ✅"]
    CheckP -- "No" --> Err["Throw NoUniqueBeanDefinitionException ❌"]
```

### Standard Tutorial Example: `PaymentService`

```java
// 1. Interface
public interface PaymentService {
    void pay(double amount);
}

// 2. Default Bean marked with @Primary
@Component
@Primary
public class CreditCardPaymentService implements PaymentService {
    public void pay(double amount) { System.out.println("Paid with Credit Card: " + amount); }
}

// 3. Alternative Bean
@Component("upiPayment")
public class UpiPaymentService implements PaymentService {
    public void pay(double amount) { System.out.println("Paid with UPI: " + amount); }
}

// 4. Injected into Service
@Service
public class OrderService {
    private final PaymentService defaultPayment;
    private final PaymentService fastPayment;

    public OrderService(
        PaymentService defaultPayment,                         // Injects CreditCardPaymentService (@Primary)
        @Qualifier("upiPayment") PaymentService fastPayment    // Injects UpiPaymentService (@Qualifier overrides @Primary)
    ) {
        this.defaultPayment = defaultPayment;
        this.fastPayment = fastPayment;
    }
}
```

### Key Differences & Precedence

| Feature | `@Primary` | `@Qualifier` |
| :--- | :--- | :--- |
| **Where to Put** | On the **Bean class** (`@Component`, `@Bean`) | At the **Injection point** (Constructor/Field) |
| **Purpose** | Defines the **default fallback** implementation | Defines an **explicit selection** by name |
| **Precedence** | Lower (`@Qualifier` always overrides it) | **Highest priority** |

> [!TIP]
> **Precedence Order**: `@Qualifier` > `@Primary` > Matching by variable name.

---

## 19. Injection Types: Constructor vs. Setter vs. Field Injection

> 💡 **Quick Revision Anchor (2-3 Words)**: `Constructor vs Setter vs Field`

Dependency Injection (DI) allows Spring's IoC container to create and supply beans to your classes instead of using `new`. Spring supports **three injection styles**:

### 1. Field Injection (❌ Avoid in Production)
Injects dependencies directly into private fields using Java reflection.

```java
@Service
public class OrderService {
    @Autowired
    private PaymentService paymentService; // Injected via reflection

    @Autowired(required = false)           // Optional dependency (null if bean missing)
    private DiscountService discountService;
}
```
- **Why developers use it**: Short and convenient syntax.
- **Why it's discouraged**:
  - **Mutable**: Fields cannot be `final`.
  - **Hard to Unit Test**: You cannot pass mock objects without reflection or starting the full Spring context.

---

### 2. Setter Injection (Use for Optional Dependencies)
Injects dependencies via public setter methods after bean creation.

```java
@Service
public class OrderService {
    private PaymentService paymentService;

    @Autowired(required = false) // Best for optional or reconfigurable dependencies
    public void setPaymentService(PaymentService paymentService) {
        this.paymentService = paymentService;
    }
}
```
- **Best Use Case**: Ideal for optional dependencies that can be reconfigured or changed at runtime.
- **Drawback**: Allows the object to exist in an incomplete state if the setter is not called.

---

### 3. Constructor Injection (✅ Recommended Best Practice)
Injects dependencies through the constructor during object instantiation.

```java
// Pattern A: Standard Constructor Injection (Spring 4.3+ @Autowired is optional)
@Service
public class OrderService {
    private final PaymentService paymentService; // 1. 'final' guarantees immutability

    public OrderService(PaymentService paymentService) {
        this.paymentService = paymentService;
    }
}

// Pattern B: Most Used in Real Projects & Tutorials (with Lombok)
@Service
@RequiredArgsConstructor // Automatically creates constructor for all 'final' fields!
public class OrderService {
    private final PaymentService paymentService;
    private final NotificationService notificationService;
}
```

- **Why Constructor Injection is the Industry Standard**:
  1. **True Immutability**: Fields are marked **`final`** and cannot be modified after object construction.
  2. **No NullPointerExceptions**: Guarantees all mandatory dependencies are present before the bean is created.
  3. **Trivial Unit Testing**: You can test without Spring using plain Java: `new OrderService(new MockPaymentService())`.

---

### Summary Comparison

| Feature | Constructor Injection | Setter Injection | Field Injection |
| :--- | :--- | :--- | :--- |
| **Immutability** | ✅ **Yes** (`final` fields) | ❌ No (mutable) | ❌ No (mutable) |
| **Best For** | **Mandatory** dependencies | **Optional** (`required = false`) | Quick prototypes only |
| **Testing** | Easy (Plain Java POJO) | Medium (Call setters) | Hard (Needs reflection) |
| **Recommendation** | **Best Practice** | Use when optional | **Avoid** |

---

## 20. `@Lookup` Annotation (Prototype Inside Singleton)

> 💡 **Quick Revision Anchor (2-3 Words)**: `Dynamic Prototype Lookup`

### The Problem: The Scope Mismatch Dilemma
In Spring, bean scopes define **how many instances** are created and **when** they are created:
- **Singleton (Default)**: Created once at application startup; the same instance is shared across the entire `ApplicationContext`.
- **Prototype (`@Scope("prototype")`)**: Created on-demand every time the bean is requested from the Spring container.

When a **Prototype bean is directly injected into a Singleton bean**, a scope mismatch occurs:

```mermaid
flowchart TD
    subgraph Startup ["Application Startup (One-Time Execution)"]
        S["Singleton Controller Created"] --> Need["Requires Prototype Dependency"]
        Need --> P1["Prototype Instance #1 Created & Injected"]
    end

    subgraph RuntimeCalls ["Runtime API Requests"]
        R1["Request 1"] --> S
        R2["Request 2"] --> S
        R3["Request 3"] --> S
        S -->|Always uses same reference| P1
    end
```

#### What Happens Under the Hood:
1. At application startup, Spring instantiates the singleton bean (`StudentController`).
2. Spring resolves its dependencies and creates **one instance** of the prototype bean (`Student #1`) to inject into the controller.
3. Because the singleton is created only once, dependency injection occurs **only once**.
4. On subsequent requests (`/student`), the controller reuses the same initial reference (`Student #1`).
5. **Result**: The prototype bean unintentionally behaves like a **singleton**!

---

### The Solution: `@Lookup` Method Injection
`@Lookup` tells Spring to dynamically fetch a fresh prototype instance from the `ApplicationContext` on **every method invocation**, rather than holding onto a single static reference.

#### 1. The Prototype Bean
```java
@Component
@Scope("prototype")
public class Student {
    public Student() {
        System.out.println("Student bean created: " + hashCode());
    }
}
```

#### 2. The Singleton Bean with `@Lookup`
You can implement `@Lookup` in two ways:

##### Approach A: Concrete Method with Dummy Return
```java
@RestController
public class StudentController {

    @GetMapping("/student")
    public int getStudentHashCode() {
        Student student = getStudent(); // Returns a fresh instance every time!
        return student.hashCode();
    }

    // Spring intercepts and overrides this method
    @Lookup
    public Student getStudent() {
        return null; // Never executed; Spring proxy intercepts the call
    }
}
```

##### Approach B: Abstract Method (Cleaner & Idiomatic)
Because Spring provides the actual implementation at runtime, you can declare the method and class as `abstract`, eliminating the dummy `return null`:

```java
@RestController
public abstract class StudentController {

    @GetMapping("/student")
    public int getStudentHashCode() {
        return getStudent().hashCode(); // Fresh prototype instance every request
    }

    @Lookup
    public abstract Student getStudent(); // Spring implements this method
}
```

---

### How `@Lookup` Works Internally (CGLIB Subclassing)
You might wonder: *"Why doesn't `return null` throw a `NullPointerException`?"*

At runtime, Spring uses **CGLIB byte-code generation** to create a dynamic proxy subclass of your bean that overrides the `@Lookup` method:

```java
// Conceptual representation of what Spring generates at runtime
public class StudentControllerSpringProxy extends StudentController {
    
    @Autowired
    private ApplicationContext applicationContext;

    @Override
    public Student getStudent() {
        // Asks the Spring container for a fresh prototype bean on every call
        return applicationContext.getBean(Student.class);
    }
}
```

When you call `getStudent()`, you are executing the CGLIB proxy's overridden method, which calls `applicationContext.getBean(Student.class)`. Because `Student` is marked `@Scope("prototype")`, Spring returns a brand new instance every time:
```text
Request 1 -> getStudent() -> Student created: 1845621
Request 2 -> getStudent() -> Student created: 7492813
Request 3 -> getStudent() -> Student created: 3958102
```

---

### Modern Alternative: `ObjectProvider<T>`
In modern Spring Boot (Spring 4.3+), you can also achieve this cleanly without proxies or `@Lookup` using **`ObjectProvider<T>`**:

```java
@RestController
public class StudentController {

    private final ObjectProvider<Student> studentProvider;

    public StudentController(ObjectProvider<Student> studentProvider) {
        this.studentProvider = studentProvider;
    }

    @GetMapping("/student")
    public int getStudentHashCode() {
        // getObject() asks the context for a fresh prototype instance
        return studentProvider.getObject().hashCode();
    }
}
```

---

### High-Yield Interview Q&A

| Interview Question | Precise Technical Answer |
| :--- | :--- |
| **Why does injecting a Prototype into a Singleton fail?** | Dependency injection occurs only once during singleton initialization. The singleton holds a permanent reference to the initial prototype instance. |
| **How does `@Lookup` fix this?** | It uses **CGLIB dynamic subclassing** to override the method and dynamically call `applicationContext.getBean(Class)` on each invocation. |
| **Why doesn't `return null` cause a NPE?** | The original method body is never executed; Spring's CGLIB proxy intercepts the method call and delegates to the container. |
| **`@Lookup` vs `ApplicationContextAware`?** | Implementing `ApplicationContextAware` directly couples your code to the Spring Framework API. `@Lookup` keeps your classes clean and decoupled. |

---

## 21. Servlet Filters vs. Spring MVC Interceptors

> 💡 **Quick Revision Anchor (2-3 Words)**: `Servlet vs MVC Layer`

<p align="center">
  <img src="images/Filter vs Interceptors.png" alt="Filter vs Interceptors Architecture" width="550"/>
</p>

```
Client ➔ [Tomcat/Servlet Container] ➔ [Filter Chain] ➔ [DispatcherServlet] ➔ [Interceptor] ➔ [@Controller]
Client ⇠ [Tomcat/Servlet Container] ⇠ [Filter Chain] ⇠ [DispatcherServlet] ⇠ [Interceptor] ⇠ [@Controller]
```

### 1. Core Architectural Difference
- **Servlet Filter (`jakarta.servlet.Filter`)**: Servlet container level (Tomcat). Runs **before** `DispatcherServlet`. Unaware of Spring MVC controllers.
- **Handler Interceptor (`HandlerInterceptor`)**: Spring MVC framework level. Runs **between** `DispatcherServlet` and `@Controller`. Has full access to the target `HandlerMethod` and Spring context.

> 📌 **Placement Shortcut**: **Filter** = Servlet / Container level | **Interceptor** = Spring MVC / Handler level

---

### 2. Servlet Filter (Code & Lifecycle)
Executes pre-processing on the way in, and post-processing in **reverse order** on the return path.

```java
@Component
public class RequestTrackingFilter implements Filter {
    @Override
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain) 
            throws IOException, ServletException {
        // 🟢 Pre-processing (Executed on incoming request)
        req.setAttribute("requestId", UUID.randomUUID().toString());
        
        chain.doFilter(req, res); // ⚡ Pass down chain. If omitted, request HALTS!
        
        // 🔵 Post-processing (Executed on response return path in REVERSE order)
    }
}
```
* **Best Used For**: Low-level HTTP tasks — CORS, Request/Correlation IDs, GZIP compression, rate limiting, and Spring Security (`SecurityFilterChain`).

---

### 3. Spring MVC Interceptor (Code & 3 Lifecycle Hooks)

```java
@Component
public class TimingAndAuthInterceptor implements HandlerInterceptor {
    @Override
    public boolean preHandle(HttpServletRequest req, HttpServletResponse res, Object handler) {
        // 🟢 1. Runs BEFORE Controller. Return true = continue; false = BLOCK request ❌
        req.setAttribute("startTime", System.currentTimeMillis());
        return true; 
    }

    @Override
    public void postHandle(HttpServletRequest req, HttpServletResponse res, Object handler, ModelAndView mv) {
        // 🟡 2. Runs AFTER Controller, BEFORE view rendering / response serialization
    }

    @Override
    public void afterCompletion(HttpServletRequest req, HttpServletResponse res, Object handler, Exception ex) {
        // 🔵 3. Runs AFTER entire request & view lifecycle is complete (always runs, for cleanup/metrics)
        long duration = System.currentTimeMillis() - (Long) req.getAttribute("startTime");
    }
}
```

#### Registration via `WebMvcConfigurer`:
```java
@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Autowired private TimingAndAuthInterceptor timingInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(timingInterceptor)
                .addPathPatterns("/api/**")
                .excludePathPatterns("/api/public/**");
    }
}
```

---

### 4. Filter vs. Interceptor — Interview Comparison Matrix

| Feature | Servlet Filter | Handler Interceptor |
|---|---|---|
| **Ecosystem / Layer** | Java Servlet / Web Container (`jakarta.servlet`) | Spring MVC Framework (`HandlerInterceptor`) |
| **Execution Point** | **Before** `DispatcherServlet` & Spring MVC | **Between** `DispatcherServlet` & `@Controller` |
| **Spring Awareness** | Low-level; no access to target Controller | High; receives `Object handler` (`HandlerMethod`) |
| **Lifecycle Hooks** | Single `doFilter()` (pre & post via `chain`) | 3 hooks: `preHandle()`, `postHandle()`, `afterCompletion()` |
| **Can Block Request?** | Yes (omit `chain.doFilter()`) | Yes (`preHandle()` returns `false`) |
| **Modifies View / Model?** | ❌ No | ✅ Yes (in `postHandle()`) |
| **Registration** | `@Component` / `FilterRegistrationBean` | `WebMvcConfigurer.addInterceptors()` |

---

### 5. Decision Framework: When to Use Which?
- **Use Filter when**: Concern is container/HTTP-level and agnostic of Spring MVC (CORS, GZIP, raw payload logging/caching, global security filters).
- **Use Interceptor when**: Concern requires Spring controller awareness (controller execution timing, custom annotation inspection on handler methods, fine-grained URL pattern routing).

---

## 22. Cyclic Dependencies & `@Lazy`

> 💡 **Quick Revision Anchor (2-3 Words)**: `Circular Reference & Resolution`

---

### 1. Introduction
A **Cyclic (Circular) Dependency** occurs when two or more Spring-managed beans depend on each other, forming a closed loop ($A \to B \to A$ or $A \to B \to C \to A$).

```mermaid
flowchart LR
    A["ServiceA"] -->|"depends on"| B["ServiceB"]
    B -->|"depends on"| A
```

When constructor injection is used, the Spring IoC container cannot determine which bean to instantiate first. As a result, the application fails on startup with:
- `BeanCurrentlyInCreationException`
- `UnsatisfiedDependencyException: Error creating bean with name 'serviceA': Requested bean is currently in creation: Is there an unresolvable circular reference?`

> [!NOTE]
> Starting with **Spring Boot 2.6+**, circular dependencies are **disabled by default**. The application will fail fast on startup unless explicitly resolved or relaxed.

---

### 2. Code Walkthrough
Consider two services in an e-commerce order workflow where `OrderService` needs `PaymentService` to verify transactions, and `PaymentService` needs `OrderService` to update order status:

```java
@Service
public class OrderService {
    private final PaymentService paymentService;

    // Constructor Injection
    public OrderService(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    public void createOrder() {
        System.out.println("Creating order...");
        paymentService.processPayment();
    }
}
```

```java
@Service
public class PaymentService {
    private final OrderService orderService;

    // Constructor Injection
    public PaymentService(OrderService orderService) {
        this.orderService = orderService;
    }

    public void processPayment() {
        System.out.println("Processing payment...");
    }
}
```

**Startup Crash Output:**
```text
***************************
APPLICATION FAILED TO START
***************************
Description:
The dependencies of some of the beans in the application context form a cycle:
┌─────┐
|  orderService (field private final PaymentService OrderService.paymentService)
↑     ↓
|  paymentService (field private final OrderService PaymentService.orderService)
└─────┘
```

---

### 3. Cyclic Dependency : Why does it occur ?

```mermaid
sequenceDiagram
    autonumber
    participant IoC as Spring ApplicationContext
    participant A as OrderService
    participant B as PaymentService

    IoC->>A: 1. Attempt to instantiate OrderService
    Note over A: Needs PaymentService instance for constructor
    IoC->>B: 2. Attempt to instantiate PaymentService
    Note over B: Needs OrderService instance for constructor
    IoC->>A: 3. Look for OrderService (still in creation!)
    Note over IoC: DEADLOCK: Neither bean can complete construction
    IoC-->>IoC: Throw BeanCurrentlyInCreationException
```

#### Root Causes:
1. **Instantiation vs. Injection Order**: With constructor injection, a class cannot be instantiated into memory until all constructor parameters are already fully created and provided.
2. **Tight Coupling & Violation of SRP (Single Responsibility Principle)**: Both classes know too much about each other and share bidirectional dependencies instead of a clean unidirectional flow.
3. **Spring 3-Level Cache Limitation**: While Spring's 3-level singleton cache (`DefaultSingletonBeanRegistry`) can resolve circular dependencies for *setter / field injection* (by exposing an uninitialized early bean reference), it **cannot** resolve circular dependencies for **constructor injection** because the instance itself cannot even be instantiated.

---

### 4. `@Lazy` Annotation : Fix No. 1
The `@Lazy` annotation breaks the direct constructor initialization deadlock by instructing Spring to inject a **dynamic proxy (CGLIB proxy)** at startup instead of the actual bean instance.

#### How it Works:
1. Spring creates a lightweight proxy placeholder for `OrderService` and passes it into `PaymentService`'s constructor.
2. `PaymentService` completes instantiation.
3. `OrderService` receives the real `PaymentService` instance and completes instantiation.
4. When a method is invoked on the proxy for the first time, the proxy delegates the call to the real bean in the ApplicationContext.

```java
@Service
public class PaymentService {
    private final OrderService orderService;

    // Fix: @Lazy injects a CGLIB proxy placeholder
    public PaymentService(@Lazy OrderService orderService) {
        this.orderService = orderService;
    }

    public void processPayment() {
        System.out.println("Processing payment...");
        orderService.notifyOrderComplete(); // Real bean called through proxy
    }
}
```

```mermaid
flowchart TD
    IoC["Spring Container"] -->|Creates real bean| OS["OrderService"]
    IoC -->|Injects Proxy placeholder| Proxy["OrderService Proxy"]
    Proxy -->|Passes to constructor| PS["PaymentService"]
    PS -->|"Calls method at runtime"| Proxy
    Proxy -->|"Delegates call to"| OS
```

> [!TIP]
> `@Lazy` can be applied either on the constructor parameter (`@Lazy OrderService orderService`) or on the class level (`@Lazy @Service`). Applying it to one side of the circular loop is sufficient to break the cycle.

---

### 5. Design Change : Fix No. 2 (Recommended Best Practice)
While `@Lazy` fixes the startup crash, it is a **workaround** that hides an underlying architectural flaw. The permanent and clean industry standard solutions are:

#### Approach A: Extract Shared Logic into a Third Service (Mediator / Helper)
Identify the shared functionality causing the mutual dependency and extract it into a dedicated service (e.g., `OrderTransactionManager` or `NotificationService`).

```mermaid
flowchart LR
    OS["OrderService"] --> CS["OrderTransactionManager"]
    PS["PaymentService"] --> CS
```

```java
// 1. Shared Coordinator Service
@Service
public class OrderTransactionManager {
    public void finalizeOrder(Long orderId) {
        System.out.println("Finalizing order status for: " + orderId);
    }
}

// 2. OrderService depends only on PaymentService & Coordinator
@Service
public class OrderService {
    private final PaymentService paymentService;
    private final OrderTransactionManager transactionManager;

    public OrderService(PaymentService paymentService, OrderTransactionManager transactionManager) {
        this.paymentService = paymentService;
        this.transactionManager = transactionManager;
    }
}

// 3. PaymentService depends only on Coordinator (Cycle broken!)
@Service
public class PaymentService {
    private final OrderTransactionManager transactionManager;

    public PaymentService(OrderTransactionManager transactionManager) {
        this.transactionManager = transactionManager;
    }

    public void processPayment(Long orderId) {
        // Business logic
        transactionManager.finalizeOrder(orderId);
    }
}
```

#### Approach B: Decouple via Spring Application Events (`ApplicationEventPublisher`)
Use event-driven communication to eliminate direct bean references entirely.

```java
// 1. Define an Event
public record PaymentCompletedEvent(Long orderId, BigDecimal amount) {}

// 2. Publisher (PaymentService has NO reference to OrderService)
@Service
public class PaymentService {
    private final ApplicationEventPublisher eventPublisher;

    public PaymentService(ApplicationEventPublisher eventPublisher) {
        this.eventPublisher = eventPublisher;
    }

    public void processPayment(Long orderId, BigDecimal amount) {
        System.out.println("Payment processed.");
        // Publish event asynchronously or synchronously
        eventPublisher.publishEvent(new PaymentCompletedEvent(orderId, amount));
    }
}

// 3. Consumer / Listener (OrderService listens to event)
@Service
public class OrderService {

    @EventListener
    public void handlePaymentCompleted(PaymentCompletedEvent event) {
        System.out.println("Updating order " + event.orderId() + " to PAID");
    }
}
```

| Strategy | When to Use | Advantage |
| :--- | :--- | :--- |
| **`@Lazy` Proxy** | Quick patch / legacy codebases where refactoring is risky | Immediate fix without structural code rewrite |
| **Extract 3rd Service** | Direct synchronous business flow | Clear responsibility, maintains compile-time safety |
| **Spring Events** | Side-effects, notifications, decoupled actions | Completely zero coupling between domain services |

---

## 23. `@PathVariable` vs. `@RequestParam`

> 💡 **Quick Revision Anchor (2-3 Words)**: `URI Path vs Query Param`

```mermaid
flowchart LR
    URL1["/api/v1/users/42"] -->|42 is part of URI path| PV["@PathVariable Long id"]
    URL2["/api/v1/users?role=admin&page=1"] -->|Parameters after '?'| RP["@RequestParam String role, int page"]
```

- **`@PathVariable`**: Extracts values directly embedded inside the URI path (identifies a specific resource).  
  Example: `GET /orders/{orderId}` $\rightarrow$ `@PathVariable Long orderId`
- **`@RequestParam`**: Extracts query parameters appended after the `?` in the URL (used for filtering, sorting, pagination).  
  Example: `GET /orders?status=PENDING&page=2` $\rightarrow$ `@RequestParam String status`

---

## 24. `ResponseEntity<T>`

> 💡 **Quick Revision Anchor (2-3 Words)**: `Full HTTP Control`

In REST controllers, returning raw objects defaults to HTTP `200 OK`. `ResponseEntity<T>` represents the entire HTTP response, letting you customize the **Status Code**, **Headers**, and **Body**:

```java
@GetMapping("/{id}")
public ResponseEntity<UserResponse> getUser(@PathVariable Long id) {
    UserResponse user = userService.findById(id);
    return ResponseEntity.ok(user); // 200 OK with body
}

@PostMapping
public ResponseEntity<UserResponse> createUser(@RequestBody UserRequest request) {
    UserResponse created = userService.create(request);
    return ResponseEntity
        .status(HttpStatus.CREATED) // 201 Created
        .header("Location", "/api/users/" + created.id())
        .body(created);
}

@DeleteMapping("/{id}")
public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
    userService.delete(id);
    return ResponseEntity.noContent().build(); // 204 No Content
}
```

---

## 25. `DispatcherServlet` & Spring MVC Request Flow

> 💡 **Quick Revision Anchor (2-3 Words)**: `Front Controller Hub`

`DispatcherServlet` is the core architectural engine of Spring MVC, implementing the classic **Front Controller Pattern**.

```mermaid
sequenceDiagram
    autonumber
    actor Client as Browser / Mobile App
    participant DS as DispatcherServlet
    participant HM as HandlerMapping
    participant HA as HandlerAdapter
    participant C as UserController (@RestController)
    participant MC as HttpMessageConverter (Jackson)

    Client->>DS: HTTP GET /api/users/10
    DS->>HM: Which Controller handles this URL?
    HM-->>DS: UserController#getUser(10)
    DS->>HA: Invoke the handler method
    HA->>C: Execute getUser(10)
    C-->>HA: Returns User DTO
    HA->>MC: Convert User DTO into JSON
    MC-->>DS: Serialized JSON bytes
    DS-->>Client: HTTP 200 OK + JSON Payload
```

1. **`DispatcherServlet`** receives the incoming HTTP request.
2. Calls **`HandlerMapping`** to identify the matched controller method.
3. Delegates invocation to **`HandlerAdapter`**.
4. Controller invokes service/repository layers and returns raw DTO.
5. **`HttpMessageConverter`** (Jackson) serializes the DTO into JSON and writes it to the response stream.

---

## 26. Pagination, Sorting & Filtering

> 💡 **Quick Revision Anchor (2-3 Words)**: `Database-Side Chunking`

Loading an entire table containing 500,000 rows into JVM memory will cause an `OutOfMemoryError`. Spring Data JPA supports database-level chunking using `Pageable`.

```java
// Controller
@GetMapping
public ResponseEntity<Page<ProductResponse>> getProducts(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size,
        @RequestParam(defaultValue = "price,desc") String sort) {

    Pageable pageable = PageRequest.of(page, size, Sort.by("price").descending());
    return ResponseEntity.ok(productService.findAll(pageable));
}

// Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    // Generates: SELECT * FROM products ORDER BY price DESC LIMIT 20 OFFSET 0;
    Page<Product> findAll(Pageable pageable);
}
```

### `Page<T>` vs. `Slice<T>`
- **`Page<T>`**: Executes **two SQL queries**: one to fetch the slice data (`LIMIT/OFFSET`), and a secondary `SELECT COUNT(*)` query to calculate total pages.
- **`Slice<T>`**: Fetches `LIMIT + 1` elements. Does **not** execute a count query. Ideal for mobile app infinite scrolling where total count is unnecessary.

---

## 27. Object Mapping with MapStruct & DTO Pattern

> 💡 **Quick Revision Anchor (2-3 Words)**: `Compile-Time DTO Mapper`

### Why use DTOs (Data Transfer Objects)?
1. Never expose your raw database `@Entity` to external callers.
2. Prevents exposing sensitive fields (passwords, social security numbers).
3. Eliminates circular reference serialization bugs in bidirectional JPA relationships.

### Why MapStruct?
Traditional reflection-based mappers (like ModelMapper) are slow at runtime. **MapStruct generates type-safe, plain Java code at compile time** with zero reflection overhead.

```java
@Mapper(componentModel = "spring")
public interface UserMapper {
    UserResponse toResponse(User entity);
    User toEntity(UserCreateRequest request);
}
```

---

## 28. Core Spring Boot Annotations Quick Reference

> 💡 **Quick Revision Anchor (2-3 Words)**: `Essential Annotation Cheat Sheet`

| Category | Annotations | Purpose |
|---|---|---|
| **Core Stereotypes** | `@Component`, `@Service`, `@Repository`, `@RestController` | Registers managed beans in the IoC container. |
| **Dependency Injection** | `@Autowired`, `@Qualifier`, `@Primary`, `@Lazy` | Directs how dependencies are wired. |
| **HTTP Web Mapping** | `@GetMapping`, `@PostMapping`, `@PutMapping`, `@DeleteMapping`, `@PatchMapping` | Maps HTTP verbs to handler methods. |
| **HTTP Parameters** | `@PathVariable`, `@RequestParam`, `@RequestBody`, `@RequestHeader` | Extracts data from URL paths, query parameters, bodies, and headers. |
| **Database & JPA** | `@Entity`, `@Table`, `@Id`, `@GeneratedValue`, `@Column`, `@Transient` | Defines ORM entity mappings. |
| **Transactions** | `@Transactional` | Manages database transaction commit and rollback boundaries. |
| **Error Handling** | `@RestControllerAdvice`, `@ExceptionHandler` | Intercepts and formats application-wide exceptions. |

---

## 29. Input Validation & `@Valid`

> 💡 **Quick Revision Anchor (2-3 Words)**: `Declarative Input Validation`

### Why Declarative Validation?
Writing manual `if (user.getName() == null)` or `if (password.length() < 6)` checks in controllers creates messy boilerplate. Spring Boot provides declarative validation via the standard Java Bean Validation specification (`jakarta.validation`), backed by **Hibernate Validator**.

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-validation</artifactId>
</dependency>
```

> [!IMPORTANT]
> **Enabling Validation**: You **must** annotate the request body with **`@Valid`** (e.g., `@Valid @RequestBody UserDTO user`). Without `@Valid`, Spring completely ignores all validation annotations on the DTO!

---

### Core Built-in Validation Annotations

```mermaid
flowchart TD
    subgraph TextNull ["String & Null Checks"]
        NN["@NotNull: Not null (Allows '' and ' ')"]
        NE["@NotEmpty: Not null & length > 0 (Allows ' ')"]
        NB["@NotBlank: Not null & trimmed length > 0 (Strictest)"]
    end
    subgraph Numbers ["Numeric & Size Checks"]
        SZ["@Size(min, max): String length or Collection size"]
        MM["@Min, @Max: Numeric boundaries (e.g., age)"]
        PN["@Positive, @Negative: Numeric signs (e.g., salary)"]
        DG["@Digits(integer=6, fraction=2): Decimal places"]
    end
    subgraph Formats ["Formats & Dates"]
        EM["@Email: Valid email structure (local@domain)"]
        PT["@Pattern(regexp): Custom regular expression"]
        PF["@Past, @Future: Temporal date/time checks"]
    end
```

#### Annotation Breakdown & Differences:

| Annotation | Applicable Types | Accepts `null`? | Key Rule |
| :--- | :--- | :---: | :--- |
| **`@NotNull`** | Any Object | ❌ No | Value cannot be `null`. (Allows empty string `""` or whitespace `" "`). |
| **`@NotEmpty`** | String, Collection, Map, Array | ❌ No | Must not be `null` and `size > 0`. (Allows whitespace `" "`). |
| **`@NotBlank`** | String | ❌ No | Must not be `null` and trimmed length $> 0$. (Rejects `null`, `""`, and `" "`). |
| **`@Size(min, max)`** | String, Collection, Map, Array | ✅ Yes | Length or element count must be within `[min, max]`. |
| **`@Min(v)`, `@Max(v)`** | Numeric (`int`, `long`, `BigDecimal`) | ✅ Yes | Value must be $\ge$ min or $\le$ max. |
| **`@Positive`** | Numeric | ✅ Yes | Value must be strictly $> 0$. |
| **`@Digits(int, frac)`**| Numeric / `BigDecimal` | ✅ Yes | Max integer digits and max fraction digits. |
| **`@Email`** | String | ✅ Yes | Must have valid email structure (`local@domain`). |
| **`@Pattern(regexp)`** | String | ✅ Yes | Must match specified regular expression. |
| **`@Past` / `@Future`** | `LocalDate`, `Date`, `Instant` | ✅ Yes | Must be in the past or future relative to current time. |

> [!TIP]
> Notice that annotations like `@Size`, `@Min`, `@Email`, and `@Pattern` consider `null` valid! If a field is mandatory, always pair them with **`@NotNull`** or **`@NotBlank`**.

---

### Standard Tutorial DTO & Controller Example

```java
public class UserCreateRequest {

    @NotBlank(message = "Name cannot be blank")
    private String name;

    @NotBlank(message = "Password cannot be blank")
    @Size(min = 6, max = 20, message = "Password must be 6 to 20 characters")
    private String password;

    @Min(value = 18, message = "Age must be at least 18")
    @Max(value = 60, message = "Age cannot exceed 60")
    private int age;

    @Positive(message = "Salary must be positive")
    private double salary;

    @Digits(integer = 6, fraction = 2, message = "Balance max 6 digits and 2 decimals")
    private BigDecimal accountBalance;

    @Email(message = "Invalid email format")
    private String email;

    @Pattern(
        regexp = "^[A-Za-z0-9._%+-]+@thecuriouscoder\\.com$",
        message = "Corporate email must end with @thecuriouscoder.com"
    )
    private String corporateEmail;

    @Past(message = "Date of birth must be in the past")
    private LocalDate dateOfBirth;

    // Collection validation: Must not be null AND must have at least 1 element
    @NotNull(message = "Hobbies list cannot be null")
    @Size(min = 1, message = "Must specify at least one hobby")
    private List<String> hobbies;

    // Getters and Setters
}
```

#### The Controller
```java
@RestController
@RequestMapping("/users")
public class UserController {

    @PostMapping
    public ResponseEntity<String> createUser(@Valid @RequestBody UserCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body("User created successfully");
    }
}
```

---

### Centralized Validation Exception Handling (`@RestControllerAdvice`)
When validation fails on a `@Valid` parameter, Spring throws **`MethodArgumentNotValidException`**. Instead of returning a raw 500 error or unstructured payload, intercept it globally and return a clean map of `{ fieldName: errorMessage }`:

```java
@RestControllerAdvice
public class GlobalValidationExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST) // Returns HTTP 400 Bad Request
    public Map<String, String> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        
        ex.getBindingResult().getFieldErrors().forEach(error -> 
            errors.put(error.getField(), error.getDefaultMessage())
        );
        
        return errors;
    }
}
```

#### Example Client JSON Error Response (`HTTP 400 Bad Request`):
```json
{
  "name": "Name cannot be blank",
  "age": "Age must be at least 18",
  "corporateEmail": "Corporate email must end with @thecuriouscoder.com"
}
```

---

### Creating Custom Validation Annotations (3-Step Framework)
When built-in annotations don't satisfy complex business logic (e.g., validating Indian phone numbers), you can create a custom constraint in 3 simple steps:

#### Step 1: Define the Annotation
```java
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = PhoneNumberValidator.class) // Links to the validator implementation
public @interface ValidPhoneNumber {
    String message() default "Invalid phone number format";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
```

#### Step 2: Implement `ConstraintValidator`
```java
public class PhoneNumberValidator implements ConstraintValidator<ValidPhoneNumber, String> {

    // Regex: Optional '+91-' prefix, first digit 6-9, followed by 9 digits
    private static final String PHONE_REGEX = "^(\\+91-?)?[6-9]\\d{9}$";

    @Override
    public boolean isValid(String phoneNumber, ConstraintValidatorContext context) {
        if (phoneNumber == null || phoneNumber.isBlank()) {
            return false; // Fail validation if null or blank
        }
        return phoneNumber.matches(PHONE_REGEX);
    }
}
```

#### Step 3: Apply the Custom Annotation on DTO
```java
public class UserCreateRequest {

    @ValidPhoneNumber(message = "Phone number must be a valid 10-digit Indian mobile number")
    private String phoneNumber;

    // Getters and Setters
}
```

---

## 30. Rapid-Fire Interview Questions & Answers

> 💡 **Quick Revision Anchor (2-3 Words)**: `10-Second Recall Answers`

1. **What is Spring Boot Auto-Configuration?**  
   It automatically provisions Spring beans based on the libraries found on your classpath and predefined conditions.
2. **What embedded servers does Spring Boot support?**  
   Tomcat (default), Jetty, and Undertow.
3. **What is the default Spring bean scope?**  
   `singleton` (one instance per Spring IoC Container).
4. **Is Spring's singleton scope thread-safe?**  
   No. If a singleton bean has mutable instance variables, it is not thread-safe. Spring beans should be stateless.
5. **What is the difference between `@NotNull`, `@NotEmpty`, and `@NotBlank`?**  
   `@NotNull` checks non-null; `@NotEmpty` checks non-null and size > 0; `@NotBlank` checks non-null, size > 0, and not pure whitespace.
6. **Can `@Transactional` rollback on checked exceptions?**  
   By default, it only rolls back on `RuntimeException` and `Error`. To rollback on checked exceptions, use `@Transactional(rollbackFor = Exception.class)`.
7. **What is Spring Boot Actuator used for?**  
   Production health checks, metrics, and application runtime monitoring.

---

## 31. End-to-End Project Explanation Framework

> 💡 **Quick Revision Anchor (2-3 Words)**: `Resume Architecture Defense`

When asked *"Explain your Spring Boot project architecture"*, use this structured 4-layer response:

```mermaid
flowchart TD
    Client(["Client (Browser / Mobile)"]) --> Gateway["API Gateway / Security Filter (JWT Validation)"]
    Gateway --> Controller["Controller Layer (@RestController)\nValidates DTO via @Valid"]
    Controller --> Service["Service Layer (@Service, @Transactional)\nBusiness Rules & Orchestration"]
    Service --> Repo["Repository Layer (Spring Data JPA)\nHikariCP Connection Pool"]
    Repo --> DB[("PostgreSQL Database")]
```

### Verbal Script Template:
> *"In my project, I built a RESTful backend using Spring Boot 3 and Java 17. The system follows a layered architecture:*
> 1. *The **Controller Layer** exposes versioned REST endpoints, consumes and returns DTOs, and validates input payloads via Bean Validation (`@Valid`).*
> 2. *The **Service Layer** encapsulates core business logic and manages transactional integrity with `@Transactional`.*
> 3. *The **Data Layer** uses Spring Data JPA with PostgreSQL to perform type-safe database queries.*
> 4. *Cross-cutting concerns like JWT authorization are handled via a custom `OncePerRequestFilter`, and exceptions are handled globally with `@RestControllerAdvice`."*

---

## 32. High-Yield Topics Beyond the Playlist

Candidates are frequently evaluated on the following 7 production-critical topics in SDE / Backend interviews:

---

### A. Spring Security & Stateless JWT Authentication

> 💡 **Quick Revision Anchor (2-3 Words)**: `Stateless Token Security`

In modern microservices and REST APIs, stateful HTTP sessions are replaced with **stateless JSON Web Tokens (JWT)**.

```mermaid
sequenceDiagram
    autonumber
    actor Client as User / Frontend
    participant Security as SecurityFilterChain
    participant AuthFilter as JwtAuthenticationFilter
    participant Controller as OrderController

    Client->>Security: HTTP POST /api/orders (Header: Bearer eyJhbGci...)
    Security->>AuthFilter: Intercepts request before reaching Controller
    Note over AuthFilter: 1. Extract Bearer Token<br/>2. Validate Signature & Expiration<br/>3. Extract Username & Roles<br/>4. Populate SecurityContextHolder
    AuthFilter->>Controller: Forward authenticated request
    Controller-->>Client: 200 OK (Orders List)
```

#### 1. How Spring Security Works:
- Incoming HTTP requests pass through a chain of filters called the **`SecurityFilterChain`**.
- A custom **`JwtAuthenticationFilter`** intercepts the request, validates the signature using an HMAC secret key, extracts user claims, and sets the authenticated principal in the **`SecurityContextHolder`**.

#### 2. Spring Security 6 / Spring Boot 3 Configuration:
```java
@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
            .csrf(csrf -> csrf.disable()) // Disabled for stateless APIs
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll() // Public login/register endpoints
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
            .build();
    }
}
```

---

### B. JPA Relationships (`@OneToMany`, `@ManyToOne`) & Cascade Rules

> 💡 **Quick Revision Anchor (2-3 Words)**: `Entity Mapping & Ownership`

Relational database foreign keys are represented in JPA using relationship annotations.

```mermaid
flowchart LR
    Customer["Customer (Parent Entity)
- id (Primary Key)
- name"]
    OrderEntity["CustomerOrder (Child Entity / Owner)
- id (Primary Key)
- customer_id (Foreign Key)
- total_amount"]

    Customer -- "1 to N (mappedBy = 'customer')" --> OrderEntity
    OrderEntity -- "N to 1 (@JoinColumn: customer_id)" --> Customer
```

#### 1. The `@ManyToOne` Side (Owner of the Relationship):
The table with the foreign key column is **always the owner of the relationship**. It uses `@JoinColumn`:
```java
@Entity
@Table(name = "orders")
public class Order {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false) // Foreign key in 'orders' table
    private Customer customer;
}
```

#### 2. The `@OneToMany` Side (Inverse Side):
Must declare **`mappedBy`** pointing to the field name in the child entity. If you forget `mappedBy`, JPA will create an unwanted third join table!
```java
@Entity
@Table(name = "customers")
public class Customer {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToMany(mappedBy = "customer", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Order> orders = new ArrayList<>();
}
```

- **`CascadeType.ALL`**: Operations (persist, remove, merge) performed on `Customer` automatically cascade to its `orders`.
- **`orphanRemoval = true`**: If an order is removed from the `orders` list, JPA deletes the corresponding row from the database table.

---

### C. Fetch Types: LAZY vs. EAGER & The N+1 Query Problem

> 💡 **Quick Revision Anchor (2-3 Words)**: `Solve With Join-Fetch`

### Default Fetch Types in JPA:
- **`@ManyToOne` / `@OneToOne`**: Defaults to **`EAGER`** (Loads associated entity immediately).  
  *Best Practice*: Always change this to `FetchType.LAZY`!
- **`@OneToMany` / `@ManyToMany`**: Defaults to **`LAZY`** (Loads associated collection on demand).

### What is the N+1 Query Problem?
Suppose you fetch 10 Customers, and for each Customer, Hibernate executes an extra query to load their Orders:
- 1 Query to fetch 10 customers: `SELECT * FROM customers;`
- N Queries (10 queries) to fetch orders for each customer: `SELECT * FROM orders WHERE customer_id = ?;`
- **Total: 1 + 10 = 11 queries instead of 1 single query!**

```mermaid
flowchart TD
    Q1["Query 1: SELECT * FROM customers (Returns 100 rows)"]
    Q1 --> Q2["Query 2: SELECT * FROM orders WHERE customer_id = 1"]
    Q1 --> Q3["Query 3: SELECT * FROM orders WHERE customer_id = 2"]
    Q1 --> QN["Query N: SELECT * FROM orders WHERE customer_id = 100"]
    QN --> Disaster["Result: 101 database queries executed! Slows down production."]
```

### The Solution: `JOIN FETCH`
Use a `JOIN FETCH` query in your repository to retrieve both parent and children in a single SQL join:
```java
public interface CustomerRepository extends JpaRepository<Customer, Long> {
    // Solves N+1 Problem: Executes 1 single SQL JOIN query!
    @Query("SELECT c FROM Customer c JOIN FETCH c.orders")
    List<Customer> findAllWithOrders();
}
```

---

### D. REST API Design & HTTP Idempotency

> 💡 **Quick Revision Anchor (2-3 Words)**: `Standard Verbs & Statuses`

### HTTP Verb Characteristics:

| HTTP Verb | CRUD Action | Is Safe? (Does not alter state) | Is Idempotent? (Multiple identical requests = same result) |
|---|---|---|---|
| **GET** | Read | ✅ Yes | ✅ Yes |
| **POST** | Create | ❌ No | ❌ **No** (Calling POST 5 times creates 5 records) |
| **PUT** | Replace / Overwrite | ❌ No | ✅ Yes (Overwriting with the same data 5 times yields same state) |
| **PATCH** | Partial Update | ❌ No | ❌ No (Can be non-idempotent depending on operation) |
| **DELETE** | Remove | ❌ No | ✅ Yes (Deleting resource ID 5 multiple times leaves it deleted) |

### Standard HTTP Status Codes:
- **`200 OK`**: Request succeeded with body.
- **`201 Created`**: Resource created successfully (`POST`).
- **`204 No Content`**: Succeeded, but no response body (`DELETE`).
- **`400 Bad Request`**: Malformed syntax or validation failure.
- **`401 Unauthorized`**: Authentication missing or token invalid.
- **`403 Forbidden`**: Authenticated, but user lacks permissions (Role check failed).
- **`404 Not Found`**: Resource does not exist.
- **`409 Conflict`**: State conflict (e.g. duplicate email registration).
- **`500 Internal Server Error`**: Unhandled exception in server code.

---

### E. SQL & DBMS Essentials for Java Backend Interviews

> 💡 **Quick Revision Anchor (2-3 Words)**: `Joins, Indexing, ACID`

Spring Boot developers are evaluated directly on database fundamentals:

```mermaid
flowchart LR
    A["Table A (Users)"]
    B["Table B (Orders)"]

    A -->|INNER JOIN: Rows matching in both| IJ["Matching Rows"]
    A -->|LEFT JOIN: All rows from A + matches from B| LJ["All Users + Orders (if any)"]
```

1. **INNER JOIN vs. LEFT JOIN**:
   - `INNER JOIN`: Returns records that have matching values in both tables.
   - `LEFT JOIN`: Returns all records from the left table, and matched records from the right table (NULL if no match).
2. **`WHERE` vs. `HAVING`**:
   - `WHERE` filters individual rows **before** aggregation.
   - `HAVING` filters aggregated groups **after** `GROUP BY`.
3. **Database Indexing**:
   - Speeds up `SELECT` queries by maintaining an ordered **B-Tree** pointer index.
   - *Trade-off*: Slows down `INSERT`, `UPDATE`, and `DELETE` operations because the database must update index trees on every write.
4. **ACID Properties**:
   - **Atomicity**: All operations succeed, or all rollback.
   - **Consistency**: Database transitions from one valid state to another.
   - **Isolation**: Concurrent transactions do not interfere with one another.
   - **Durability**: Committed data is never lost, even across hardware power outages.

---

### F. Automated Testing with JUnit 5 & Mockito

> 💡 **Quick Revision Anchor (2-3 Words)**: `Unit Mocking vs Integration`

```mermaid
flowchart TD
    subgraph UnitTest ["Unit Test (@ExtendWith(MockitoExtension.class))"]
        UT["Fast, in-memory test. Mocks Repository; tests isolated Service logic."]
    end

    subgraph IntegrationTest ["Integration Test (@SpringBootTest + MockMvc)"]
        IT["Loads Spring Context, verifies HTTP Routing, Security, and Database."]
    end
```

### 1. Unit Test with Mockito:
```java
@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserService userService;

    @Test
    void shouldReturnUserWhenIdExists() {
        User mockUser = new User(1L, "Alice");
        when(userRepository.findById(1L)).thenReturn(Optional.of(mockUser));

        User result = userService.getUser(1L);

        assertNotNull(result);
        assertEquals("Alice", result.getName());
        verify(userRepository, times(1)).findById(1L);
    }
}
```

### 2. Controller Integration Test with `MockMvc`:
```java
@WebMvcTest(UserController.class)
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private UserService userService;

    @Test
    void shouldReturn200Ok() throws Exception {
        when(userService.getUser(1L)).thenReturn(new User(1L, "Alice"));

        mockMvc.perform(get("/api/users/1"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.name").value("Alice"));
    }
}
```

---

### G. Maven Build Lifecycle & Dependency Scopes

> 💡 **Quick Revision Anchor (2-3 Words)**: `Build Lifecycle Phases`

```mermaid
flowchart LR
    Clean["mvn clean\n(Deletes target/ folder)"]
    Compile["compile\n(Compiles src/ to .class)"]
    Test["test\n(Executes JUnit tests)"]
    Package["package\n(Packs into executable JAR)"]
    Install["install\n(Copies JAR to local ~/.m2)"]

    Compile --> Test --> Package --> Install
```

### Maven Dependency Scopes:
- **`compile`** *(Default)*: Dependency is available during compilation, testing, and runtime. Bundled into final JAR.
- **`provided`**: Required for compilation, but provided at runtime by the container/JDK (e.g., `lombok`).
- **`runtime`**: Not needed for compilation, but required for runtime execution (e.g., database drivers like `postgresql`).
- **`test`**: Only used for compiling and executing tests (e.g., `spring-boot-starter-test`, Mockito). Never included in the production JAR.

---

## 33. 1-Page Master Revision Cheat Sheet

```
==================================================================================================
                            SPRING BOOT MASTER INTERVIEW CHEAT SHEET
==================================================================================================

1. CORE INVERSION OF CONTROL (IoC) & DI:
   - IoC: Spring manages object creation, configuration, and destruction.
   - DI: Spring injects required objects into classes. Prefer Constructor Injection for immutability.

2. STEREOTYPES:
   - @RestController = @Controller + @ResponseBody (Writes JSON directly to response).
   - @Service        = Business logic boundary.
   - @Repository     = Database DAO; automatically translates SQL exceptions to DataAccessException.
   - @Component      = Generic Spring-managed bean.

3. SPRING BOOT MAGIC:
   - @SpringBootApplication = @Configuration + @EnableAutoConfiguration + @ComponentScan.
   - Starters = Curated POM dependency aggregators.
   - Actuator = Production health & metrics (/actuator/health).

4. TRANSACTION MANAGEMENT:
   - @Transactional: Opens proxy, starts DB transaction, commits on success, rollbacks on RuntimeException.
   - REQUIRED (Default): Join existing transaction or create new one.
   - REQUIRES_NEW: Suspend existing transaction and always start an independent new one.

5. DATABASE & PERSISTENCE:
   - Hierarchy: JDBC (Raw SQL API) -> JPA (Specification) -> Hibernate (ORM Engine) -> Spring Data JPA.
   - N+1 Query Bug: 1 query for parent + N queries for children. Solved using `JOIN FETCH`.
   - Relationships: Child table with FK is the owner; parent table must declare `mappedBy`.

6. MVC FLOW & HTTP:
   - Client -> Servlet Filter -> DispatcherServlet (Front Controller) -> Interceptor -> @RestController.
   - @PathVariable = /users/{id} (Part of URI resource).
   - @RequestParam = /users?page=1 (Query parameters).
   - ResponseEntity<T> = Complete HTTP control (status, headers, body).

7. SECURITY & ERROR HANDLING:
   - JWT: Stateless token authentication verified by a custom OncePerRequestFilter before Controller.
   - @RestControllerAdvice + @ExceptionHandler: Centralized application exception interception.
==================================================================================================
```
