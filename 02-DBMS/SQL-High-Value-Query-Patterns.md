# 📊 SQL Placement — High-Value Query Patterns (Master Revision Guide)

> **Core Philosophy**: Don't memorize 100 isolated syntax queries. Memorize **reusable query patterns** (subqueries, CTEs, joins, window functions) that you can compose to solve any complex interview question.

---

## ⚡ Quick-Lookup: Problem → Pattern Mapping

| Problem Scenario | Core Technique / Pattern |
| :--- | :--- |
| **Nth / 2nd Highest Value** | `DENSE_RANK() OVER (ORDER BY col DESC)` or `MAX() + subquery` |
| **Top N per Group** | `DENSE_RANK() / ROW_NUMBER() OVER (PARTITION BY ... ORDER BY ...)` |
| **Highest / Best Row per Group** | `ROW_NUMBER() OVER (PARTITION BY ... ORDER BY ... DESC) = 1` |
| **Previous / Next Row Comparison** | `LAG(col) / LEAD(col) OVER (ORDER BY ...)` |
| **Running Total (Cumulative Sum)** | `SUM(col) OVER (ORDER BY ...)` *(Add `PARTITION BY` for per-group)* |
| **Find Duplicates** | `GROUP BY col HAVING COUNT(*) > 1` |
| **Deduplicate / Keep 1 Row** | `ROW_NUMBER() OVER (PARTITION BY duplicate_cols ORDER BY id) = 1` |
| **Rows with No Match (Anti-Join)** | `NOT EXISTS (...)` or `LEFT JOIN ... WHERE right.id IS NULL` |
| **Rows with At Least One Match** | `EXISTS (...)` |
| **Conditional Counts / Pivots** | `SUM(CASE WHEN condition THEN 1 ELSE 0 END)` |
| **Filter Above / Below Group Average** | Window `AVG() OVER (PARTITION BY ...)` or Correlated Subquery |
| **Manager vs Employee Comparison** | Self-Join (`Employee e JOIN Employee m ON e.manager_id = m.id`) |
| **Consecutive Records (e.g., 3 in a row)** | `LAG()` / `LEAD()` or Self-Join on `id + 1` |
| **Safe Division (Avoid Divide by 0)** | `numerator / NULLIF(denominator, 0)` |
| **Replace NULL Values** | `COALESCE(column, default_value)` |

---

# 🔴 Tier 1: Top-Priority Patterns (Must Know)

---

### 1. Top N Per Group
**Importance**: Critical (Asked in almost every tech/analytics interview)

#### Problem
Find the top 3 highest-paid employees in every department.

```sql
SELECT *
FROM (
    SELECT 
        e.*,
        DENSE_RANK() OVER (
            PARTITION BY department
            ORDER BY salary DESC
        ) AS rnk
    FROM Employee e
) t
WHERE rnk <= 3;
```

#### Mental Model
$$\text{Group by Partition} \longrightarrow \text{Rank within Group} \longrightarrow \text{Filter via Outer WHERE}$$

#### Which Ranking Function to Pick?
- `ROW_NUMBER()`: Exactly $N$ rows (arbitrary tiebreaker).
- `RANK()`: Ties get same rank; skips ranks afterward ($1, 2, 2, 4$).
- `DENSE_RANK()`: Ties get same rank; **no gaps** ($1, 2, 2, 3$).

---

### 2. Nth Highest Value (Overall & Per Group)
**Importance**: Critical

#### A. Overall Nth Highest (Window Function)
```sql
-- Example: 3rd highest distinct salary
SELECT salary
FROM (
    SELECT 
        salary,
        DENSE_RANK() OVER (ORDER BY salary DESC) AS rnk
    FROM Employee
) t
WHERE rnk = 3;
```

#### B. 2nd Highest with NULL Fallback (Subquery Pattern)
```sql
SELECT MAX(salary) AS SecondHighestSalary
FROM Employee
WHERE salary < (
    SELECT MAX(salary)
    FROM Employee
);
```
> **Interview Insight**: `MAX()` returns `NULL` automatically if no matching row exists (matching LeetCode/HackerRank requirements when only 1 distinct salary exists).

#### C. Nth Highest Per Group
```sql
-- 2nd highest salary in each department
SELECT *
FROM (
    SELECT 
        e.*,
        DENSE_RANK() OVER (
            PARTITION BY department
            ORDER BY salary DESC
        ) AS rnk
    FROM Employee e
) t
WHERE rnk = 2;
```

---

### 3. Comparing Current Row with Previous / Next (`LAG` / `LEAD`)
**Importance**: Critical

#### Problem
Find dates where sales increased compared to the previous recorded day.

```sql
SELECT *
FROM (
    SELECT 
        date,
        sales,
        LAG(sales) OVER (ORDER BY date) AS prev_sales
    FROM Sales
) t
WHERE sales > prev_sales;
```

#### Key Rules:
- `LAG(col, offset)`: Accesses row before current (default offset = 1).
- `LEAD(col, offset)`: Accesses row after current.
- Avoids expensive self-joins when calculating day-over-day growth, gaps, or churn intervals.

---

### 4. Running Totals (Cumulative Sums)
**Importance**: Critical

#### A. Overall Running Total
```sql
SELECT 
    date,
    amount,
    SUM(amount) OVER (ORDER BY date) AS running_total
FROM Orders;
```

#### B. Running Total Per Department / Category
```sql
SELECT 
    department,
    date,
    amount,
    SUM(amount) OVER (
        PARTITION BY department
        ORDER BY date
    ) AS dept_running_total
FROM Sales;
```

---

### 5. Duplicate Detection and Deduplication
**Importance**: Critical

#### A. Find Duplicate Keys
```sql
SELECT email
FROM Employee
GROUP BY email
HAVING COUNT(*) > 1;
```

#### B. Remove / Filter Duplicates (Keep Only 1 Row)
```sql
-- Select unique records (keeping lowest ID)
SELECT *
FROM (
    SELECT 
        t.*,
        ROW_NUMBER() OVER (
            PARTITION BY email
            ORDER BY id ASC
        ) AS rn
    FROM Employee t
) x
WHERE rn = 1;
```

#### C. Delete Duplicates from Table
```sql
DELETE FROM Employee
WHERE id IN (
    SELECT id
    FROM (
        SELECT 
            id,
            ROW_NUMBER() OVER (
                PARTITION BY email
                ORDER BY id ASC
            ) AS rn
        FROM Employee
    ) x
    WHERE rn > 1
);
```

---

### 6. Missing Matches & Anti-Joins (Records in A but NOT in B)
**Importance**: Critical

#### Pattern A: `NOT EXISTS` (Recommended for Performance & NULL safety)
```sql
SELECT c.*
FROM Customers c
WHERE NOT EXISTS (
    SELECT 1
    FROM Orders o
    WHERE o.customer_id = c.id
);
```

#### Pattern B: `LEFT JOIN + IS NULL`
```sql
SELECT c.*
FROM Customers c
LEFT JOIN Orders o 
    ON c.id = o.customer_id
WHERE o.customer_id IS NULL;
```

---

### 7. Conditional Aggregation (Pivoting & Filtered Counts)
**Importance**: Critical

#### A. Count Multiple Categories in One Query
```sql
SELECT
    department,
    COUNT(*) AS total_employees,
    SUM(CASE WHEN salary > 80000 THEN 1 ELSE 0 END) AS high_earners,
    SUM(CASE WHEN salary <= 80000 THEN 1 ELSE 0 END) AS standard_earners
FROM Employee
GROUP BY department;
```

#### B. Conditional Filtering in `HAVING`
```sql
-- Departments with at least 3 high earners
SELECT department
FROM Employee
GROUP BY department
HAVING SUM(CASE WHEN salary > 80000 THEN 1 ELSE 0 END) >= 3;
```

---

### 8. Self-Joins (Hierarchical & Entity Relationships)
**Importance**: Critical

#### Problem
Find all employees who earn more than their direct manager.

```sql
SELECT 
    e.name AS employee_name,
    e.salary AS emp_salary,
    m.name AS manager_name,
    m.salary AS manager_salary
FROM Employee e
JOIN Employee m 
    ON e.manager_id = m.id
WHERE e.salary > m.salary;
```

---

### 9. Consecutive Records (e.g., 3 Consecutive Logins / Numbers)
**Importance**: High

#### Approach 1: `LAG()` and `LEAD()`
```sql
SELECT DISTINCT num AS ConsecutiveNums
FROM (
    SELECT 
        num,
        LAG(num, 1) OVER (ORDER BY id) AS prev_1,
        LEAD(num, 1) OVER (ORDER BY id) AS next_1
    FROM Logs
) t
WHERE num = prev_1 AND num = next_1;
```

#### Approach 2: Self-Join
```sql
SELECT DISTINCT l1.num AS ConsecutiveNums
FROM Logs l1
JOIN Logs l2 ON l2.id = l1.id + 1
JOIN Logs l3 ON l3.id = l1.id + 2
WHERE l1.num = l2.num AND l2.num = l3.num;
```

---

# 🟡 Tier 2: High-Value Aggregation & Comparative Patterns

---

### 10. Filter Against Group Statistics (Above Average)
**Importance**: High

#### Problem
Find employees earning more than their department's average salary.

```sql
SELECT *
FROM (
    SELECT 
        e.*,
        AVG(salary) OVER (PARTITION BY department) AS dept_avg_salary
    FROM Employee e
) t
WHERE salary > dept_avg_salary;
```

---

### 11. Retrieve Full Row for Group Maximum (Not Just MAX Value)
**Importance**: High

> **Trap**: `SELECT department, MAX(salary), employee_name FROM ...` fails in standard SQL because `employee_name` is non-aggregated.

#### Clean Solution:
```sql
SELECT *
FROM (
    SELECT 
        e.*,
        ROW_NUMBER() OVER (
            PARTITION BY department
            ORDER BY salary DESC
        ) AS rn
    FROM Employee e
) t
WHERE rn = 1;
```

---

### 12. First / Last Event per Entity
**Importance**: High

```sql
-- Latest order for every customer
SELECT *
FROM (
    SELECT 
        o.*,
        ROW_NUMBER() OVER (
            PARTITION BY customer_id
            ORDER BY order_date DESC, id DESC
        ) AS rn
    FROM Orders o
) t
WHERE rn = 1;
```

---

### 13. Conditional Average vs Conditional Sum
**Importance**: Medium-High

```sql
SELECT 
    -- SUM needs ELSE 0 so addition doesn't fail on NULL
    SUM(CASE WHEN category = 'Electronics' THEN amount ELSE 0 END) AS electronics_sum,
    
    -- AVG must NOT have ELSE 0, because AVG() ignores NULLs but includes 0s in the denominator!
    AVG(CASE WHEN category = 'Electronics' THEN amount END) AS electronics_avg
FROM Sales;
```

---

### 14. NULL Safety & Defensive Division
**Importance**: Medium-High

```sql
-- 1. Replace NULL values
SELECT name, COALESCE(phone, 'N/A') AS contact_phone 
FROM Customers;

-- 2. Prevent division by zero (NULLIF turns 0 into NULL; x / NULL = NULL)
SELECT 
    revenue,
    clicks,
    revenue / NULLIF(clicks, 0) AS revenue_per_click
FROM Campaigns;
```

---

### 15. Set Difference: Active in Period A but Inactive in Period B
**Importance**: Medium-High

```sql
-- Customers who purchased in Jan 2026 but made no purchases in Feb 2026
SELECT DISTINCT o1.customer_id
FROM Orders o1
WHERE o1.order_date BETWEEN '2026-01-01' AND '2026-01-31'
  AND NOT EXISTS (
      SELECT 1
      FROM Orders o2
      WHERE o2.customer_id = o1.customer_id
        AND o2.order_date BETWEEN '2026-02-01' AND '2026-02-28'
  );
```

---

# 🟢 Tier 3: Complex Multi-Pattern Composition (CTEs)

---

### 16. Combining Multiple Patterns Step-by-Step
**Importance**: Medium

#### Problem
Find the top 2 highest-paid employees in each department whose salary is strictly greater than their department's average.

```sql
WITH DeptStatistics AS (
    -- Step 1: Calculate department-level metric
    SELECT 
        e.*,
        AVG(salary) OVER (PARTITION BY department) AS dept_avg_salary
    FROM Employee e
),
FilteredRanked AS (
    -- Step 2: Filter above average and rank remaining
    SELECT 
        d.*,
        DENSE_RANK() OVER (
            PARTITION BY department
            ORDER BY salary DESC
        ) AS salary_rank
    FROM DeptStatistics d
    WHERE salary > dept_avg_salary
)
-- Step 3: Final top-N extraction
SELECT 
    id,
    name,
    department,
    salary,
    dept_avg_salary,
    salary_rank
FROM FilteredRanked
WHERE salary_rank <= 2
ORDER BY department, salary_rank;
```

---

## 🧠 The 4-Step Mental Framework for Live Interviews

When handed an interview SQL problem:

1. **Identify the Grain**: What does one row in the output represent? (*One customer? One department? One transaction?*)
2. **Identify the Filtering Scope**: Is it global or partitioned? (*Overall top 3 vs Top 3 per department* $\rightarrow$ triggers `PARTITION BY`).
3. **Select the Primary Pattern**:
   - Sequential/Comparison $\rightarrow$ `LAG` / `LEAD`
   - Ranking / Top-N $\rightarrow$ `DENSE_RANK()` / `ROW_NUMBER()`
   - Relationship $\rightarrow$ `JOIN` / `Self-Join`
   - Exclusion $\rightarrow$ `NOT EXISTS`
   - Group conditions $\rightarrow$ `CASE` inside `SUM()` / `HAVING`
4. **Assemble with CTEs**: Never write an unreadable 5-level nested query during an interview. Break each logical step into a named Common Table Expression (`WITH ...`).
