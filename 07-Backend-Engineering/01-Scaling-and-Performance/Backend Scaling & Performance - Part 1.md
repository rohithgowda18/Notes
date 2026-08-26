# Backend Scaling & Performance - Part 1

no: 5

## 1. Latency & Percentiles

**Latency** = time taken for a request to complete. It varies between requests because of cache hits/misses, DB work, network conditions, server load, etc.

**Percentiles:**

- **P50:** 50% of requests are at or below this latency — typical experience.
- **P90:** 90% are at or below this latency.
- **P99:** 99% are at or below this latency — exposes the slowest 1% (tail latency).

> **Interview:** Why not rely only on average latency?
> 

> Average can hide slow outliers; percentiles show the distribution and tail behavior.
> 

## 2. Throughput & Utilization

**Throughput** = amount of work handled per unit time, commonly requests/second (RPS).

**Latency vs Throughput:**

- Latency → how long one request takes.
- Throughput → how many requests the system handles.

As utilization approaches capacity:

```
Traffic ↑ → Utilization ↑ → Queues ↑ → Latency ↑↑
```

Near 100% utilization, a small traffic increase can cause a large latency increase. Keep **headroom** in production.

## 3. Finding Bottlenecks

> **Measure, don't guess.**
> 

Typical workflow:

```
Measure → Find bottleneck → Optimize → Measure again → Scale if needed
```

Break down request time across application code, DB, cache, external APIs, etc. Optimizing the wrong component wastes effort.

## 4. Profiling vs Distributed Tracing

**Profiling:** looks inside application execution to find expensive/CPU-heavy functions.

**Distributed tracing:** follows a request across services, databases and external APIs to identify where its latency is spent.

**Easy distinction:**

- Profiling → “Which code/function is slow?”
- Tracing → “Which component made this request slow?”

## 5. N+1 Query Problem ⭐

Pattern:

```
1 query to fetch N records
+
N queries to fetch related data
=
N+1 queries
```

Example: fetch 100 posts, then query the author separately for every post → **101 DB queries**.

**Why bad:** repeated network/DB round trips and query processing create unnecessary latency and DB load.

**Solutions:** JOINs, bulk queries, `IN (...)`, eager loading, prefetching.

> **Interview:** N+1 occurs when one query fetches N records and another query runs for each record. Fix it by fetching related data in bulk or with joins/eager loading.
> 

## 6. Database Indexes ⭐

An **index** helps the DB locate rows efficiently instead of scanning the whole table.

```sql
CREATE INDEX idx_users_email ON users(email);
```

**Trade-off:**

- Faster reads
- More storage
- Additional work for writes/updates

Don't index everything blindly. Use actual query patterns and tools such as `EXPLAIN ANALYZE` to inspect query plans and identify sequential/full-table scans.

## 7. Connection Pooling

Without pooling:

```
Request → Create DB connection → Query → Close
```

With pooling:

```
Request → Borrow existing connection → Query → Return to pool
```

Pooling avoids repeatedly paying connection setup/teardown overhead.

**Internal pool:** each application instance has its own pool. With horizontal scaling, total possible DB connections can become very large.

**External pooler:** application instances share a centralized pooler before the database. Useful for controlling the database connection budget.

## 8. Caching ⭐⭐⭐

**Caching** = store the result of an expensive operation so later requests can reuse it.

```
Request → Cache
           ├─ HIT  → Return
           └─ MISS → DB → Store in cache → Return
```

Caching can reduce latency and database load.

### Cache Hit / Miss

- **Hit:** requested data exists in cache.
- **Miss:** data isn't in cache, so the original source must be consulted.

## 9. Cache Invalidation

Main problem: cached data can become **stale** when the underlying DB data changes.

### TTL / Time-based invalidation

Cache is valid for a fixed duration.

```
TTL = 5 min → expires → next request gets fresh data
```

- Simple
- TTL too long → stale data risk
- TTL too short → more misses

### Event-based invalidation

Invalidate when the underlying data changes:

```
Update DB → Invalidate cache
```

More precise, but every relevant update path must reliably invalidate the cache.

## 10. Local vs Distributed Cache

### Local cache

Cache lives in the application server's memory.

**Pros:** very fast, no network round trip.

**Problem:** with multiple servers, each has a different cache → possible inconsistency.

### Distributed cache

Shared external cache used by multiple servers (e.g. Redis/Memcached).

**Pros:** shared cache across instances.

**Cons:** requires a network round trip, so it is slower than local memory.

## 11. Tiered Caching

Combine both:

```
Request
  ↓
Local cache
  ↓ MISS
Distributed cache
  ↓ MISS
Database
```

Keep the **hottest/frequently requested data** in the local cache, while the distributed cache acts as the shared larger cache.

## 12. Caching Patterns ⭐

### Cache-Aside / Lazy Loading

**Read:** Cache → miss → DB → populate cache → return.

**Write:** Update DB → invalidate cache.

Most commonly used pattern in the lecture.

### Write-Through

A write updates the **database and cache together**.

```
Write → DB + Cache
```

Cache stays populated with the latest value.

### Write-Behind / Write-Back

Write to cache first; persist to DB later/asynchronously.

**Benefit:** very fast writes.

**Risk:** if the cache fails before persistence, data can potentially be lost.

### Quick memory trick

- Cache-aside → **cache when needed**
- Write-through → **write cache + DB now**
- Write-behind → **cache now, DB later**

## 13. Cache Hit Ratio

```
Cache Hit Ratio = Cache Hits / Total Requests × 100
```

Example: 800 hits out of 1,000 requests → **80% hit ratio**.

Factors affecting hit ratio:

1. **TTL** — longer TTL can increase hits but increases staleness risk.
2. **Cache size** — larger cache can hold more data.
3. **Access patterns** — understanding what users/endpoints request frequently helps choose what to cache.

## 14. Vertical Scaling — Scale Up

Make one machine more powerful.

```
4 CPU + 8 GB RAM
        ↓
16 CPU + 64 GB RAM
```

**Pros:** simple architecture, less distributed-system complexity.

**Cons:** hardware limits, increasing cost, and a single powerful machine can remain a major failure point.

## 15. Horizontal Scaling — Scale Out ⭐

Add more application instances.

```
      Load Balancer
     /      |      \
Server 1 Server 2 Server 3
```

**Pros:** more capacity, can add instances as demand grows, can improve availability/fault tolerance.

**Challenges:** load balancing, failures, shared state, synchronization, distributed caching, networking and monitoring.

## Vertical vs Horizontal — Interview Comparison

|  | Vertical | Horizontal |
| --- | --- | --- |
| Also called | Scale up | Scale out |
| Method | Bigger machine | More machines |
| Complexity | Lower | Higher |
| Hardware limit | Yes | Can keep adding instances |
| Load balancer | Usually not needed | Commonly used |
| Distributed concerns | Lower | Higher |

> **Interview:** When would you choose horizontal scaling?
> 

> When the system needs more capacity, better fault tolerance/availability, or continued scaling beyond what one machine can provide. Be aware that it introduces distributed-system complexity.
> 

## 🔥 Part-1 Mental Model

```
Traffic / Load
      ↓
Utilization
      ↓
Queueing
      ↓
Latency
      ↓
Measure & find bottleneck
      ↓
Optimize
      ↓
Still insufficient?
   ↙           ↘
Scale Up     Scale Out
```

## Placement Must-Know Questions

- What is latency? Why use P50/P90/P99?
- Latency vs throughput?
- Why does latency rise sharply near 100% utilization?
- How do you find a bottleneck?
- What is N+1 and how do you fix it?
- Why use indexes? Why not index every column?
- Why use connection pooling?
- Local vs distributed cache?
- What is tiered caching?
- Cache-aside vs write-through vs write-behind?
- What is cache invalidation?
- What affects cache hit ratio?
- Vertical vs horizontal scaling?

## 🎯 Golden Interview Principles

1. **Measure, don't guess.**
2. **Optimize the actual bottleneck.**
3. **Percentiles reveal tail latency.**
4. **High utilization creates queueing and latency.**
5. **Caching improves speed/load but introduces consistency and invalidation problems.**
6. **Scaling out increases capacity but introduces distributed-system complexity.**