# Elastic Search

no: 1
source: https://www.youtube.com/watch?v=7_sovzAhRSM

# 🔍 Elasticsearch

## What is Elasticsearch?

A **distributed search engine** built on **Apache Lucene** that provides **fast full-text search** using an **Inverted Index**.

---

## Why do we need it?

Traditional SQL search:

```
SELECT * FROM products WHERE name ILIKE '%laptop%';
```

Problems:

- Slow on millions of records
- No relevance ranking
- Poor typo handling
- No autocomplete

---

## How does it work?

### Traditional Search

```
Query
  ↓
Scan every row
  ↓
Return matches
```

### Elasticsearch

```
Documents
     ↓
Inverted Index
     ↓
Fast Lookup
     ↓
Rank Results
```

---

## Inverted Index

Instead of

```
Document → Words
```

It stores

```
Word → Documents
```

Example

```
Laptop
   ↓
Doc 1
Doc 8
Doc 20
```

Search becomes **lookup** instead of **scanning**.

---

## Relevance Scoring (BM25)

Results are ranked using:

- ✅ Term Frequency (word appears many times)
- ✅ Document Frequency (rare words matter more)
- ✅ Document Length
- ✅ Field Boosting (Title > Description > Content)

---

## Features

- ⚡ Fast Search
- 🔎 Full-text Search
- 🤖 Relevance Ranking
- ✍️ Typo Tolerance
- 🔍 Autocomplete
- 📊 Distributed & Scalable

---

## PostgreSQL vs Elasticsearch

| PostgreSQL | Elasticsearch |
| --- | --- |
| LIKE / ILIKE | Inverted Index |
| Slower on huge datasets | Very Fast |
| Exact matching | Relevance Search |
| No typo tolerance | Typo tolerance |
| No autocomplete | Autocomplete |

---

## Common Use Cases

- Product Search (Amazon)
- Google-like Search
- Blog Search
- Documentation Search
- Log Search (ELK Stack)

---

## Interview Questions

- What is Elasticsearch?
- Why is it faster than SQL search?
- What is an Inverted Index?
- What is BM25?
- PostgreSQL Full-Text Search vs Elasticsearch?
- When should you use Elasticsearch?

---

## Key Takeaways

- Built on **Apache Lucene**
- Uses **Inverted Index**
- Supports **BM25** relevance scoring
- Excellent for **large-scale search**
- Ideal for **autocomplete** and **typo tolerance**