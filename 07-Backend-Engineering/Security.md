# Security

no: 4
source: https://youtu.be/xB1C1xZZW4k

# 🔐 Backend Security — Engineer Notes

> **Goal:** Understand how attackers exploit backend applications and how to design defenses.
> 

---

## 1. 💉 Injection Attacks

Injection happens when **untrusted input is interpreted as code/commands**.

The general problem:

```
Attacker Input → Application → Interpreter
                              ↓
                       Unexpected behavior
```

Common examples:

- SQL Injection
- Command Injection
- NoSQL Injection
- Template Injection

### SQL Injection

SQL injection occurs when user input changes the meaning of a database query.

**Bad approach:**

```
"SELECT * FROM users WHERE name = '" + userInput + "'"
```

The input becomes part of the SQL syntax.

### Prevention

Use **parameterized queries / prepared statements**:

```
SQL structure → Query
User input   → Parameter
```

Other defenses:

- Use safe ORM/database APIs
- Avoid string concatenation
- Validate input where appropriate
- Use least-privilege DB accounts
- Don't expose database errors

> **Key idea:** Separate **data from instructions**.
> 

---

### Command Injection

Command injection happens when user input reaches an OS command.

```
User Input
    ↓
Application
    ↓
Shell / OS Command
    ↓
System
```

### Prevention

**Best option:** avoid shell commands when a library/API can do the job.

If commands are unavoidable:

- Avoid shell interpretation where possible
- Pass arguments separately
- Use strict allowlists
- Validate expected input
- Run with minimal OS privileges

> **Key idea:** Don't let arbitrary user input become part of a command.
> 

---

# 2. 🔑 Password Storage

Passwords should **never be stored directly**.

### ❌ Bad

```
password123
```

If the database is compromised, the password is immediately exposed.

### ❌ Also avoid

Using a fast general-purpose hash such as:

```
SHA-256(password)
```

Password hashing needs to be deliberately expensive.

---

## Hashing + Salt

A password should be processed using a password-hashing algorithm with a **unique salt**.

```
Password
   +
Unique Salt
   ↓
Argon2id
   ↓
Password Hash
```

### Why Salt?

Without unique salts:

```
password123 → same hash
password123 → same hash
```

With unique salts:

```
password123 + saltA → hashA
password123 + saltB → hashB
```

This prevents attackers from efficiently reusing precomputed hashes across accounts.

**Salt:**

- Should be unique
- Should be randomly generated
- Does not need to be secret
- Is normally stored with the password hash

---

## Argon2id

**Argon2id** is a modern password-hashing algorithm designed to make password guessing expensive.

Good password storage should be:

- Slow enough to resist guessing
- Fast enough for legitimate login
- Tunable as hardware improves
- Resistant to large-scale cracking

### Login Flow

```
User enters password
        ↓
Retrieve stored salt/config
        ↓
Hash entered password
        ↓
Compare with stored hash
        ↓
Login success/failure
```

> **Key idea:** Password storage should make offline password guessing expensive.
> 

---

# 3. 🔐 Authentication

Authentication answers:

> **Who are you?**
> 

Examples:

- Password
- Passkey
- OAuth/OIDC
- Session cookie
- JWT
- API key

### Common authentication attacks

- Brute force
- Credential stuffing
- Weak passwords
- Account enumeration
- Session theft
- Session fixation
- Weak password reset
- Token theft

### Defenses

- Strong password hashing
- Rate limiting
- Secure password-reset flows
- MFA/passkeys where appropriate
- Secure session management
- Short-lived credentials where appropriate

---

# 4. 🛡️ Authorization

Authorization answers:

> **What are you allowed to do?**
> 

This is different from authentication.

```
Authentication
"Who are you?"

        ↓

Authorization
"What can you access/do?"
```

Being logged in does **not** mean the user can access everything.

---

## BOLA / IDOR

**BOLA = Broken Object Level Authorization**

Example:

```
GET /api/orders/123
```

The attacker changes:

```
123 → 124
```

If order `124` belongs to another user and the server returns it, authorization is broken.

### Bad authorization check

```
Is the user logged in?
        ↓
YES → return order
```

### Better

```
Is the user logged in?
        ↓
Is this user allowed to access order 124?
        ↓
YES → return order
```

> **Always authorize the specific object.**
> 

---

## BFLA

**BFLA = Broken Function Level Authorization**

The user is authenticated but accesses a function they shouldn't.

Example:

```
Normal user
    ↓
/api/admin/delete-user
```

Being authenticated isn't enough.

Authorization should consider:

- User
- Role/permissions
- Resource
- Action
- Endpoint

---

# 5. 🍪 Session Management

After authentication, the application needs a way to remember the user.

Typical flow:

```
Login
  ↓
Authentication succeeds
  ↓
Session created
  ↓
Session ID stored in cookie
  ↓
Browser sends cookie with requests
```

---

## Cookie Security

### `Secure`

Cookie is only sent over HTTPS.

### `HttpOnly`

JavaScript cannot directly read the cookie.

This can reduce the impact of some XSS attacks.

### `SameSite`

Controls cross-site cookie sending and can help with CSRF protection.

---

## Session Threats

### Session Fixation

Attacker causes a victim to use a session identifier known to the attacker.

**Defense:** Regenerate the session ID after login/privilege changes.

### Session Theft

Attacker obtains a valid session token.

Possible causes:

- XSS
- Insecure transport
- Token leakage
- Malware
- Poor cookie configuration

### Session Expiration

Use appropriate:

- Idle timeouts
- Absolute session lifetimes
- Session revocation

> **Treat session IDs like passwords.**
> 

---

# 6. 🎫 JWT Security

JWTs are commonly used for stateless authentication.

A JWT generally looks like:

```
Header.Payload.Signature
```

### Important distinction

A JWT is **not automatically secure authentication**.

Security depends on how it is:

- Created
- Signed
- Validated
- Stored
- Expired
- Revoked
- Used

---

## JWT Validation

Depending on your architecture, validate:

- Signature
- Expected algorithm
- `exp` — expiration
- `iss` — issuer
- `aud` — audience

Protect signing keys carefully.

### Common mistakes

- Not verifying signatures
- Accepting unexpected algorithms
- Trusting claims without validation
- Tokens that live too long
- Poor signing-key management
- Putting unnecessary sensitive data in tokens
- Assuming JWT automatically supports revocation

> **JWT provides a token format; your application provides the security model.**
> 

---

# 7. 🚦 Rate Limiting

Rate limiting controls how frequently an operation can be performed.

Especially important for:

- Login
- Password reset
- OTP verification
- Account creation
- Expensive API endpoints
- Search/compute-heavy operations

### Why?

Without rate limiting:

```
Attacker
   ↓
10 requests
   ↓
1,000 requests
   ↓
1,000,000 requests
```

Possible attacks:

- Brute force
- Credential stuffing
- Enumeration
- Resource abuse
- Denial of service

---

## What Can You Limit By?

Depending on the endpoint:

```
IP
Account
API key
Session
Device
Endpoint
```

Often you need multiple dimensions.

### Distributed Applications

If you have:

```
Load Balancer
 ↓     ↓     ↓
App A App B App C
```

A counter stored only in App A's memory won't necessarily provide a global limit.

You may need shared/distributed rate-limiting state.

> **Key idea:** Rate limiting is both a security and availability control.
> 

---

# 8. 🖥️ Cross-Site Scripting (XSS)

XSS occurs when attacker-controlled content is interpreted as executable code in a user's browser.

```
Attacker Input
      ↓
Application
      ↓
HTML / JS Context
      ↓
Victim Browser
      ↓
Script executes
```

---

## Types

### Stored XSS

Malicious content is stored by the application.

Example:

```
Comment → Database → Other users
```

### Reflected XSS

Input is immediately reflected in the response.

### DOM XSS

Client-side JavaScript creates an unsafe DOM operation using attacker-controlled data.

---

## Prevention

- Context-aware output encoding
- Safe DOM APIs
- Avoid unsafe HTML construction
- Sanitize HTML when HTML is actually required
- Content Security Policy (CSP)
- Secure cookie configuration

> **Key idea:** The correct defense depends on the context where data is used.
> 

---

# 9. 🛡️ CSRF

**CSRF = Cross-Site Request Forgery**

The attacker tricks a victim's browser into sending an unwanted authenticated request.

```
Victim logged into website
          ↓
Visits attacker-controlled site
          ↓
Browser sends request
          ↓
Target website
```

The attack is especially relevant when authentication relies on cookies that the browser automatically sends.

### Defenses

- `SameSite` cookies
- CSRF tokens
- Origin/Referer validation where appropriate
- Don't use GET for state-changing actions

> **Key idea:** Don't assume that because a request contains valid authentication, it was intentionally made by the user.
> 

---

# 10. ⚙️ Security Misconfiguration

Security problems can come from configuration rather than application code.

### Common examples

- Debug mode enabled
- Default credentials
- Exposed secrets
- Verbose error messages
- Unnecessary services
- Excessive permissions
- Exposed admin interfaces
- Outdated dependencies
- Incorrect cloud permissions

### Production Checklist

- Disable debugging
- Don't expose stack traces
- Store secrets securely
- Apply least privilege
- Remove unnecessary services
- Keep dependencies updated
- Restrict administrative interfaces
- Configure security headers where appropriate

> **Secure code + insecure configuration = insecure application.**
> 

---

# 11. 🧠 Security Mindset

For every backend endpoint, ask:

### 1. Authentication

**Who is making this request?**

### 2. Authorization

**Are they allowed to perform this action?**

### 3. Input

**Can the attacker control this data?**

### 4. Injection

**Can this data become code?**

### 5. Object Access

**Can they access another user's resource?**

### 6. Abuse

**Can they repeat this request thousands of times?**

### 7. Output

**Can attacker-controlled data execute in another context?**

### 8. Configuration

**Could deployment settings expose the system?**

---

# 🧩 Security Mental Model

Think about every request like this:

```
             HTTP Request
                  ↓
          ┌───────────────┐
          │ Authentication│
          └───────┬───────┘
                  ↓
          ┌───────────────┐
          │ Authorization │
          └───────┬───────┘
                  ↓
          ┌───────────────┐
          │ Input Handling│
          └───────┬───────┘
                  ↓
          ┌───────────────┐
          │ Business Logic│
          └───────┬───────┘
                  ↓
          ┌───────────────┐
          │ Database/OS   │
          └───────────────┘
```

At every boundary:

> **"What happens if the caller is malicious?"**
> 

---

---

# 🧠 Quick Revision Sheet

## Injection

**Problem:** Data becomes code.

**Defense:** Keep data and instructions separate.

---

## Passwords

**Problem:** Password database gets compromised.

**Defense:** Argon2id + unique salt + appropriate parameters.

---

## Authentication

**Question:** Who are you?

**Threats:** Brute force, credential stuffing, session theft, weak recovery.

---

## Authorization

**Question:** What are you allowed to do?

**Threats:** BOLA, BFLA, privilege escalation.

---

## Sessions

**Problem:** Stolen/fixed session identifiers.

**Defense:** Secure cookies, rotation, expiration, HTTPS, appropriate `SameSite`.

---

## JWT

**Problem:** Incorrect validation or excessive trust in token claims.

**Defense:** Verify signatures and relevant claims; manage keys and lifetimes carefully.

---

## XSS

**Problem:** Attacker-controlled content executes in a browser.

**Defense:** Context-aware output encoding, safe APIs, sanitization where necessary, CSP.

---

## CSRF

**Problem:** Browser is tricked into sending an authenticated request.

**Defense:** SameSite cookies, CSRF tokens, origin checks where appropriate.

---

## Rate Limiting

**Problem:** Unlimited requests enable brute force and abuse.

**Defense:** Apply appropriate limits to sensitive/expensive operations.

---

## Misconfiguration

**Problem:** Secure code deployed with insecure settings.

**Defense:** Secure defaults, least privilege, hardened production configuration.

# 📚 Resources

- [PortSwigger Web Security Academy](https://portswigger.net/web-security?utm_source=chatgpt.com)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/?utm_source=chatgpt.com)
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/?utm_source=chatgpt.com)

### Recommended Practice

**Learn → Build vulnerable app → Attack locally → Fix → Test again**

Hands-on practice is much more valuable than memorizing vulnerability names.