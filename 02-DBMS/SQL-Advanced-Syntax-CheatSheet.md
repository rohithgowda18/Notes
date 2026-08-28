# 🛠️ SQL Advanced Syntax Cheat Sheet for Tech Placements

> **Target Audience**: This guide skips trivial syntax (`SELECT`, basic `WHERE`, simple `ORDER BY`) and focuses purely on **intermediate-to-advanced syntax**, frame clauses, recursive CTEs, string/date functions, and database primitives tested in technical rounds.

---

## 📑 Index
1. [Window Function Frame Clauses (`ROWS / RANGE BETWEEN`)](#1-window-function-frame-clauses)
2. [Statistical & Advanced Window Functions (`NTILE`, `CUME_DIST`, `FIRST_VALUE`)](#2-statistical--advanced-window-functions)
3. [Recursive CTEs (Hierarchies & Series Generation)](#3-recursive-ctes)
4. [Date & Time Manipulation Functions](#4-date--time-manipulation-functions)
5. [String Formatting, Splitting & Regex](#5-string-formatting-splitting--regex)
6. [Advanced Grouping (`ROLLUP`, `CUBE`, `GROUP_CONCAT` / `STRING_AGG`)](#6-advanced-grouping-rollup-cube-group_concat)
7. [Set Operations (`UNION ALL`, `INTERSECT`, `EXCEPT`)](#7-set-operations)
8. [Transaction Control & Row-Level Locking (`FOR UPDATE`)](#8-transaction-control--row-level-locking)
9. [DDL & Indexing Constraints Syntax](#9-ddl--indexing-constraints-syntax)

---

## 1. Window Function Frame Clauses

Standard window functions apply to the entire partition by default unless you restrict the window frame.

### Complete Syntax Template
```sql
FUNCTION() OVER (
    PARTITION BY partition_col
    ORDER BY sort_col
    ROWS | RANGE BETWEEN <frame_start> AND <frame_end>
)
```

### Frame Boundaries:
- `UNBOUNDED PRECEDING`: First row of the partition.
- `N PRECEDING`: $N$ rows before the current row.
- `CURRENT ROW`: The active row.
- `N FOLLOWING`: $N$ rows after the current row.
- `UNBOUNDED FOLLOWING`: Last row of the partition.

### Practical Interview Examples:

#### A. 3-Day Moving Average (Current Day + 2 Preceding Days)
```sql
SELECT 
    date,
    amount,
    AVG(amount) OVER (
        ORDER BY date
        ROWS BETWEEN 2 PRECEDING AND CURRENT ROW
    ) AS 3_day_moving_avg
FROM DailySales;
```

#### B. Centered 7-Day Window (3 Preceding, Current, 3 Following)
```sql
SELECT 
    date,
    amount,
    AVG(amount) OVER (
        ORDER BY date
        ROWS BETWEEN 3 PRECEDING AND 3 FOLLOWING
    ) AS smoothed_avg
FROM Metrics;
```

> ⚠️ **ROWS vs RANGE**:
> - `ROWS`: Treats duplicates as distinct physical rows.
> - `RANGE`: Treats duplicate values in `ORDER BY` as a single logical bundle. Always prefer `ROWS` unless specific value-based range logic is required.

---

## 2. Statistical & Advanced Window Functions

### A. `NTILE(n)` — Splitting into Percentiles / Quartiles
Divides ordered partition into $n$ roughly equal buckets (e.g., $n=4$ for Quartiles, $n=100$ for Percentiles).

```sql
-- Classify salaries into 4 quartiles (1 = Top 25%, 4 = Bottom 25%)
SELECT 
    employee_name,
    salary,
    NTILE(4) OVER (ORDER BY salary DESC) AS salary_quartile
FROM Employee;
```

### B. `FIRST_VALUE()` & `LAST_VALUE()`
```sql
SELECT 
    department,
    employee_name,
    salary,
    -- First salary in department
    FIRST_VALUE(employee_name) OVER (
        PARTITION BY department 
        ORDER BY salary DESC
    ) AS highest_earner,
    
    -- Last salary in department (MUST include UNBOUNDED FOLLOWING)
    LAST_VALUE(employee_name) OVER (
        PARTITION BY department 
        ORDER BY salary DESC
        ROWS BETWEEN CURRENT ROW AND UNBOUNDED FOLLOWING
    ) AS lowest_earner
FROM Employee;
```

### C. `CUME_DIST()` & `PERCENT_RANK()`
- `CUME_DIST()`: Cumulative distribution ($\frac{\text{rows with value} \le \text{current}}{\text{total rows}}$) $\in (0, 1]$.
- `PERCENT_RANK()`: Relative rank ($\frac{\text{rank} - 1}{\text{total rows} - 1}$) $\in [0, 1]$.

```sql
SELECT 
    score,
    CUME_DIST() OVER (ORDER BY score) AS cumulative_distribution,
    PERCENT_RANK() OVER (ORDER BY score) AS percentile_ranking
FROM ExamScores;
```

---

## 3. Recursive CTEs

Used for tree structures (Manager $\rightarrow$ Employee hierarchy) and generating series (dates, sequences).

### Syntax Anatomy
```sql
WITH RECURSIVE CteName AS (
    -- 1. Anchor Member (Base Case)
    SELECT ...
    FROM Table
    WHERE base_condition
    
    UNION ALL
    
    -- 2. Recursive Member (References CteName)
    SELECT ...
    FROM Table t
    JOIN CteName c ON t.parent_id = c.id
)
SELECT * FROM CteName;
```

### Practical Examples:

#### A. Generate Number Series 1 to 10 (Without a Table)
```sql
WITH RECURSIVE Numbers AS (
    SELECT 1 AS num
    UNION ALL
    SELECT num + 1 
    FROM Numbers 
    WHERE num < 10
)
SELECT num FROM Numbers;
```

#### B. Employee Hierarchy Level & Path
```sql
WITH RECURSIVE OrgTree AS (
    -- Anchor: CEO / Top Level (No manager)
    SELECT 
        id, 
        name, 
        manager_id, 
        1 AS level,
        CAST(name AS VARCHAR(255)) AS path
    FROM Employee
    WHERE manager_id IS NULL

    UNION ALL

    -- Recursive: Find subordinates
    SELECT 
        e.id, 
        e.name, 
        e.manager_id, 
        o.level + 1 AS level,
        CONCAT(o.path, ' -> ', e.name) AS path
    FROM Employee e
    JOIN OrgTree o ON e.manager_id = o.id
)
SELECT * FROM OrgTree ORDER BY level, id;
```

---

## 4. Date & Time Manipulation Functions

### Common Placement Date Calculations

| Operation | PostgreSQL / Standard | MySQL | SQL Server |
| :--- | :--- | :--- | :--- |
| **Difference in Days** | `DATE_PART('day', d2 - d1)` | `DATEDIFF(d2, d1)` | `DATEDIFF(day, d1, d2)` |
| **Add 7 Days** | `date_col + INTERVAL '7 days'` | `DATE_ADD(date_col, INTERVAL 7 DAY)` | `DATEADD(day, 7, date_col)` |
| **Extract Month** | `EXTRACT(MONTH FROM date_col)` | `MONTH(date_col)` | `MONTH(date_col)` |
| **Truncate to Month** | `DATE_TRUNC('month', date_col)` | `DATE_FORMAT(date_col, '%Y-%m-01')` | `DATETRUNC(month, date_col)` |
| **Current Timestamp** | `CURRENT_TIMESTAMP` / `NOW()` | `NOW()` | `GETDATE()` |

### Find Missing Dates in a Range:
```sql
-- Generate continuous calendar and check missing sales days
WITH RECURSIVE Calendar AS (
    SELECT '2026-01-01'::DATE AS dt
    UNION ALL
    SELECT dt + INTERVAL '1 day'
    FROM Calendar
    WHERE dt < '2026-01-31'
)
SELECT c.dt AS missing_date
FROM Calendar c
LEFT JOIN Sales s ON c.dt = s.sale_date
WHERE s.sale_date IS NULL;
```

---

## 5. String Formatting, Splitting & Regex

### A. Concatenation with Separator
```sql
-- CONCAT_WS ignores NULL values automatically
SELECT CONCAT_WS(' ', first_name, middle_name, last_name) AS full_name
FROM Users;
```

### B. Substring Extraction & Trimming
```sql
-- SUBSTRING(str, start_pos, length)  [1-indexed in SQL!]
SELECT 
    email,
    SUBSTRING(email, 1, INSTR(email, '@') - 1) AS username,
    SUBSTRING(email, INSTR(email, '@') + 1) AS domain
FROM Users;
```

### C. Regex Matching & Replacement
```sql
-- Find valid format email addresses
SELECT email
FROM Users
WHERE email REGEXP '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$';
```

---

## 6. Advanced Grouping (`ROLLUP`, `CUBE`, `GROUP_CONCAT`)

### A. `ROLLUP` (Subtotals + Grand Total)
Calculates hierarchical aggregation from right to left.

```sql
SELECT 
    department, 
    job_title, 
    SUM(salary) AS total_salary
FROM Employee
GROUP BY ROLLUP (department, job_title);

-- Generates:
-- 1. (department, job_title) subtotal
-- 2. (department) subtotal
-- 3. Grand Total across all departments
```

### B. `GROUP_CONCAT()` / `STRING_AGG()` (Aggregate into Comma-Separated List)
```sql
-- MySQL syntax
SELECT 
    department,
    GROUP_CONCAT(employee_name ORDER BY salary DESC SEPARATOR ', ') AS team_members
FROM Employee
GROUP BY department;

-- PostgreSQL syntax
SELECT 
    department,
    STRING_AGG(employee_name, ', ' ORDER BY salary DESC) AS team_members
FROM Employee
GROUP BY department;
```

---

## 7. Set Operations

| Operator | Action | Deduplication |
| :--- | :--- | :--- |
| `UNION` | Merges query results | **Removes duplicates** (Slower) |
| `UNION ALL` | Merges query results | **Keeps all duplicates** (Fastest) |
| `INTERSECT` | Returns only rows present in both | Removes duplicates |
| `EXCEPT` / `MINUS` | Returns rows in Query 1 that are NOT in Query 2 | Removes duplicates |

```sql
-- Find customers who ordered in 2025 and also in 2026
SELECT customer_id FROM Orders WHERE YEAR(order_date) = 2025
INTERSECT
SELECT customer_id FROM Orders WHERE YEAR(order_date) = 2026;
```

---

## 8. Transaction Control & Row-Level Locking

Essential for Backend and Database Concurrency rounds.

### A. Explicit Transaction Blocks
```sql
START TRANSACTION;  -- or BEGIN TRANSACTION

UPDATE Accounts SET balance = balance - 500 WHERE id = 1;
UPDATE Accounts SET balance = balance + 500 WHERE id = 2;

-- If any step fails:
ROLLBACK;

-- If successful:
COMMIT;
```

### B. Pessimistic Write Lock (`FOR UPDATE`)
Locks selected rows against other concurrent transactions attempting to read/write.

```sql
-- Select and lock a seat for reservation
START TRANSACTION;

SELECT seat_number, status
FROM FlightSeats
WHERE flight_id = 'AI-101' AND seat_number = '12A'
FOR UPDATE;

-- Update status and finalize
UPDATE FlightSeats SET status = 'BOOKED' WHERE flight_id = 'AI-101' AND seat_number = '12A';
COMMIT;
```

---

## 9. DDL & Indexing Constraints Syntax

### A. Create Table with Multi-Column & Check Constraints
```sql
CREATE TABLE Orders (
    order_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_positive_amount CHECK (amount > 0),
    CONSTRAINT fk_customer FOREIGN KEY (customer_id) 
        REFERENCES Customers(id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE
);
```

### B. Composite & Partial Indexing
```sql
-- Composite Index (Order matters! Leading column rule)
CREATE INDEX idx_dept_salary ON Employee(department, salary DESC);

-- Unique constraint index
CREATE UNIQUE INDEX idx_user_email ON Users(email);
```
