# Task queues and background jobs

no: 2
source: https://www.youtube.com/watch?v=r-nQsyguU1Y&list=PLui3EUkuMTPgZcV0QhQrOcwMPcBCcd_Q1&index=14

# 📌 Background Jobs & Task Queues

> 💡 **Definition**
> 
> 
> A **Background Job (Background Task)** is a task that runs **outside the request-response lifecycle**. Instead of blocking the user until the task completes, the backend returns a response immediately while the task is executed asynchronously by a worker.
> 

---

# ❓ Why Do We Need Background Jobs?

### Without Background Jobs

```
User
  │
  ▼
Backend
  │
  ├── Validate Request
  ├── Save User
  ├── Send Email ❌ (Slow)
  │
  ▼
Return Response
```

- User waits until email is sent.
- Slow external services increase API response time.
- API may timeout.
- Poor user experience.

---

### With Background Jobs

```
User
  │
  ▼
Backend
  │
  ├── Validate Request
  ├── Save User
  ├── Add Email Task to Queue
  │
  ▼
Return 200 OK ✅

        │
        ▼
     Background Worker
        │
        ▼
     Send Email
```

### ✅ Advantages

- Faster API response
- Better user experience
- Prevents request timeout
- Handles retries automatically
- Improves scalability

---

# 🏗️ Task Queue Architecture

Every background job system consists of **3 main components**.

## 1. Producer

The **Producer** creates the task and pushes it into the queue.

**Example**

User signs up

↓

Backend creates **Send Verification Email** task

↓

Pushes task into queue

---

## 2. Broker (Queue)

The **Broker** temporarily stores tasks until a worker is ready.

Common Brokers

- RabbitMQ
- Redis
- AWS SQS

Responsibilities

- Store tasks
- Deliver tasks
- Manage retries
- Handle acknowledgements

---

## 3. Consumer (Worker)

A **Worker** runs in a separate process.

Responsibilities

- Listen to queue
- Pick tasks
- Execute task
- Send acknowledgement (ACK)

---

## Overall Architecture

```
Client
   │
   ▼
Backend (Producer)
   │
Enqueue Task
   │
   ▼
Queue (Broker)
   │
Dequeue Task
   │
   ▼
Worker (Consumer)
   │
   ▼
External Service
```

---

# 🔄 Task Lifecycle

```
Create Task
      │
      ▼
Serialize Data
      │
      ▼
Enqueue
      │
      ▼
Worker Dequeues
      │
      ▼
Deserialize
      │
      ▼
Execute Task
      │
      ▼
Send ACK
      │
      ▼
Task Removed
```

---

# 📖 Important Concepts

## Serialization

Converting data into a transferable format (usually JSON).

```json
{
  "userId": 101,
  "email": "abc@gmail.com"
}
```

---

## Deserialization

Converting JSON back into native language objects.

Example

- Python → Dictionary
- Node.js → Object
- Go → Struct

---

## ACK (Acknowledgement)

After completing a task successfully, the worker sends an **ACK**.

```
Worker
   │
Task Completed
   │
ACK
   │
Broker Deletes Task
```

Without ACK, the broker assumes the task failed.

---

## Visibility Timeout

When a worker picks a task:

- Task becomes temporarily invisible.
- If worker crashes before ACK,
- Timeout expires,
- Task becomes visible again.
- Another worker processes it.

> Prevents task loss.
> 

---

## Retries & Exponential Backoff

If a task fails temporarily:

```
Retry 1 → 1 minute

Retry 2 → 2 minutes

Retry 3 → 4 minutes

Retry 4 → 8 minutes
```

Useful for temporary failures like:

- Network issues
- External API downtime

---

# 📂 Types of Background Tasks

## 1. One-Off Task

Runs once after an event.

Examples

- Welcome email
- Password reset email
- Push notification

---

## 2. Recurring Task (Cron Job)

Runs periodically.

Examples

- Daily reports
- Weekly reports
- Database cleanup

---

## 3. Chained Task

One task starts only after another finishes.

```
Encode Video
      │
      ▼
Generate Thumbnail
      │
      ▼
Compress Thumbnail
```

---

## 4. Batch Task

One task creates many smaller tasks.

Example

```
Delete Account
      │
      ├── Delete Posts
      ├── Delete Images
      ├── Delete Comments
      └── Delete Profile
```

---

# ⚙️ System Design Considerations

## Idempotency

A task should produce the same result even if executed multiple times.

Example

If an email has already been sent,

Retry → should **not** send another copy.

---

## Error Handling

Always

- Catch exceptions
- Log failures
- Retry temporary failures

---

## Monitoring

Track

- Queue length
- Failed jobs
- Retry count
- Worker health

Common Tools

- Prometheus
- Grafana

---

## Scalability

When queue size increases:

```
Queue

↓

Worker 1
```

Scale horizontally

```
Queue

↓

Worker 1

Worker 2

Worker 3
```

More workers = Higher throughput.

---

## Rate Limiting

Workers calling external APIs should respect rate limits.

Examples

- Email APIs
- SMS APIs
- Payment APIs

---

# 💼 Common Use Cases

- Email sending
- Push notifications
- SMS sending
- Image resizing
- Video encoding
- PDF generation
- Report generation
- Database cleanup
- File processing

---

# 🛠️ Popular Technologies

| Technology | Purpose |
| --- | --- |
| RabbitMQ | Message Broker |
| Redis + BullMQ | Node.js Task Queue |
| Celery | Python Background Jobs |
| AWS SQS | Managed Cloud Queue |
| Kafka | Event Streaming (Not a traditional task queue) |

---

# ✅ Best Practices

- Keep tasks **small and focused**.
- Avoid long-running tasks.
- Make tasks **idempotent**.
- Use retries with exponential backoff.
- Log every failure.
- Monitor queue health.
- Scale workers horizontally.

---

# 🎯 Placement Interview Questions

1. What is a background job?
2. Why are background jobs needed?
3. Explain Producer, Broker, and Consumer.
4. What is serialization and deserialization?
5. What is ACK?
6. What is Visibility Timeout?
7. Why is idempotency important?
8. Explain retries and exponential backoff.
9. Explain One-Off, Recurring, Chained, and Batch tasks.
10. Name some popular task queue technologies.

---

# 📝 Quick Revision

> **Background Job** → Runs outside request-response cycle.
> 

**Flow**

```
Producer
   │
Serialize
   │
Enqueue
   │
Queue
   │
Dequeue
   │
Worker
   │
Execute
   │
ACK
```

**Components**

- Producer → Creates task
- Broker → Stores task
- Worker → Executes task

**Task Types**

- One-Off
- Recurring
- Chained
- Batch

**Key Concepts**

- Serialization
- Deserialization
- ACK
- Visibility Timeout
- Retries
- Exponential Backoff
- Idempotency

**Common Uses**

- Emails
- Notifications
- Image/Video Processing
- Reports
- Database Cleanup

**Best Practices**

- Small tasks
- Proper logging
- Retries
- Monitoring
- Horizontal scaling