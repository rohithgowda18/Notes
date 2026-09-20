# 28. Builder Design Pattern

> 💡 **Quick Revision Anchor**
> - **Type:** Creational Design Pattern
> - **Core Principle:** Separates the construction of a complex object from its representation, allowing the same construction process to create various representations.
> - **Primary Problems Solved:**
>   1. **Telescoping Constructor Anti-Pattern:** Massive constructors with confusing boolean/null arguments (`new Request("url", "GET", null, null, true, 5000)`).
>   2. **JavaBeans / Setter Mutation Flaw:** Inconsistent state during construction and loss of object immutability.
> - **Key Flavors:**
>   - **Fluent Builder:** Uses method chaining (`return this;`) and an immutable target with a private constructor.
>   - **Builder with Director:** Pre-packaged recipes/templates for common object configurations.
>   - **Step Builder:** Uses sequential interfaces to enforce mandatory steps at **compile-time**.

---

## 1. Problem: Creating Complex Objects

Consider building an **HTTP Request** object. An HTTP request consists of numerous fields:
- **Mandatory:** URL, HTTP Method (GET, POST, etc.).
- **Optional:** Headers (Map), Query Parameters (Map), Request Body (JSON/text), Timeout (ms), Retries, Cache-Control.

```
                           HTTPRequest
  ┌────────────┬─────────────┬───────────┬─────────────┬───────────┐
  │    URL     │   Method    │  Headers  │ RequestBody │  Timeout  │
  │(Mandatory) │ (Mandatory) │(Optional) │ (Optional)  │(Optional) │
  └────────────┴─────────────┴───────────┴─────────────┴───────────┘
```

### Approach 1: Telescoping Constructors (Anti-Pattern)
```java
// ❌ Telescoping Constructors
public class HttpRequest {
    public HttpRequest(String url, String method) { ... }
    public HttpRequest(String url, String method, Map<String, String> headers) { ... }
    public HttpRequest(String url, String method, Map<String, String> headers, String body) { ... }
    public HttpRequest(String url, String method, Map<String, String> headers, String body, int timeout) { ... }
}
```
**Why it fails:**
- Calling code is unreadable: `new HttpRequest("https://api.com", "GET", null, null, 5000);`
- Prone to silent parameter-swapping bugs (e.g., passing `timeout` into `retryCount`).
- Creating $N$ constructors for every possible subset of optional fields causes constructor explosion.

### Approach 2: JavaBeans Pattern (No-Arg Constructor + Setters)
```java
// ❌ JavaBeans Mutation
HttpRequest req = new HttpRequest();
req.setUrl("https://api.com");
// What if a thread accesses 'req' right here before method is set? Inconsistent state!
req.setMethod("POST");
req.setTimeout(5000);
```
**Why it fails:**
- The object is **mutable** and exists in a partially initialized, inconsistent state during construction.
- Fails thread-safety; impossible to make `HttpRequest` an immutable Value Object.

---

## 2. Core Solution: The Fluent Builder

The **Builder Pattern** extracts the construction logic into a dedicated companion class (`HttpRequestBuilder`):
1. The target class (`HttpRequest`) has a `private` constructor and exposes only getters (immutable).
2. The Builder maintains temporary copies of the fields.
3. Every builder setter returns `this`, enabling fluent method chaining.
4. The `.build()` method validates required fields and instantiates the immutable target.

```
Client ──▶ new Builder()
              .withUrl("https://api.com")
              .withMethod("POST")
              .withBody("{\"data\": 1}")
              .build() ─────────────────────▶ Immutable HttpRequest
```

---

## 3. Architecture & Class Diagram

```mermaid
classDiagram
    class HttpRequest {
        -String url
        -String method
        -Map~String, String~ headers
        -String body
        -int timeout
        -HttpRequest(Builder builder)
        +getUrl() String
        +getMethod() String
        +getHeaders() Map
        +getBody() String
        +getTimeout() int
        +execute() void
    }

    class Builder {
        -String url
        -String method
        -Map~String, String~ headers
        -String body
        -int timeout
        +withUrl(String url) Builder
        +withMethod(String method) Builder
        +addHeader(String key, String value) Builder
        +withBody(String body) Builder
        +withTimeout(int timeout) Builder
        +build() HttpRequest
    }

    class HttpRequestDirector {
        +createSimpleGet(Builder b, String url) HttpRequest
        +createJsonPost(Builder b, String url, String json) HttpRequest
    }

    HttpRequest +-- Builder : static inner class
    HttpRequestDirector --> Builder : directs configuration
```

---

## 4. Java Implementation: Classic Fluent Builder

### Step 1: Target Class with Static Inner Builder
```java
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

public class HttpRequest {
    private final String url;
    private final String method;
    private final Map<String, String> headers;
    private final String body;
    private final int timeout;

    // Private constructor: can ONLY be called by Builder
    private HttpRequest(Builder builder) {
        this.url = builder.url;
        this.method = builder.method;
        this.headers = Collections.unmodifiableMap(new HashMap<>(builder.headers));
        this.body = builder.body;
        this.timeout = builder.timeout;
    }

    public void execute() {
        System.out.println("Executing [" + method + "] to " + url);
        System.out.println("  Headers: " + headers);
        if (body != null) System.out.println("  Body: " + body);
        System.out.println("  Timeout: " + timeout + " ms\n");
    }

    // Static Inner Builder
    public static class Builder {
        private String url;
        private String method = "GET"; // Default value
        private final Map<String, String> headers = new HashMap<>();
        private String body;
        private int timeout = 30000;   // Default 30s

        public Builder withUrl(String url) {
            this.url = url;
            return this; // Enables chaining
        }

        public Builder withMethod(String method) {
            this.method = method;
            return this;
        }

        public Builder addHeader(String key, String value) {
            this.headers.put(key, value);
            return this;
        }

        public Builder withBody(String body) {
            this.body = body;
            return this;
        }

        public Builder withTimeout(int timeout) {
            this.timeout = timeout;
            return this;
        }

        public HttpRequest build() {
            // Validation at build time
            if (url == null || url.trim().isEmpty()) {
                throw new IllegalStateException("URL is mandatory for HttpRequest.");
            }
            if (method == null || method.trim().isEmpty()) {
                throw new IllegalStateException("HTTP Method is mandatory.");
            }
            return new HttpRequest(this);
        }
    }
}
```

---

## 5. The Director Concept (GoF Classic)

When application code frequently produces standardized object presets, a **Director** class encapsulates the assembly steps:

```java
public class HttpRequestDirector {
    public HttpRequest createSimpleGet(String url) {
        return new HttpRequest.Builder()
                .withUrl(url)
                .withMethod("GET")
                .addHeader("Accept", "application/json")
                .withTimeout(5000)
                .build();
    }

    public HttpRequest createJsonPost(String url, String jsonBody) {
        return new HttpRequest.Builder()
                .withUrl(url)
                .withMethod("POST")
                .addHeader("Content-Type", "application/json")
                .addHeader("Accept", "application/json")
                .withBody(jsonBody)
                .withTimeout(10000)
                .build();
    }
}
```

---

## 6. Advanced Variation: Step Builder (Compile-Time Safety)

In a standard builder, missing a mandatory parameter (`withUrl()`) is only detected at runtime inside `build()`.
The **Step Builder Pattern** uses a chain of targeted interfaces so the compiler enforces mandatory parameters in an exact sequence:

```
new StepBuilder() ──▶ withUrl() ──▶ withMethod() ──▶ withHeader() / build()
```

```java
public class StepHttpRequest {
    // 1. Mandatory Step 1
    public interface UrlStep {
        MethodStep withUrl(String url);
    }

    // 2. Mandatory Step 2
    public interface MethodStep {
        OptionalStep withMethod(String method);
    }

    // 3. Optional Step (where build() finally becomes accessible)
    public interface OptionalStep {
        OptionalStep withHeader(String key, String value);
        OptionalStep withBody(String body);
        StepHttpRequest build();
    }

    private String url;
    private String method;

    public static UrlStep getBuilder() {
        return new InnerStepBuilder();
    }

    private static class InnerStepBuilder implements UrlStep, MethodStep, OptionalStep {
        private String url;
        private String method;

        @Override
        public MethodStep withUrl(String url) {
            this.url = url;
            return this; // Transitions to MethodStep
        }

        @Override
        public OptionalStep withMethod(String method) {
            this.method = method;
            return this; // Transitions to OptionalStep
        }

        @Override
        public OptionalStep withHeader(String key, String value) { return this; }

        @Override
        public OptionalStep withBody(String body) { return this; }

        @Override
        public StepHttpRequest build() {
            StepHttpRequest req = new StepHttpRequest();
            req.url = this.url;
            req.method = this.method;
            return req;
        }
    }
}
```

> 💡 **Step Builder Benefit:** The client compiler will literally refuse to compile `.build()` until `.withUrl(...)` and `.withMethod(...)` have been typed!

---

## 7. Client Demonstration

```java
public class Main {
    public static void main(String[] args) {
        // 1. Fluent Builder Usage
        HttpRequest customRequest = new HttpRequest.Builder()
                .withUrl("https://api.github.com/users/octocat")
                .withMethod("POST")
                .addHeader("Authorization", "Bearer token_xyz")
                .addHeader("Content-Type", "application/json")
                .withBody("{\"bio\": \"Updated via builder\"}")
                .withTimeout(15000)
                .build();

        customRequest.execute();

        // 2. Director Usage for Predefined Templates
        HttpRequestDirector director = new HttpRequestDirector();
        HttpRequest getRequest = director.createSimpleGet("https://api.stripe.com/v1/charges");
        getRequest.execute();

        // 3. Step Builder Usage
        StepHttpRequest stepReq = StepHttpRequest.getBuilder()
                .withUrl("https://api.openai.com/v1/models") // Step 1: Mandatory
                .withMethod("GET")                          // Step 2: Mandatory
                .withHeader("Authorization", "Bearer sk_123") // Step 3: Optional
                .build();
    }
}
```

### Execution Output:
```text
Executing [POST] to https://api.github.com/users/octocat
  Headers: {Authorization=Bearer token_xyz, Content-Type=application/json}
  Body: {"bio": "Updated via builder"}
  Timeout: 15000 ms

Executing [GET] to https://api.stripe.com/v1/charges
  Headers: {Accept=application/json}
  Timeout: 5000 ms
```

---

## 8. Builder vs. Factory Pattern

| Dimension | Builder Pattern | Factory Method / Abstract Factory |
| :--- | :--- | :--- |
| **Primary Intent** | Assembles a **single complex object** step-by-step with many optional properties. | Creates **families or polymorphic types** of related objects in a single shot. |
| **Multi-Step Assembly** | Yes (`.withX().withY().build()`). | No (`factory.create(type)` in one step). |
| **Output Representation** | Can construct diverse configurations of the same product class. | Yields different concrete subclass implementations of an interface. |

---

## 9. Interview Perspective

- **Q: How does Builder ensure Immutability and Thread Safety?**
  *A: The target object has only `final` fields, no setters, and a `private` constructor. The Builder collects parameters in a mutable workspace, then passes them atomically to create an immutable object on `.build()`.*
- **Q: Where is Builder used in Java Standard Libraries & Popular Frameworks?**
  *A: `java.lang.StringBuilder`, `java.net.http.HttpRequest.newBuilder()`, `Stream.builder()`, and Lombok's `@Builder` annotation.*
- **Q: When should you avoid the Builder Pattern?**
  *A: When the domain object has fewer than 3-4 fields that are all mandatory. Using a builder for tiny classes adds needless boilerplate without real benefit.*

---

## 10. Quick Revision

```text
Problem: Telescoping constructors (too many args) & JavaBean mutation (inconsistent state).
Solution: Companion Builder with fluent method chaining (return this;), private target constructor.
Director: Encapsulates standard configuration presets.
Step Builder: Enforces mandatory fields in strict sequence at compile-time.
```
