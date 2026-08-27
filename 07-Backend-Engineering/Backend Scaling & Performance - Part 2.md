# Backend Scaling & Performance - Part 2

no: 6

| Topic | Main question |
| --- | --- |
| Statelessness | Can any server handle any request? |
| Load Balancer | Which server should receive this request? |
| Read Replicas | How do we handle lots of DB reads? |
| Sharding | How do we split a huge dataset? |
| CDN | How do we serve content closer to users? |
| Edge | How do we run some logic closer to users? |
| Async Jobs | What work can happen after the response? |
| Microservices | When is independent service ownership worth the complexity? |
| Serverless | When should the provider manage execution infrastructure? |

## 1. Statelessness & Horizontal Scaling

**Stateless** means an application server does not depend on important state stored only in its own memory or local disk.

```
      Load Balancer
    /      |      \
   ↓       ↓       ↓
Server A Server B Server C
   \       |       /
    → Shared State ←
```

If session/state exists only on Server A, a later request sent to Server B may fail or lose context. Store important state in shared/external systems so **any healthy server can handle any request**.

Typical external/shared state:

- Sessions / authentication state
- Database data
- Object/file storage
- Distributed caches

> **Key idea:** Stateless application servers make horizontal scaling practical because new instances can join the pool without needing a user's state already stored locally.
> 

## 2. Load Balancers & Algorithms

A **load balancer** provides a common entry point and distributes requests across backend instances.

### Common algorithms

- **Round Robin:** A → B → C → A. Simple when servers and requests are reasonably similar.
- **Weighted Round Robin:** stronger instances receive a larger share of traffic.
- **Least Connections:** favors the server with fewer active connections; useful when request duration varies.
- Other strategies can consider response time or resource usage.

### Health checks

The load balancer can periodically call a health endpoint such as `/health`. If an instance becomes unhealthy, it is removed from traffic; after recovery, it can be added again.

> **Interview:** Round Robin distributes sequentially; Least Connections considers current active workload. Least Connections can be better when some requests take much longer than others.
> 

## 3. Database Scaling — Read Replicas

Even after horizontally scaling the application tier, one database can become the bottleneck. This is especially common with **read-heavy workloads**.

**Read replicas** maintain copies of primary data and handle read traffic.

```
                 ┌→ Read Replica 1
Writes → Primary ├→ Read Replica 2
                 └→ Read Replica 3
```

- **Primary:** typically handles writes (`INSERT`, `UPDATE`, `DELETE`).
- **Replicas:** primarily handle reads (`SELECT`).

### Why it helps

Instead of sending every read to one database, reads can be distributed across replicas while writes continue going to the primary.

### Replication Lag ⚠️

Replication is not always instantaneous:

```
Primary:  name = AB
Replica:  name = A   ← temporarily stale
```

This delay is **replication lag**. It can create a **read-after-write consistency** problem: a write succeeds on the primary, but an immediate read from a replica may still return old data.

Possible approaches:

- Route important post-write reads to the primary.
- Monitor lag and wait for a replica to catch up when appropriate.
- For some user interactions, delay the follow-up read slightly.

> **Trade-off:** replicas improve read scalability, but distributed copies introduce consistency considerations.
> 

## 4. Database Scaling — Sharding

**Sharding / partitioning** splits a large dataset across multiple database instances.

```
Orders
├── Shard A → Part of the data
├── Shard B → Part of the data
└── Shard C → Part of the data
```

Sharding becomes useful when the dataset itself is extremely large and one database instance is no longer sufficient for the required capacity.

### Sharding key

The **sharding key** determines where a record belongs.

Example:

```
Order date
├── Jan–Jun → Shard A
└── Jul–Dec → Shard B
```

The application/routing layer must be able to determine which shard contains the requested data.

### Replication vs Sharding

|  | Replication | Sharding |
| --- | --- | --- |
| Data | Copies of the same data | Different portions of data |
| Main purpose | Distribute reads / improve availability | Distribute dataset and DB workload |
| Mental model | **Copy** | **Split** |

## 5. CDN — Content Delivery Network

A **CDN** is a geographically distributed caching layer.

### Why geography matters

If your origin server is in one country and the user is on another continent, the request still has to cross a physical network distance. Code optimization cannot remove that fundamental latency.

```
 Origin Server
      🇺🇸
   /   |   \
  ↓    ↓    ↓
CDN   CDN   CDN
🇮🇳    🇪🇺    🇯🇵
  ↓    ↓    ↓
    Users
```

### Cache hit

```
User → CDN → cached content → User
```

The CDN already has the content, so the origin may not be contacted.

### Cache miss

```
User → CDN → Origin → CDN caches content → User
```

The first request retrieves content from the origin; subsequent users can often get it from the CDN.

### Benefits

- Lower latency for users.
- Less traffic/load on the origin.
- Better scalability for globally distributed users.

> **Interview:** A CDN is a geographically distributed cache that serves content closer to users, reducing latency and origin load.
> 

## 6. Edge Computing

**CDN:** bring content closer.

**Edge computing:** bring **computation/logic** closer.

```
User
 ↓
Edge Location
 ↓
Run lightweight logic
 ↓
Response / forward request
```

Possible edge workloads include authentication-related checks, routing, localization, and request customization.

### CDN vs Edge

- **CDN:** primarily serves cached content.
- **Edge:** executes computation near the user.

Edge environments have runtime/resource constraints, so edge computing is usually used for selected pieces of logic rather than automatically replacing the entire backend.

## 7. Asynchronous Processing & Background Jobs

If the user **does not need a task to finish before receiving the response**, move that work to a background job.

### Synchronous

```
User → API → Do all work → Response
                 ↑
               waits
```

### Asynchronous

```
User → API → Queue → Quick response
                   ↓
                 Worker
                   ↓
               Do the work
```

### Core components

- **Producer:** application that creates/pushes the job.
- **Queue:** stores pending jobs.
- **Consumer / Worker:** takes the job and performs the work.

Workers can also scale horizontally:

```
Queue → Worker A
      → Worker B
      → Worker C
```

### Good use cases

- Emails and notifications
- Image/video processing
- File processing
- Large account-deletion cleanup
- Other long-running work that does not need to block the response

### Why it helps

Async processing does **not necessarily make the underlying work faster**. It makes the **user-facing request faster** by separating immediate work from work that can happen later.

> **Rule:** If the user needs the result immediately, the critical operation should remain synchronous. Otherwise, consider a queue.
> 

## 8. Microservices vs Monolith

### Monolith

One deployable application containing multiple modules:

```
MONOLITH
├── Users
├── Orders
├── Payments
└── Notifications
```

A monolith **can still be horizontally scaled**. Its major advantage is simplicity: one codebase, simpler local communication/testing, and one deployment unit.

### Why stay with a monolith?

For a small or medium team, a monolith can reduce coordination and distributed-system complexity. You should have a concrete reason before splitting it.

### Microservices

Split functionality into independently deployable services:

```
User Service
Order Service
Payment Service
Notification Service
```

### Why choose microservices?

- **Large teams:** teams can own and deploy services more independently.
- **Different scaling needs:** scale a busy service without scaling everything.
- **Different technology needs:** services can use different stacks where justified.
- **Independent deployments:** one service can change without deploying the entire application.

### The cost ⚠️

Microservices create a distributed system. A local function call may become a network call, so you now need to think about:

- Network latency, failures, and timeouts
- Retries and error handling
- Distributed tracing and observability
- Data consistency across services
- More deployment/infrastructure complexity

> **Key idea:** Microservices are often about **scaling teams and organizational boundaries**, not simply making machines faster.
> 

### Interview answer

> Use microservices when independent deployment, scaling, team ownership, or technology flexibility provides enough value to justify the added distributed-system complexity. Don't split a monolith simply because it is getting bigger.
> 

## 9. Serverless Computing

**Serverless does not mean there are no servers.** Servers still exist; the cloud provider abstracts much of the underlying infrastructure from you.

```
Event / Request
      ↓
Serverless Function
      ↓
Run code
      ↓
Finish
```

### Why useful?

- Less direct infrastructure management.
- Platform-managed execution/scaling.
- Good fit for event-driven or irregular/bursty workloads.
- Useful for image/video processing, file processing, and queue/database-triggered tasks.

### Event-driven model

```
File uploaded → Function
Queue message → Function
DB change     → Function
```

### Important limitation

Serverless is **not automatically better** for every workload. Choose it when the workload benefits from provider-managed infrastructure and demand-driven execution.

> **Interview:** Serverless means you deploy code/functions without directly managing the underlying servers; the provider handles the execution infrastructure and scaling behavior.
> 

## 🔥 Part-2 Mental Model

The overall progression is:

**Make servers stateless → distribute requests → scale the database → move content/computation closer to users → move non-critical work off the request path → introduce service boundaries only when justified → use serverless for suitable event-driven workloads.**

```
Stateless Servers
      ↓
Load Balancer
      ↓
Horizontal Scaling
      ↓
Database Scaling
 ┌────┴─────┐
 ↓          ↓
Replicas   Sharding
      ↓
CDN / Edge
      ↓
Async Queue + Workers
      ↓
Microservices (when justified)
      ↓
Serverless (for suitable workloads)
```

## 🎯 Placement Quick Revision

| Problem | Think of | Main trade-off / note |
| --- | --- | --- |
| Server-specific state blocks scaling | **Statelessness** | Move important state outside instances |
| Distribute requests | **Load Balancer** | Algorithm should match workload |
| Too many DB reads | **Read Replicas** | Replication lag / stale reads |
| Huge dataset / DB capacity | **Sharding** | Sharding-key and routing complexity |
| Users far from origin | **CDN** | Cached content only helps on hits |
| Computation should happen near users | **Edge** | Limited execution environment |
| Long work shouldn't block user | **Async Queue + Workers** | Eventual/background completion |
| Large teams / independent ownership | **Microservices** | Distributed-system complexity |
| Event-driven / bursty workloads | **Serverless** | Not ideal for every workload |

## ⭐ Must-Know Interview Questions

1. Why is statelessness important for horizontal scaling?
2. Round Robin vs Least Connections — when would you choose each?
3. What are load-balancer health checks?
4. Why do read replicas help a read-heavy workload?
5. What is replication lag? Give a read-after-write example.
6. How can you handle reads that must see a recent write?
7. Read replicas vs sharding — what problem does each solve?
8. What is a sharding key and why is it important?
9. CDN vs edge computing?
10. When should work be asynchronous?
11. Monolith vs microservices — benefits and trade-offs?
12. Does serverless mean there are no servers?

<aside>
🧠

**Final interview principle:** Don't start with “Which technology should I use?” Start with **“What is the bottleneck/problem?”** Then choose the simplest architecture that solves it and understand the trade-offs.

</aside>