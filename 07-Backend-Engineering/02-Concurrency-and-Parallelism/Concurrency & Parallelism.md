# Concurrency & Parallelism

no: 7

# 1. Why Concurrency Matters

Backend applications frequently spend time waiting for **I/O** such as database queries, network/API calls, files, and external services.

Without concurrency, a request that is waiting can leave useful CPU time unused. With concurrency, while Request A waits for I/O, the server can work on Request B.

> **Concurrency keeps the CPU useful while other tasks are waiting.**
> 

# 2. I/O-Bound vs CPU-Bound

## I/O-Bound

An operation is I/O-bound when the program spends significant time **waiting for an external resource**.

Examples:

- Database queries
- Network/API calls
- File read/write
- Logging and other external I/O

**Think:** `I/O-bound = mostly waiting`

## CPU-Bound

An operation is CPU-bound when the program spends most of its time **performing computation**.

Examples from the material:

- Image processing
- Heavy calculations
- Encryption

**Think:** `CPU-bound = mostly calculating`

<aside>
🧠

**Rule of thumb:** I/O-bound workloads benefit strongly from concurrency; CPU-heavy workloads benefit from parallelism.

</aside>

# 3. Concurrency vs Parallelism

**Concurrency** means multiple tasks are in progress. They may take turns on a single CPU core, especially when one task is waiting.

```
Time →
A A A | B B B | A A | B B
```

**Parallelism** means multiple tasks are actually executing at the same time, typically on multiple CPU cores.

```
Core 1 → A A A A
Core 2 → B B B B
```

> **Concurrency = dealing with multiple tasks**
> 

> **Parallelism = executing multiple tasks simultaneously**
> 

# 4. Threading Model

A **thread** is an independent execution unit managed by the operating system.

```
Process
 ├── Thread 1
 ├── Thread 2
 └── Thread 3
```

A thread has execution state such as its stack, instruction pointer, registers, and other OS-managed bookkeeping. The OS scheduler decides which runnable thread gets CPU time.

Threads allow multiple requests/tasks to make progress concurrently. With multiple CPU cores, multiple threads can also execute in parallel.

# 5. Thread Overhead & Context Switching

Threads have overhead. The three main costs are:

1. **Memory overhead** — each thread requires a stack and other resources.
2. **Creation/management overhead** — the OS must create and manage the thread.
3. **Context-switching overhead** — switching between threads requires saving and restoring execution state.

## Context Switching

Conceptually:

```
Thread A running
      ↓
Save A's state
      ↓
Choose Thread B
      ↓
Restore B's state
      ↓
Thread B running
```

The CPU spends time doing this management work instead of directly performing application logic.

> **Context switch = save current thread state → select another thread → restore its state.**
> 

Too many threads can therefore cause higher memory usage and more scheduling/context-switching overhead, which can hurt scalability.

# 6. Event Loop Model

An event-loop model can handle many I/O operations using a **single main thread** rather than creating one OS thread for every waiting task.

Example:

```
Request A → DB → WAIT
                 ↓
             Event Loop
                 ↓
             Process B
                 ↓
             Process C
                 ↓
DB response arrives → Resume A
```

When A starts an I/O operation, it gives control back to the event loop instead of blocking the event-loop thread while waiting.

The event loop can monitor pending I/O and resume the appropriate task when the operation completes.

## Critical Rule

> **Never block the event loop.**
> 

Waiting for I/O is okay because the event loop can handle other work.

Heavy CPU work is dangerous because it occupies the event-loop thread and prevents other tasks from being processed efficiently.

# 7. Async/Await

`async/await` provides a readable way to express asynchronous operations.

```jsx
const user = await getUser();
```

Conceptually:

```
Start I/O
   ↓
await
   ↓
Give control back
   ↓
Other work runs
   ↓
I/O completes
   ↓
Resume function
```

**Important:** `await` does **not** create a new thread.

> **`await` pauses the function's progress while allowing the event loop to handle other work until the awaited operation is ready.**
> 

Also remember: `async/await` does not magically make CPU-heavy work non-blocking. A long CPU operation on the event-loop thread can still block other work.

# 8. Goroutines / Virtual Threads

Go uses **goroutines**, which are lightweight, runtime-managed execution units.

```go
go myFunction()
```

The Go runtime scheduler manages many goroutines and schedules them onto a smaller number of OS threads.

```
Many Goroutines
      ↓
Go Runtime Scheduler
      ↓
OS Threads
```

The important distinction is:

- **OS thread** → managed by the operating system and relatively expensive
- **Goroutine** → lightweight and managed by the Go runtime

# 9. Async/Await Under the Hood — State Machines

When an asynchronous function reaches an `await`, the program needs to remember **where execution should continue** after the asynchronous operation finishes.

Conceptually, the function can be viewed as states:

```
State 0 → Start
   ↓
State 1 → await getUser()
   ↓
State 2 → await getOrders()
   ↓
State 3 → return
```

The saved state allows the function to resume from the correct point later.

> **State machine = remember the current execution state so async work can suspend and resume correctly.**
> 

# 10. Race Conditions & Shared State

A **race condition** occurs when multiple concurrent tasks access or modify shared state and the final result depends on their timing or ordering.

Example:

```
balance = 100

A reads 100
B reads 100
A writes 50
B writes 50
```

After two ₹50 withdrawals, we would expect `0`, but the incorrect final value could be `50` because both operations read the old value before either write was observed.

> **Concurrent access + shared mutable state → possible race condition.**
> 

# 11. Locks & Mutexes

A **mutex** means **mutual exclusion**. It ensures that only one task can enter a protected critical section at a time.

```
Lock
  ↓
Access / modify shared data
  ↓
Unlock
```

Example concept:

```
A → 🔒 → modify balance → 🔓
                            ↓
B ───────────────────────→ 🔒 → modify balance
```

A mutex prevents multiple tasks from modifying the protected state simultaneously.

### Trade-off

Locks solve race conditions, but they introduce waiting. If one task holds a lock, other tasks that need the same protected resource may have to wait.

> **Race condition → protect shared state → Mutex / Lock**
> 

# ⭐ Placement Cheat Sheet

| Concept | Remember |
| --- | --- |
| Concurrency | Multiple tasks in progress |
| Parallelism | Multiple tasks executing simultaneously |
| I/O-bound | Mostly waiting |
| CPU-bound | Mostly computing |
| Thread | OS-managed execution unit |
| Context switch | Save one thread's state → restore another |
| Event loop | Efficient model for I/O concurrency |
| `await` | Give control back while waiting for async I/O |
| Goroutine | Lightweight Go execution unit |
| State machine | Saves where async execution should resume |
| Race condition | Timing-dependent shared-state bug |
| Mutex | One task at a time in a critical section |

# 🎤 Common Placement Questions

### Why is context switching overhead?

Because the OS must save the current thread's execution state and restore another thread's state. This consumes CPU time without directly doing the application's actual work.

### Why are event loops good for I/O-bound workloads?

Because tasks can give control back while waiting for I/O, allowing the same event-loop thread to process other work instead of blocking.

### Can `await` create a new thread?

No. `await` is a mechanism for suspending the current asynchronous function's progress and resuming it later; it does not inherently create a new OS thread.

### What is a race condition?

A bug where the result depends on the timing/order of concurrent operations accessing shared state.

### What is a mutex?

A synchronization mechanism that provides mutual exclusion so only one task can access a protected critical section at a time.

<aside>
🔥

**5 lines to memorize:**

**I/O-bound → waiting → concurrency**  

**CPU-bound → computation → parallelism**  

**Too many threads → memory + context-switching overhead**  

**Event loop → don't block it**  

**Shared mutable state → race condition → mutex/lock**

</aside>