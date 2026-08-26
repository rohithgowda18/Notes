# Java Streams

# Java 8 Stream API

---

## What is Stream API?

The **Stream API**, introduced in **Java 8**, provides a clean and functional way to process data from collections.

A stream does **not store data**. It processes elements from a source using a sequence of operations.

### Basic Example

```java
List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5);

numbers.stream()
       .filter(n -> n % 2 == 0)
       .forEach(System.out::println);
```

**Output:**

```
2
4
```

---

## Why Use Streams?

Streams can make collection processing:

- More concise
- Easier to read
- Easier to combine into pipelines
- Suitable for functional-style programming
- Capable of parallel processing when appropriate

> Streams are not automatically better than loops. Use whichever makes the code clearer and more appropriate.
> 

---

# Stream Pipeline

A stream usually has three parts.

### 1. Source

The data from which the stream is created.

```java
List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5);

Stream<Integer> stream = numbers.stream();
```

### 2. Intermediate Operations

Transform or filter data.

Examples:

```java
filter()
map()
sorted()
distinct()
limit()
flatMap()
```

These operations are **lazy**.

### 3. Terminal Operation

Produces the final result and starts stream processing.

Examples:

```java
forEach()
collect()
count()
findFirst()
reduce()
```

---

# Intermediate Operations

## `filter()`

Selects elements based on a condition.

```java
List<Integer> evenNumbers = numbers.stream()
    .filter(n -> n % 2 == 0)
    .collect(Collectors.toList());
```

**Result:**

```
[2, 4]
```

`filter()` uses a `Predicate<T>`:

```
true  → keep element
false → discard element
```

---

## `map()`

Transforms every element.

```java
List<Integer> squares = numbers.stream()
    .map(n -> n * n)
    .collect(Collectors.toList());
```

**Result:**

```
[1, 4, 9, 16, 25]
```

Common uses:

- Convert objects
- Extract fields
- Perform calculations
- Change values

---

## `sorted()`

Sorts elements.

```java
numbers.stream()
       .sorted()
       .forEach(System.out::println);
```

Reverse order:

```java
numbers.stream()
       .sorted(Comparator.reverseOrder())
       .forEach(System.out::println);
```

---

## `distinct()`

Removes duplicates.

```java
List<Integer> numbers = Arrays.asList(1, 2, 2, 3, 3, 4);

numbers.stream()
       .distinct()
       .forEach(System.out::println);
```

**Output:**

```
1
2
3
4
```

---

## `limit()`

Limits the number of elements.

```java
numbers.stream()
       .limit(3)
       .forEach(System.out::println);
```

Only the first three elements are processed.

---

## `flatMap()`

Used to flatten nested collections.

```java
List<List<Integer>> list = Arrays.asList(
    Arrays.asList(1, 2),
    Arrays.asList(3, 4)
);

list.stream()
    .flatMap(List::stream)
    .forEach(System.out::println);
```

**Output:**

```
1
2
3
4
```

Think of it as:

```
map + flatten
```

---

# Terminal Operations

## `forEach()`

Processes every element.

```java
numbers.stream()
       .forEach(System.out::println);
```

---

## `collect()`

Collects results into a collection.

```java
List<Integer> result = numbers.stream()
    .filter(n -> n > 2)
    .collect(Collectors.toList());
```

**Result:**

```
[3, 4, 5]
```

Common collectors:

```java
Collectors.toList()
Collectors.toSet()
Collectors.joining()
Collectors.groupingBy()
```

---

## `count()`

Counts elements.

```java
long count = numbers.stream()
    .filter(n -> n % 2 == 0)
    .count();
```

**Result:**

```
2
```

---

## `findFirst()`

Finds the first matching element.

```java
Optional<Integer> result = numbers.stream()
    .filter(n -> n > 3)
    .findFirst();
```

**Result:** `4`

Because a match may not exist, the result is an `Optional`.

---

## `reduce()`

Combines elements into one value.

```java
int sum = numbers.stream()
    .reduce(0, (a, b) -> a + b);
```

**Result:**

```
15
```

Shorter version:

```java
int sum = numbers.stream()
    .reduce(0, Integer::sum);
```

---

# Common Stream Methods

| Method | Type | Purpose |
| --- | --- | --- |
| `filter()` | Intermediate | Select elements |
| `map()` | Intermediate | Transform elements |
| `flatMap()` | Intermediate | Flatten nested data |
| `sorted()` | Intermediate | Sort elements |
| `distinct()` | Intermediate | Remove duplicates |
| `limit()` | Intermediate | Limit elements |
| `forEach()` | Terminal | Process elements |
| `collect()` | Terminal | Collect results |
| `count()` | Terminal | Count elements |
| `findFirst()` | Terminal | Find first match |
| `reduce()` | Terminal | Combine elements |

---

# Combining Operations

The main strength of streams is chaining operations.

```java
List<Integer> result = numbers.stream()
    .filter(n -> n % 2 == 0)
    .map(n -> n * n)
    .sorted()
    .collect(Collectors.toList());
```

For:

```
[5, 2, 4, 1, 3]
```

the result is:

```
[4, 16]
```

Pipeline:

```
numbers
   ↓
filter()
   ↓
map()
   ↓
sorted()
   ↓
collect()
   ↓
result
```

---

# Stream API with Strings

Streams are useful for searching and filtering strings.

```java
List<String> names = Arrays.asList("Ram", "Shyam", "Amit");

names.stream()
     .filter(name -> name.startsWith("A"))
     .forEach(System.out::println);
```

**Output:**

```
Amit
```

---

# Stream vs Traditional Loop

### Traditional

```java
List<Integer> evenNumbers = new ArrayList<>();

for (Integer number : numbers) {
    if (number % 2 == 0) {
        evenNumbers.add(number);
    }
}
```

### Stream

```java
List<Integer> evenNumbers = numbers.stream()
    .filter(n -> n % 2 == 0)
    .collect(Collectors.toList());
```

---

# Parallel Streams

Java supports parallel processing with:

```java
numbers.parallelStream()
       .forEach(System.out::println);
```

Parallel streams can use multiple CPU cores.

### Important

Parallel streams are **not always faster**.

Consider:

- Dataset size
- Operation complexity
- CPU availability
- Thread safety
- Ordering requirements

With `parallelStream()`, `forEach()` does not guarantee encounter order.

If order matters:

```java
numbers.parallelStream()
       .forEachOrdered(System.out::println);
```

Avoid modifying shared mutable data inside parallel stream operations.

---

# Advantages

- Less boilerplate
- Clean and readable pipelines
- Easy filtering and transformation
- Functional programming style
- Optional parallel processing

# Limitations

- Can be harder to debug when pipelines become long
- Not ideal for every simple operation
- Streams cannot be reused after a terminal operation
- May add overhead for small/simple tasks
- Parallel streams require careful use

### Stream cannot be reused

```java
Stream<Integer> stream = numbers.stream();

stream.forEach(System.out::println);

// IllegalStateException
stream.count();
```

Create a new stream instead:

```java
numbers.stream().forEach(System.out::println);
numbers.stream().count();
```

---

# When to Use Streams

Good use cases include:

- Filtering collections
- Transforming objects
- Sorting
- Searching
- Aggregation
- Grouping data
- Building data-processing pipelines

### Example

```java
List<Employee> result = employees.stream()
    .filter(employee -> employee.getSalary() > 50000)
    .collect(Collectors.toList());
```

---

# When NOT to Use Streams

A traditional loop may be clearer when:

- Logic is very simple
- You need complex control flow
- You need `break` or `continue`
- Mutable state is central to the algorithm
- A stream makes the code harder to understand
- Performance profiling shows a loop is more appropriate

---

# Real-World Examples

### Filter

```java
List<User> activeUsers = users.stream()
    .filter(User::isActive)
    .collect(Collectors.toList());
```

### Transform

```java
List<String> names = users.stream()
    .map(User::getName)
    .collect(Collectors.toList());
```

### Sort

```java
List<Employee> sortedEmployees = employees.stream()
    .sorted(Comparator.comparing(Employee::getSalary))
    .collect(Collectors.toList());
```

### Sum

```java
double totalSalary = employees.stream()
    .mapToDouble(Employee::getSalary)
    .sum();
```

---

# Quick Revision

### What is Stream API?

A Java 8 feature for processing sequences of data in a functional and declarative way.

### Does a Stream store data?

**No.** It processes data from a source.

### What are intermediate operations?

They return another stream and are lazy.

```java
filter()
map()
sorted()
distinct()
limit()
flatMap()
```

### What are terminal operations?

They produce a result and trigger execution.

```java
forEach()
collect()
count()
findFirst()
reduce()
```

### Can a Stream be reused?

**No.** A stream is consumed after a terminal operation.

### Is `parallelStream()` always faster?

**No.** It depends on the workload and execution environment.

---

## Ways to Create Streams

### 1. From a Collection — `stream()`

Used with `List`, `Set`, etc.

```java
List<Integer> numbers = Arrays.asList(1,2,3);
Stream<Integer> stream = numbers.stream();
```

> **Collection → `stream()`**
> 

---

### 2. From an Array — `Arrays.stream()`

Used for arrays, including primitive arrays.

```java
int[] numbers = {1,2,3};
IntStream stream = Arrays.stream(numbers);
```

> **Array → `Arrays.stream()`**
> 

---

### 3. Using `Stream.of()`

Used to create a stream from individual values.

```java
Stream<Integer> stream = Stream.of(1,2,3);
```

> **Individual values → `Stream.of()`**
> 

⚠️ With a `List`, `Stream.of(list)` creates a stream containing the **List as one element**, so normally use `list.stream()`.

---

### 4. Using `Stream.generate()` / `Stream.iterate()`

Used to create generated or potentially infinite streams.

```java
Stream.iterate(1,n ->n+1)
			.limit(5)
			.forEach(System.out::println);
```

Output:

```
1
2
3
4
5
```

> **Generated sequence → `iterate()` / `generate()`**
> 

### Quick Memory Trick

```java
Collection → stream()
Array      → Arrays.stream()
Values     → Stream.of()
Sequence   → iterate() / generate()
```

# Final Cheat Sheet

> **Remember:**
> 
> 
> **Source → Intermediate Operations → Terminal Operation → Result**
>