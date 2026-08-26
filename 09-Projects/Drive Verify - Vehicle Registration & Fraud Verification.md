# Drive Verify

# 🚗 Drive Verify

> **Vehicle Registration & Fraud Verification Platform**
> 

**Role:** Full-Stack Developer

**Type:** Full-Stack Web Application

**Primary Stack:** Java 21 · Spring Boot 4 · MongoDB · React · TypeScript

**Core Problem:** Helping users verify vehicle registration information, ownership history, and fraud-risk indicators before a vehicle transaction.

---

# 🎯 1. Project Overview

**Drive Verify** is a full-stack vehicle registration verification platform designed around the problem of **trust in used-vehicle transactions**.

A buyer or administrator can search for a vehicle using its RC number and view:

- Vehicle information
- Current owner information
- Registration status
- Insurance information
- PUC information
- Previous ownership information
- Stolen status
- Suspicious/fraud-risk status
- Verification/search activity

The system also provides an **ownership-history timeline**, allowing previous ownership transfers to be audited chronologically.

### One-line explanation

> **Drive Verify is a full-stack vehicle verification platform that manages RC records, tracks ownership transfers, identifies stolen or suspicious vehicles, and maintains an auditable ownership history.**
> 

---

# 🧠 2. Problem I Wanted to Solve

When buying a used vehicle, the buyer may rely heavily on information provided by the seller.

Potential problems include:

- Incorrect owner count
- Hidden previous owners
- Stolen vehicles
- Suspicious/fraudulent vehicles
- Invalid registration information
- Expired insurance
- Expired PUC
- Incomplete ownership history

The goal of Drive Verify is to centralize these vehicle verification signals into one system.

---

# 💡 3. Core Idea

The central workflow is:

```
Vehicle / RC Number
        ↓
Drive Verify
        ↓
Retrieve Vehicle Record
        ↓
Check Ownership
        ↓
Check Registration
        ↓
Check Insurance / PUC
        ↓
Check Stolen / Suspicious Flags
        ↓
Display Verification Information
```

For ownership changes:

```
Existing Owner
      ↓
New Owner
      ↓
Ownership Change Detected
      ↓
Create OwnershipHistory
      ↓
Update Current Owner
      ↓
Recalculate Owner Count
      ↓
Update Vehicle
      ↓
Send Email Notification
```

---

# 🏗️ 4. Architecture

## High-Level Architecture

```
                    ┌─────────────────────┐
                    │       User          │
                    │      Browser        │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ React + TypeScript  │
                    │      Frontend       │
                    └──────────┬──────────┘
                               │
                         REST API / HTTP
                               │
                               ▼
                    ┌─────────────────────┐
                    │    Spring Boot      │
                    │      Backend        │
                    └──────────┬──────────┘
                               │
                    ┌──────────┴──────────┐
                    ▼                     ▼
             ┌─────────────┐      ┌─────────────┐
             │  MongoDB    │      │ EmailService│
             │    Atlas    │      │   @Async    │
             └─────────────┘      └─────────────┘
                    │
             ┌──────┴────────┐
             ▼               ▼
        vehicles       ownership_history
```

---

# ⚙️ 5. Technology Stack

## Frontend

| Technology | Purpose |
| --- | --- |
| React 18 | UI |
| TypeScript | Type safety |
| Vite | Build tooling |
| Tailwind CSS | Styling |
| shadcn/ui / Radix | UI components |
| React Router | Routing |
| TanStack React Query | Server state / caching |
| Zod | Form validation |
| Recharts | Analytics |
| Lucide React | Icons |
| Sonner | Notifications |

## Backend

| Technology | Purpose |
| --- | --- |
| Java 21 | Backend language |
| Spring Boot 4 | Backend framework |
| Spring WebMVC | REST APIs |
| Spring Data MongoDB | Database access |
| MongoDB Atlas | Database |
| Spring Actuator | Monitoring |
| Micrometer | Metrics |
| Prometheus Registry | Metrics export |
| JavaMailSender | Email |
| `@Async` | Non-blocking email processing |

---

# 🗂️ 6. Backend Architecture

The backend follows:

```
Controller
    ↓
Service
    ↓
Repository
    ↓
MongoDB
```

### Controller

`RcController`

Responsible for:

- HTTP endpoints
- Request/response handling
- Admin authorization checks

### Service

`RcServiceImpl`

Contains the actual business logic:

- RC creation
- RC retrieval
- RC update
- ownership-change detection
- owner count normalization
- ownership-history creation
- search verification counter
- metrics
- email triggering

### Repository

`RcRepository`

Handles vehicle persistence.

`OwnershipHistoryRepository`

Handles ownership-history persistence.

---

# 🗄️ 7. Database Design

Database:

```
MongoDB Atlas
    ↓
vehicledb
```

Collections:

```
vehicles
ownership_history
```

---

## `Rc` / `vehicles`

Important fields:

```
id
rcNumber
ownersCount
previousOwners
owner
vehicleInfo
registrationInfo
insurance
puc
chassisNumber
engineNumber
registrationState
stolen
suspicious
verified
createdAt
updatedAt
```

### Embedded objects

```
Rc
 ├── Owner
 ├── VehicleInfo
 ├── RegistrationInfo
 ├── Insurance
 └── Puc
```

`rcNumber` has:

```java
@Indexed(unique = true)
```

So duplicate RC numbers are prevented at the database level.

---

# 📜 8. OwnershipHistory

Separate MongoDB collection:

```
ownership_history
```

Contains:

```
id
rcId
rcNumber
previousOwnerName
newOwnerName
transferredAt
stolenAtTransfer
suspiciousAtTransfer
```

The history stores the state of relevant risk flags **at the time of transfer**.

This gives us an auditable historical record rather than only knowing the current vehicle state.

---

# 🔑 9. Authentication / Authorization

The current implementation uses a custom:

```
X-ADMIN-KEY
```

### Flow

```
Admin Login
     ↓
adminKey stored in localStorage
     ↓
api.ts reads adminKey
     ↓
X-ADMIN-KEY header
     ↓
Spring Boot
     ↓
AdminKeyValidator
     ↓
Compare with configured secret
     ↓
Authorized / HTTP 401
```

### Public operations

Read operations are publicly accessible.

Examples:

```
GET /api/rc/search
GET /api/rc/{id}
GET /api/rc/{id}/history
GET /api/rc/page
GET /api/rc/stats
```

### Protected operations

```
POST /api/rc
PUT /api/rc/{id}
DELETE /api/rc/{id}
```

require the admin key.

### Production improvement

The current shared-key mechanism is suitable for a prototype but not ideal for production.

I would replace it with:

```
Spring Security
      +
JWT / OAuth2 / OIDC
      +
Role-based authorization
```

---

# 🔌 10. REST API

Base path:

```
/api/rc
```

| Method | Endpoint | Purpose | Auth |
| --- | --- | --- | --- |
| GET | `/api/rc` | Get all vehicles | Public |
| GET | `/api/rc/search` | Search by RC number | Public |
| GET | `/api/rc/page` | Filter + paginate vehicles | Public |
| GET | `/api/rc/{id}` | Get vehicle by ID | Public |
| GET | `/api/rc/{id}/history` | Get ownership history | Public |
| GET | `/api/rc/stats` | Get analytics | Public |
| POST | `/api/rc` | Create vehicle | Admin |
| PUT | `/api/rc/{id}` | Update vehicle | Admin |
| DELETE | `/api/rc/{id}` | Delete vehicle | Admin |

---

# 🧮 11. Important Business Rules

## Owner Count

The frontend cannot arbitrarily decide the owner count.

Backend calculates:

```
ownersCount = 1 + previousOwners.size()
```

This prevents client-side manipulation of the derived value.

---

## Ownership Change Detection

During update:

```
Existing owner
      ↓
Incoming owner
      ↓
Compare names
      ↓
Different?
   /       \
 No        Yes
 |          |
Normal    Create
update    history
              ↓
         Update owner
```

When the owner name changes, an `OwnershipHistory` document is created.

---

## Verification Counter

When:

```
GET /api/rc/search?rcNumber=...
```

is called:

```
verified = verified + 1
```

The counter represents verification/search activity.

It does **not** mean that the vehicle has been cryptographically or legally authenticated.

---

# 📧 12. Email Notifications

`EmailService` uses:

```
JavaMailSender
+
@Async
```

Email notifications can be triggered for:

- New vehicle registration
- Ownership transfer

The operation does not need to wait for SMTP processing.

```
Vehicle Operation
       ↓
Database Update
       ↓
HTTP Response
       ↓
Async Email
```

### Why async?

If email delivery takes several seconds, the user shouldn't have to wait for SMTP processing before receiving the API response.

---

# 📊 13. Monitoring

The backend uses:

```
Spring Boot Actuator
Micrometer
Prometheus Registry
```

Important endpoints:

```
/actuator/health
/actuator/info
/actuator/prometheus
```

Custom metrics include:

```
rc.update.counter
rc.delete.counter
```

These allow modification activity to be monitored.

---

# 🖥️ 14. Frontend Pages

### Dashboard

Main application overview and navigation.

### Verify

Vehicle RC verification/search workflow.

### Vehicles

Vehicle database with filtering and management functionality.

### RC Detail

Detailed vehicle information.

Displays:

- Vehicle
- Owner
- Registration
- Insurance
- PUC
- Risk flags
- Additional data

### Ownership History

Chronological ownership-transfer timeline.

### Transfer Ownership

Admin ownership-transfer form with Zod validation.

### Analytics

Uses Recharts to display:

- KPIs
- Monthly information
- State breakdown
- Status ratios

### Auth

Admin session-key login.

---

# 🚀 15. Frontend Performance

I used:

```
React.lazy()
+
Suspense
```

for route-level code splitting.

Instead of loading every page immediately:

```
Application startup
      ↓
Load required route
      ↓
Load other routes when needed
```

This reduces the initial JavaScript payload.

---

# 🧪 16. Validation

Validation exists at two levels.

### Frontend

Zod validates user input before API calls.

Example areas:

- Owner name
- Phone
- Aadhaar last four digits
- Transfer form fields

### Backend

Backend remains the final trust boundary because clients can bypass the React application completely.

---

# ⚠️ 17. Known Technical Weaknesses

I would be transparent about these in an interview.

## 1. In-memory filtering

Current:

```
repo.findAll()
      ↓
Java Stream filtering
      ↓
subList pagination
```

Problem:

Doesn't scale for large datasets.

### Better:

```
MongoDB Query
      ↓
Filtering
      ↓
Sorting
      ↓
Pagination
      ↓
Only required records
```

---

## 2. No optimistic locking

Currently there is no:

```java
@Version
```

Therefore concurrent updates can potentially overwrite each other.

### Improvement

Add optimistic locking and return `409 Conflict` when a stale version is submitted.

---

## 3. Ownership transfer isn't transactional

History and vehicle updates are separate writes.

A failure between them could create inconsistent state.

### Improvement

Use MongoDB transactions or redesign the operation around reliable event processing.

---

## 4. Chassis and engine numbers aren't uniquely indexed

`rcNumber` is unique, but chassis and engine numbers aren't currently protected by unique indexes.

These should be reviewed and appropriately indexed before production.

---

## 5. Shared admin secret

All administrators effectively use the same secret.

### Improvement

Use:

```
Spring Security
+
JWT/OIDC
+
RBAC
```

---

## 6. Admin key in localStorage

If an XSS vulnerability exists, JavaScript could potentially access the key.

A production authentication architecture should use safer token/session handling.

---

## 7. Hardcoded database credentials

The database URI must never be committed to source control.

It should be supplied through:

```
Environment variables
+
Secret management
```

If a real credential was exposed, it must be rotated.

---

# 🏭 18. Production Improvements

My production roadmap would be:

### Security

- Spring Security
- JWT/OIDC
- RBAC
- Secret management
- Rate limiting
- Restricted Actuator
- Strong CORS policy

### Database

- MongoDB-side filtering
- Proper indexes
- Optimistic locking
- Transactions for transfers
- Database-side aggregation

### Reliability

- Integration tests
- Structured logging
- Retry mechanism
- Transactional outbox
- Monitoring and alerts

### Product

- Authoritative vehicle-data integration
- RC document OCR
- Fraud/risk scoring
- Verification reports
- Notifications
- Dealer/insurance integrations

---

# 🌍 19. Real-World Usefulness

Potential users include:

### Used-Car Buyers

Verify a vehicle before paying.

### Used-Car Dealers

Verify vehicles before adding them to inventory.

### Insurance Companies

Validate vehicle information during insurance workflows.

### Finance Companies

Verify vehicle information before approving vehicle loans.

### Law Enforcement / Government

Potentially use the platform if integrated with authorized authoritative datasets.

---

# ⚠️ 20. Important Product Limitation

Drive Verify currently operates on its **own vehicle database**.

It is **not automatically an authoritative RTO/VAHAN verification service**.

For real-world deployment, the system would need legitimate access to authoritative government or licensed vehicle data sources.

This distinction is important because:

```
Drive Verify database
        ≠
Government vehicle registry
```

The application is currently a **verification platform prototype**, not a replacement for an official government registry.

---

# 🎤 21. "Explain Your Project" — 60-Second Answer

> **Drive Verify is a full-stack vehicle registration and fraud verification platform that I built using React, TypeScript, Java 21, Spring Boot and MongoDB.**
> 
> 
> The main problem I wanted to solve was the lack of trust when buying or transferring used vehicles. The application allows users to search an RC number and view vehicle, owner, registration, insurance and PUC information, along with stolen and suspicious indicators.
> 
> One of the main features is ownership tracking. When the backend detects an owner change, it automatically creates an `OwnershipHistory` record containing the previous owner, new owner, transfer timestamp and risk-state snapshots. The owner count is also calculated server-side rather than trusting the frontend.
> 
> On the backend I used a controller-service-repository architecture with Spring Data MongoDB. I also added Actuator and Micrometer Prometheus metrics and asynchronous email notifications using `@Async`.
> 
> On the frontend I used React Query for server-state management, Zod for validation and React.lazy for route-level code splitting.
> 
> The current version is a strong prototype, and the main production improvements I'd make are proper authentication with Spring Security, database-side filtering and pagination, optimistic locking, transactional ownership transfers and integration with authoritative vehicle data sources.
> 

---

# 🎤 22. "Explain Your Project" — 2-Minute Answer

> **My project is called Drive Verify, a vehicle registration and fraud verification platform.**
> 
> 
> The problem I focused on is trust during used-vehicle transactions. A buyer may be given incomplete ownership information or may not know whether a vehicle has been marked stolen or suspicious. Drive Verify centralizes these verification signals.
> 
> The application has a React and TypeScript frontend and a Java 21 Spring Boot backend. The frontend uses React Router for navigation, TanStack React Query for server-state management, Zod for form validation and React.lazy with Suspense for route-level code splitting.
> 
> The backend follows a controller-service-repository architecture. `RcController` exposes the REST APIs, `RcServiceImpl` contains the business logic, and Spring Data MongoDB repositories handle persistence.
> 
> The main `Rc` document contains the current vehicle state, including owner, vehicle information, registration, insurance, PUC, stolen/suspicious flags and verification activity. I embedded the current vehicle-related objects because they're normally retrieved together. Ownership history is kept in a separate `ownership_history` collection because it represents an independently growing audit trail.
> 
> One of the most important business rules is ownership transfer. When an update changes the owner's name, the service automatically creates an ownership-history record containing the previous owner, new owner, transfer timestamp and snapshots of the stolen and suspicious states. The backend also derives `ownersCount` using `1 + previousOwners.size()` so the client cannot manipulate that value.
> 
> For security, the current prototype uses an `X-ADMIN-KEY` header for protected administrative operations, while read operations are public. I know this isn't a production-grade authentication architecture, so my production version would use Spring Security with JWT or OAuth2 and role-based authorization.
> 
> I also added Spring Actuator, Micrometer and Prometheus metrics for observability, and asynchronous email notifications using `@Async`.
> 
> One technical limitation I identified is that filtering and pagination currently happen in memory after `findAll()`. For a production system I'd move those operations into MongoDB, add appropriate indexes, optimistic locking and transactional ownership transfers.
> 
> So the project demonstrates both full-stack implementation and my understanding of security, scalability, data integrity and production trade-offs.
> 

---

# 🧠 23. Five Things I Must Remember

Before the interview, remember these five points:

### 1. Core problem

> **Trust in used-vehicle transactions.**
> 

### 2. Core feature

> **Vehicle verification + ownership history + fraud indicators.**
> 

### 3. Most interesting backend logic

> **Owner change → OwnershipHistory → owner count normalization → vehicle update → notification.**
> 

### 4. Biggest technical weakness

> **Filtering/pagination currently happens in JVM memory using `findAll()`.**
> 

### 5. Biggest security weakness

> **Shared `X-ADMIN-KEY` stored in localStorage; production should use Spring Security + proper identity/roles.**
> 

---

# 🔥 24. Best Closing Statement

If the interviewer says:

**"Anything else you'd like to add about the project?"**

Say:

> The main thing I learned from this project is that getting a feature to work and designing it for production are two different problems. Drive Verify currently solves the core workflow, but while building and reviewing it I identified issues around concurrency, database scalability, authentication and transactional consistency. I know exactly how I would address those in the next version, which I think is one of the most valuable parts of the project.
> 

---

# 📌 25. Resume Version

**Drive Verify — Vehicle Registration & Fraud Verification Platform**

> Built a full-stack vehicle verification platform using **Java 21, Spring Boot, MongoDB, React and TypeScript** to manage RC records, ownership transfers and vehicle risk indicators. Implemented automated ownership-history auditing, server-side owner-count normalization, admin authorization, asynchronous email notifications and Prometheus/Micrometer observability. Used React Query, Zod and route-level code splitting for frontend state management, validation and performance.
> 

### Keywords

`Java 21` · `Spring Boot` · `REST API` · `MongoDB` · `React` · `TypeScript` · `TanStack Query` · `Zod` · `Prometheus` · `Micrometer` · `Actuator` · `Async Processing` · `Authentication` · `Audit Trail` · `Data Integrity`