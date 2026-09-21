# 🗄️ Database Management Systems (DBMS) — Interview & Placement Notes

This folder contains complete revision materials, SQL problem-solving patterns, advanced syntax reference sheets, theory notes, and interview question banks for Database Management Systems and SQL.

---

## 📑 Contents

| File | Type | Description |
|---|---|---|
| 💳 [Transactions & Concurrency Control — Master Guide](./Transactions-and-Concurrency-Control.md) | **Master Guide** | Comprehensive placement reference: Operations (`Read`, `Write`, `Commit`, `Rollback`), Swiggy/Banking models, 6 transaction states, ACID properties, anomalies, ANSI isolation levels, Recoverability hierarchy, Precedence Graphs, View Serializability, 2PL variants (Strict, Rigorous, Conservative), Timestamp Ordering (BTO, Thomas' Write Rule), and ARIES Crash Recovery (WAL, Shadow Paging). |
| 🌟 [DBMS Advanced Concepts & Internals](./DBMS-Advanced-Concepts.md) | **Deep-Dive Notes** | Concurrency Control (2PL, MVCC), Deadlocks (Wait-Die, Wound-Wait), Isolation Levels, B+ Trees, Buffer Pool & Slotted Pages, WAL & ARIES Recovery, Candidate Key Algorithms, 2PC & Replication. |
| 📝 [SQL Placement — High-Value Query Patterns](./SQL-High-Value-Query-Patterns.md) | Master Query Guide | Top-priority SQL interview patterns (Ranking, Window Functions, LAG/LEAD, Deduplication, Anti-joins, Conditional Aggregations) arranged in descending priority. |
| 📝 [SQL Advanced Syntax Cheat Sheet](./SQL-Advanced-Syntax-CheatSheet.md) | Advanced Syntax Sheet | Non-trivial syntax reference: Window frame clauses (`ROWS BETWEEN`), Statistical functions (`NTILE`, `CUME_DIST`), Recursive CTEs, Date/Time math, String regex, `ROLLUP`, and `FOR UPDATE` locking. |
| 📄 [DBMS Full Notes](./DBMS_Full_Notes.pdf) | Comprehensive PDF | Complete coverage of Relational Models, ER Diagrams, Normalization (1NF to BCNF), Indexing (B-Trees/B+ Trees), Transactions & ACID properties, and Concurrency Control. |
| 📄 [DBMS Interview Questions](./DBMS%20INTERVIEW%20QUESTION.pdf) | Question Bank | High-frequency placement questions on SQL queries, joins, isolation levels, locks, and indexing. |

---

## 🎯 Key Placement Topics Checklist

- [x] **Transactions & Concurrency Core**: ACID Properties, Transaction State Machine, Dirty Read, Non-repeatable Read, Phantom Read, Lost Updates, ANSI Isolation Levels.
- [x] **Schedules & Serializability**: Recoverable vs Irrecoverable, Cascading vs Cascadeless vs Strict, Precedence Graphs, Topological Sort, View Equivalence & Blind Writes.
- [x] **Concurrency Control Protocols**: Shared/Exclusive Locks, 2PL, Strict 2PL, Rigorous 2PL, Conservative 2PL, Basic Timestamp Ordering (BTO), Thomas' Write Rule.
- [x] **Crash Recovery**: Write-Ahead Logging (WAL), STEAL/NO-FORCE, Checkpointing, ARIES (Analysis, Redo, Undo), Shadow Paging.
- [ ] **SQL Query Mastery**: Window Functions (`ROW_NUMBER`, `RANK`, `DENSE_RANK`), `LAG`/`LEAD`, `SUM() OVER (PARTITION BY ... ROWS BETWEEN ...)`, `NOT EXISTS`, Recursive CTEs, `FOR UPDATE`.
- [ ] **Relational Database Concepts**: Primary Key, Foreign Key, Candidate Key, Super Key, Unique Constraints.
- [ ] **Normalization**: Functional Dependencies, 1NF, 2NF, 3NF, BCNF, and Lossless Decomposition.
- [ ] **Indexing & Storage**: Clustered vs Non-Clustered Index, Composite Indexes, B-Tree & B+ Tree Indexing internals, Hashing.
- [ ] **NoSQL vs SQL**: When to choose RDBMS (PostgreSQL/MySQL) vs NoSQL (MongoDB/Cassandra/Redis).
