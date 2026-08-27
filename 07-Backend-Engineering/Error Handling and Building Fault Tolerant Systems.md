# Error Handling and Building Fault Tolerant Systems

no: 3
source: https://www.youtube.com/watch?v=8NaM_9aKS24

# Backend Error Handling & Fault Tolerance

> **Goal:** Errors are inevitable in backend systems. A good backend engineer designs systems that **detect, handle, recover from, and prevent** errors from affecting users.
> 

---

# 🎯 Core Mindset

> **The question is not *if* errors will happen, but *how* your system will handle them.**
> 

Backend systems should be:

- Fault tolerant
- Resilient
- Observable
- Recoverable

Common failures include:

- Database query failures
- External API timeouts
- Invalid user input
- Business logic bugs
- Infrastructure failures

---

# 🚨 Types of Backend Errors

## **1. Logic Errors**

**Definition**

The application runs successfully but produces incorrect results.

### Examples

- Discount applied twice
- Wrong tax calculation
- Incorrect payment amount
- Duplicate rewards issued

### Causes

- Misunderstood requirements
- Incorrect algorithm implementation
- Missing edge cases

### Why They're Dangerous

- No application crash
- Hard to detect
- Can silently cause financial loss or corrupt business data

### Prevention

- Requirement clarification
- Unit tests
- Integration tests
- Edge case testing
- Code reviews

---

## 2. Database Errors

Most backend applications rely heavily on databases.

If the database fails, the application usually cannot function correctly.

---

### A. Connection Errors

Occurs when the backend cannot communicate with the database.

### Causes

- Database server down
- Network failure
- Connection pool exhausted

### Result

- HTTP 500 errors
- Empty frontend responses
- Complete application outage

---

### B. Constraint Violations

Occurs when database rules are violated.

#### Unique Constraint

Example

```
User with email already exists.
```

Database rejects duplicate email.

#### Foreign Key Constraint

Example

```
Orders table references Customer ID 15

Customer ID 15 doesn't exist.
```

Database rejects insertion.

### Prevention

- Validate user input
- Handle database exceptions gracefully
- Return meaningful error messages

Example

```
❌ Internal Server Error

✅ Email already exists.
```

---

### C. Query Errors

Occurs due to malformed SQL.

Example

```
SELECT * FROM custmers;
```

instead of

```
SELECT * FROM customers;
```

Other causes

- Missing table
- Invalid syntax
- Query timeout

---

### D. Deadlocks

Occurs when multiple transactions wait on each other.

```
Transaction A waits for B

↓

Transaction B waits for A

↓

Neither proceeds
```

---

# 3. External Service Errors

Modern backend systems depend on external services.

Examples

- Payment gateways
- Email providers
- Authentication providers
- AI APIs
- Cloud storage

Every dependency introduces another possible point of failure.

---

## Common Causes

### Network Failures

- Timeout
- DNS failure
- Network partition

---

### Authentication Errors

- Expired tokens
- Invalid credentials
- Missing permissions

---

### Rate Limiting

External APIs may return

```
429 Too Many Requests
```

### Solution

Use **Exponential Backoff**

```
Retry

↓

Wait 1 min

↓

Retry

↓

Wait 2 min

↓

Retry

↓

Wait 4 min

↓

Continue until success
```

---

### Service Outages

Cloud providers can go down.

Use:

- Fallback services
- Cached responses
- Backup infrastructure
- Graceful degradation

---

# 4. Input Validation Errors

Caused by invalid user input.

Validation is the first line of defense.

---

## Types

### Format Validation

Examples

- Email format
- Phone number
- Date format

---

### Range Validation

Examples

```
Age

18–100

Price

>0

Array Size

1–100
```

---

### Required Field Validation

Example

```
POST /users

Missing email
```

Return

```
400 Bad Request
```

---

# 5. Configuration Errors

Usually happen during deployment.

Example

```
Developer adds

OPENAI_API_KEY

↓

Works locally

↓

Forgot in Production

↓

Runtime failure
```

### Best Practice

Validate configuration before server startup.

Fail immediately if required configuration is missing.

Better:

```
Application won't start.
```

than

```
Users receive runtime 500 errors.
```

---

# 🛡 Error Prevention

## Best Principle

> **The best error handling starts before errors happen.**
> 

---

# ❤️ Health Checks

Expose endpoint

```
/health
```

Returns

```
200 OK
```

when healthy.

---

## Health Checks Should Verify

- Server running
- Database connectivity
- Query execution
- Cache availability
- External services
- Required configuration

---

# 📊 Monitoring & Observability

Monitoring should cover

- HTTP errors
- Database failures
- External API failures
- Business logic failures

---

## Performance Metrics

Monitor

- Response time
- CPU usage
- Memory usage
- Throughput

Performance degradation often appears before failures.

---

## Business Metrics

Examples

- Successful payments
- Successful logins
- Successful transactions

A sudden drop usually indicates hidden technical issues.

---

# 📝 Logging

Good logs should be

- Structured
- Searchable
- Context-rich

Preferred format

```
{
  "timestamp":"...",
  "level":"ERROR",
  "requestId":"...",
  "userId":"...",
  "message":"Database connection failed"
}
```

Prefer JSON logs over plain text.

---

# 🔄 Error Recovery

Recovery depends on whether the error is temporary or permanent.

---

## Recoverable Errors

Examples

- Network timeout
- Email failure
- Connection pool exhaustion

Strategies

- Retry
- Exponential Backoff

---

## Non-Recoverable Errors

Examples

- Invalid configuration
- Corrupt database

Strategies

- Disable affected features
- Switch to cached data
- Use backup services
- Graceful degradation

---

# 💾 Data Recovery

Data is the most valuable asset.

Protect it using

- Backups
- Transaction logs
- Restore procedures
- Recovery tools

---

# ⬆ Error Propagation

Errors should move upward with more context.

```
Repository

↓

Service

↓

Handler

↓

Global Error Handler
```

Each layer adds business context.

---

# 🌐 Global Error Handling

Centralize all error handling in one middleware.

Typical architecture

```
Client

↓

Router

↓

Handler

↓

Service

↓

Repository

↓

Database

↓

Error

↓

Global Error Handler

↓

HTTP Response
```

---

## Example Responses

### Validation Error

```
400 Bad Request

Book name cannot exceed 500 characters.
```

---

### Unique Constraint

```
400 Bad Request

Book already exists.
```

---

### Resource Not Found

```
404 Not Found

Book not found.
```

---

### Foreign Key Violation

```
404 Not Found

Author not found.
```

---

### Unexpected Error

```
500 Internal Server Error

Something went wrong.
```

---

# ✅ Benefits of Global Error Handling

- Consistent API responses
- Less duplicate code
- Easier maintenance
- Centralized logging
- Better security
- Easier debugging

---

# 🔒 Security Best Practices

## Never expose

- Table names
- SQL queries
- Stack traces
- Constraint names
- Internal exceptions

Wrong

```
duplicate key violates unique constraint books_name_key
```

Correct

```
Book already exists.
```

---

# 🔑 Authentication Errors

Never reveal whether

- Email exists
- Password is incorrect

Wrong

```
User does not exist.
```

or

```
Password incorrect.
```

Correct

```
Invalid email or password.
```

This prevents **user enumeration attacks**.

---

# 🔐 Secure Logging

Never log

- Passwords
- Credit card numbers
- JWT tokens
- API keys
- Secrets

Prefer

- User ID
- Request ID
- Correlation ID

---

# ⭐ Best Practices Checklist

- ✅ Assume failures will happen.
- ✅ Validate input at the entry point.
- ✅ Handle database exceptions gracefully.
- ✅ Centralize error handling with global middleware.
- ✅ Use proper HTTP status codes.
- ✅ Retry transient failures with exponential backoff.
- ✅ Implement health checks.
- ✅ Monitor infrastructure, application, and business metrics.
- ✅ Use structured (JSON) logging.
- ✅ Fail fast on missing configuration.
- ✅ Never expose internal implementation details.
- ✅ Never log sensitive information.
- ✅ Design systems to degrade gracefully instead of crashing.

---

# 📌 Summary

A robust backend system is not one that never fails—it is one that **fails predictably, recovers gracefully, protects user data, and provides meaningful feedback**. Effective error handling combines **validation, monitoring, centralized error management, retries, recovery strategies, and security best practices** to build reliable and fault-tolerant applications.