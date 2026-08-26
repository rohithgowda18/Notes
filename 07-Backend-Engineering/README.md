# ⚙️ Backend Engineering & Distributed Systems

This directory contains advanced notes covering backend architecture, scalability, concurrency, distributed task processing, search engines, system security, and containerization.

---

## 📂 Modules & Learning Progression

### 1. 📈 [01-Scaling-and-Performance/](./01-Scaling-and-Performance/)
- **[Backend Scaling & Performance - Part 1.md](./01-Scaling-and-Performance/Backend%20Scaling%20%26%20Performance%20-%20Part%201.md)**: Vertical vs Horizontal scaling, Caching strategies (Cache-Aside, Write-Through, Write-Back), Cache Eviction (LRU, LFU), Database Sharding & Partitioning, Read Replicas, and Connection Pooling.
- **[Backend Scaling & Performance - Part 2.md](./01-Scaling-and-Performance/Backend%20Scaling%20%26%20Performance%20-%20Part%202.md)**: Advanced performance tuning, API latency optimization, CDN utilization, Load Balancing algorithms (Round Robin, Least Connections, Consistent Hashing), and HTTP Keep-Alive.

### 2. ⚡ [02-Concurrency-and-Parallelism/](./02-Concurrency-and-Parallelism/)
- **[Concurrency & Parallelism.md](./02-Concurrency-and-Parallelism/Concurrency%20%26%20Parallelism.md)**: Processes vs Threads, Asynchronous I/O, Event Loops, Thread Pools, Race Conditions, Deadlocks, Locks (Pessimistic vs Optimistic), Mutexes, and Atomics.

### 3. 🛡️ [03-Fault-Tolerance-and-Resilience/](./03-Fault-Tolerance-and-Resilience/)
- **[Error Handling and Building Fault Tolerant Systems.md](./03-Fault-Tolerance-and-Resilience/Error%20Handling%20and%20Building%20Fault%20Tolerant%20Systems.md)**: Circuit Breakers (Resilience4j / Hystrix), Exponential Backoff & Jitter, Retries, Fallbacks, Bulkheads, Idempotency keys, and Rate Limiting.

### 4. ⏱️ [04-Task-Queues-and-Background-Jobs/](./04-Task-Queues-and-Background-Jobs/)
- **[Task queues and background jobs.md](./04-Task-Queues-and-Background-Jobs/Task%20queues%20and%20background%20jobs.md)**: Message Queues (RabbitMQ, Kafka, SQS, Redis Pub/Sub), Background Workers, At-least-once vs At-most-once vs Exactly-once processing, Dead Letter Queues (DLQ), and Scheduled Jobs.

### 5. 🔍 [05-Search-and-Storage/](./05-Search-and-Storage/)
- **[Elastic Search.md](./05-Search-and-Storage/Elastic%20Search.md)**: Elasticsearch internals, Inverted Index, Shards & Replicas, Lucene syntax, Full-text search, and Aggregations.

### 6. 🔒 [06-Security/](./06-Security/)
- **[Security.md](./06-Security/Security.md)**: Authentication vs Authorization, JWT vs Sessions, OAuth2.0 / OpenID Connect, HTTPS / TLS, CORS & CSRF protection, SQL Injection prevention, XSS mitigation, and Rate Limiting.

### 7. 🐳 [07-DevOps-and-Containers/](./07-DevOps-and-Containers/)
- **[Docker CheatSheet ApnaCollege.pdf](./07-DevOps-and-Containers/Docker%20CheatSheet%20ApnaCollege.pdf)**: Docker commands, Dockerfile syntax, multi-stage builds, volume mounts, port mappings, and container lifecycle management.

### 📊 [metadata/](./metadata/)
- Contains raw database export records (`Backend-Engineering-Notes.csv`, `Backend-Engineering-Notes-All.csv`) and original archive `backend.zip`.
