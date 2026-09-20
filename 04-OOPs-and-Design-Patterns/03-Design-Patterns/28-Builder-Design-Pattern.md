# 28. Builder Design Pattern

> 💡 **Quick Revision Anchor**: The **Builder Pattern** is a **creational design pattern** that separates the construction of a complex object from its representation. It eliminates the **Telescoping Constructor Anti-Pattern** and the **Mutable JavaBean Setter Anti-Pattern**, enabling step-by-step construction of immutable objects with validation at `build()` time.

---

## 1. Context & Two Anti-Patterns Solved

Consider creating an enterprise `HttpRequest` object which possesses:
- **Mandatory parameters**: `url`, `method` (GET, POST, etc.).
- **Many optional parameters**: `headers`, `queryParams`, `body`, `timeoutMs`, `followRedirects`.

### Anti-Pattern 1: Telescoping Constructors
```java
// PROBLEM: Monolithic constructor overloading
public HttpRequest(String url, String method) { ... }
public HttpRequest(String url, String method, Map<String, String> headers) { ... }
public HttpRequest(String url, String method, Map<String, String> headers, String body) { ... }
public HttpRequest(String url, String method, Map<String, String> headers, String body, int timeout, boolean redirect) { ... }

// Client code becomes unreadable and dangerous:
HttpRequest req = new HttpRequest("https://api.com", "POST", null, "{...}", 5000, true);
```
- **Drawbacks**: Hard to read, confusing parameter order (easy to swap two integers or strings), forces callers to pass `null` for unused parameters.

### Anti-Pattern 2: JavaBeans Mutability (Empty Constructor + Setters)
```java
HttpRequest req = new HttpRequest();
req.setUrl("https://api.com");
req.setMethod("GET");
// Object is in an incomplete, partially-initialized state here!
req.setTimeout(5000);
```
- **Drawbacks**: The object is temporarily in an invalid state during construction; fields cannot be declared `final`, making the object **mutable** and prone to multi-threaded race conditions.

---

## 2. The Builder Pattern Architecture

```mermaid
classDiagram
    class HttpRequest {
        -String url
        -String method
        -Map~String, String~ headers
        -Map~String, String~ queryParams
        -String body
        -int timeoutMs
        -boolean followRedirects
        -HttpRequest(Builder builder)
        +getUrl() String
        +getMethod() String
    }

    class Builder {
        -String url
        -String method
        -Map~String, String~ headers
        -Map~String, String~ queryParams
        -String body
        -int timeoutMs
        -boolean followRedirects
        +Builder(String url, String method)
        +addHeader(String key, String val) Builder
        +addQueryParam(String key, String val) Builder
        +setBody(String body) Builder
        +setTimeout(int timeoutMs) Builder
        +setFollowRedirects(boolean follow) Builder
        +build() HttpRequest
    }

    HttpRequest +-- Builder : Static Nested Class
    HttpRequest <-- Builder : Constructs & Validates
```

### Key Properties of Effective Builders:
1. **Static Nested Class**: The `Builder` is placed directly inside the target class (`HttpRequest.Builder`).
2. **Private Outer Constructor**: Only the `Builder.build()` method can instantiate `HttpRequest`.
3. **Immutability**: All fields in `HttpRequest` are `private final`. No setters are exposed.
4. **Fluent API (Method Chaining)**: Every configuration method returns `this` (`return this;`).
5. **Fail-Fast Validation**: Complex validations (e.g., checking that POST requests have a body, timeouts are non-negative) are evaluated inside `build()` before the instance is instantiated.

---

## 3. Production Java Implementation: HTTP Request Builder

```java
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

public class HttpRequest {
    // All fields are immutable (final)
    private final String url;
    private final String method;
    private final Map<String, String> headers;
    private final Map<String, String> queryParams;
    private final String body;
    private final int timeoutMs;
    private final boolean followRedirects;

    // Private constructor: can only be invoked by Builder
    private HttpRequest(Builder builder) {
        this.url = builder.url;
        this.method = builder.method;
        this.headers = Collections.unmodifiableMap(new HashMap<>(builder.headers));
        this.queryParams = Collections.unmodifiableMap(new HashMap<>(builder.queryParams));
        this.body = builder.body;
        this.timeoutMs = builder.timeoutMs;
        this.followRedirects = builder.followRedirects;
    }

    // Getters only (No Setters -> Truly Immutable)
    public String getUrl() { return url; }
    public String getMethod() { return method; }
    public Map<String, String> getHeaders() { return headers; }
    public Map<String, String> getQueryParams() { return queryParams; }
    public String getBody() { return body; }
    public int getTimeoutMs() { return timeoutMs; }
    public boolean isFollowRedirects() { return followRedirects; }

    @Override
    public String toString() {
        return "HttpRequest [Method=" + method + ", URL=" + url + 
               ", Headers=" + headers + ", Timeout=" + timeoutMs + "ms]";
    }

    // Static Nested Builder Class
    public static class Builder {
        // Mandatory fields
        private final String url;
        private final String method;

        // Optional fields with sensible defaults
        private final Map<String, String> headers = new HashMap<>();
        private final Map<String, String> queryParams = new HashMap<>();
        private String body = "";
        private int timeoutMs = 3000; // Default 3s
        private boolean followRedirects = true;

        // Constructor requires mandatory fields
        public Builder(String url, String method) {
            if (url == null || url.trim().isEmpty()) {
                throw new IllegalArgumentException("URL cannot be null or empty.");
            }
            if (method == null || method.trim().isEmpty()) {
                throw new IllegalArgumentException("HTTP Method cannot be null or empty.");
            }
            this.url = url;
            this.method = method.toUpperCase();
        }

        public Builder addHeader(String key, String value) {
            this.headers.put(key, value);
            return this; // Fluent method chaining
        }

        public Builder addQueryParam(String key, String value) {
            this.queryParams.put(key, value);
            return this;
        }

        public Builder setBody(String body) {
            this.body = body;
            return this;
        }

        public Builder setTimeout(int timeoutMs) {
            if (timeoutMs < 0) {
                throw new IllegalArgumentException("Timeout cannot be negative.");
            }
            this.timeoutMs = timeoutMs;
            return this;
        }

        public Builder setFollowRedirects(boolean followRedirects) {
            this.followRedirects = followRedirects;
            return this;
        }

        // Build method validates invariants and returns the immutable product
        public HttpRequest build() {
            // Validation invariants
            if ("POST".equals(method) || "PUT".equals(method)) {
                if (body == null || body.trim().isEmpty()) {
                    System.out.println("[Warning] " + method + " request created with empty payload body.");
                }
            }
            return new HttpRequest(this);
        }
    }
}
```

---

## 4. Test Driver & Verification

```java
public class Main {
    public static void main(String[] args) {
        // Example 1: Simple GET request with minimal configuration
        HttpRequest getRequest = new HttpRequest.Builder("https://api.github.com/users", "GET")
                .addQueryParam("page", "1")
                .setTimeout(2000)
                .build();

        System.out.println("GET Request created: " + getRequest);

        // Example 2: Complex POST request with headers and payload
        HttpRequest postRequest = new HttpRequest.Builder("https://api.stripe.com/v1/charges", "POST")
                .addHeader("Authorization", "Bearer sk_test_secretKey123")
                .addHeader("Content-Type", "application/json")
                .setBody("{\"amount\": 2500, \"currency\": \"usd\"}")
                .setTimeout(10000)
                .setFollowRedirects(false)
                .build();

        System.out.println("\nPOST Request created: " + postRequest);
        System.out.println("Payload body: " + postRequest.getBody());
        System.out.println("Follow redirects: " + postRequest.isFollowRedirects());
    }
}
```

---

## 5. Classic GoF Builder: The "Director" Concept

In classic Gang of Four literature, an optional **Director** class coordinates pre-assembled standard object templates:

```java
public class HttpRequestDirector {
    public static HttpRequest createDefaultJsonPostRequest(String url, String jsonBody) {
        return new HttpRequest.Builder(url, "POST")
                .addHeader("Content-Type", "application/json")
                .addHeader("Accept", "application/json")
                .setBody(jsonBody)
                .setTimeout(5000)
                .build();
    }
}
```

---

## 6. Real-World Applications & Interview Checklist

1. **Standard Library & Frameworks**:
   - `java.lang.StringBuilder` / `StringBuffer`.
   - `java.net.http.HttpRequest.newBuilder().uri(...).GET().build()`.
   - **Lombok `@Builder`**: Automatically generates this exact nested static builder boilerplate at compile time.
   - **Spring**: `UriComponentsBuilder`, `SecurityFilterChainBuilder`.
2. **Interview Distinction: Factory vs. Builder**:
   - **Factory**: Focuses on **what** family/subtype of object is instantiated in a single step (`createCar()`).
   - **Builder**: Focuses on **how** a complex multi-attribute object is assembled step-by-step.
