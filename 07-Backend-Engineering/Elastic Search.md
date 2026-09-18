# 🔍 Elasticsearch & Distributed Full-Text Search

> **Core Philosophy**: Relational databases excel at exact lookups and ACID transactions, but perform terribly on full-text search ($O(N)$ wildcard scans with `LIKE '%term%'`). 
> Elasticsearch provides distributed, near real-time full-text search and analytical aggregation using the **Inverted Index** and the **Apache Lucene** storage engine.

---

## 📑 Table of Contents
- [1. Why Relational DBs Fail at Search](#1-why-relational-dbs-fail-at-search)
- [2. The Inverted Index Architecture](#2-the-inverted-index-architecture)
- [3. The Analysis Pipeline (Tokenization & Filtering)](#3-the-analysis-pipeline-tokenization--filtering)
- [4. Elasticsearch Cluster Architecture (Shards & Replicas)](#4-elasticsearch-cluster-architecture-shards--replicas)
- [5. Cluster Node Roles (Master, Data, Coordinating)](#5-cluster-node-roles-master-data-coordinating)
- [6. The Write Path (Indexing Documents)](#6-the-write-path-indexing-documents)
- [7. The Read Path (Query & Fetch Phases)](#7-the-read-path-query--fetch-phases)
- [8. Lucene Segments & Immutability](#8-lucene-segments--immutability)
- [9. RDBMS vs. Elasticsearch (Placement Comparison)](#9-rdbms-vs-elasticsearch-placement-comparison)
- [10. 1-Page Master Revision Cheat Sheet & Placement Q&A](#10-1-page-master-revision-cheat-sheet--placement-qa)

---

## 1. Why Relational DBs Fail at Search

> 💡 **Quick Revision Anchor (2-3 Words)**: `Wildcard Scans Fail`

In an RDBMS:
```sql
SELECT * FROM articles WHERE content LIKE '%distributed system%';
```
- **B-Tree Index Useless**: Leading wildcards (`%...`) prevent B-Tree index traversal, forcing a **Full Table Scan ($O(N)$)** across gigabytes of text.
- **No Relevance Scoring**: RDBMS cannot easily rank results by relevance (TF-IDF / BM25), typos, or synonym expansion.

[⬆ Back to Top](#📑-table-of-contents)

---

## 2. The Inverted Index Architecture

> 💡 **Quick Revision Anchor (2-3 Words)**: `Term-to-Document Map`

The **Inverted Index** is a mapping from unique words (terms) to the list of document IDs that contain them.

### Input Documents:
- **Doc 1**: *"Kafka is a distributed message queue"*
- **Doc 2**: *"RabbitMQ is also a message queue"*
- **Doc 3**: *"Elasticsearch is a distributed search engine"*

### Resulting Inverted Index:

| Term | Frequency | Posting List (Document IDs) |
| :--- | :---: | :--- |
| `distributed` | 2 | `[Doc 1, Doc 3]` |
| `elasticsearch`| 1 | `[Doc 3]` |
| `engine` | 1 | `[Doc 3]` |
| `kafka` | 1 | `[Doc 1]` |
| `message` | 2 | `[Doc 1, Doc 2]` |
| `queue` | 2 | `[Doc 1, Doc 2]` |
| `rabbitmq` | 1 | `[Doc 2]` |
| `search` | 1 | `[Doc 3]` |

> When searching for `"distributed queue"`, Elasticsearch computes the set intersection:  
> `[Doc 1, Doc 3] ∩ [Doc 1, Doc 2] = [Doc 1]` in $O(1)$ dictionary lookup time!

[⬆ Back to Top](#📑-table-of-contents)

---

## 3. The Analysis Pipeline (Tokenization & Filtering)

> 💡 **Quick Revision Anchor (2-3 Words)**: `Text Preprocessing Pipeline`

Before text is added to the inverted index, it passes through an **Analyzer**:

```mermaid
flowchart LR
    Raw[Raw Text: 'The QUICK brown FOXES jumped!'] --> Char[Character Filter: Remove HTML tags]
    Char --> Tokenizer[Tokenizer: Split on whitespace & punctuation]
    Tokenizer --> Lower[Token Filter 1: Lowercase]
    Lower --> Stop[Token Filter 2: Remove Stopwords 'the']
    Stop --> Stem[Token Filter 3: Stemming 'foxes' -> 'fox', 'jumped' -> 'jump']
    Stem --> Terms[Final Indexed Terms: 'quick', 'brown', 'fox', 'jump']
```

[⬆ Back to Top](#📑-table-of-contents)

---

## 4. Elasticsearch Cluster Architecture (Shards & Replicas)

> 💡 **Quick Revision Anchor (2-3 Words)**: `Primary & Replicas`

```mermaid
flowchart TD
    subgraph ES Cluster ["Elasticsearch Index: 'products' (3 Primary Shards, 1 Replica)"]
        subgraph Node1 [Node 1]
            P0["Primary Shard 0"]
            R1["Replica Shard 1"]
        end
        subgraph Node2 [Node 2]
            P1["Primary Shard 1"]
            R2["Replica Shard 2"]
        end
        subgraph Node3 [Node 3]
            P2["Primary Shard 2"]
            R0["Replica Shard 0"]
        end
    end
```

### Core Concepts:
- **Index**: A logical namespace (equivalent to a Database Table in SQL).
- **Document**: A JSON object (equivalent to a Row in SQL).
- **Primary Shard**: A self-contained Lucene instance holding a horizontal partition of the data.
- **Replica Shard**: An exact copy of a primary shard for high availability and read throughput.

[⬆ Back to Top](#📑-table-of-contents)

---

## 5. Cluster Node Roles (Master, Data, Coordinating)

> 💡 **Quick Revision Anchor (2-3 Words)**: `Cluster Node Responsibilities`

1. **Master Node**: Manages cluster state, tracks which nodes are active, and handles shard allocation.
2. **Data Node**: Holds shards and executes CRUD, search, and aggregation operations (RAM & I/O heavy).
3. **Coordinating (Client) Node**: Routes incoming HTTP requests to appropriate data nodes and aggregates multi-shard search responses.

[⬆ Back to Top](#📑-table-of-contents)

---

## 6. The Write Path (Indexing Documents)

> 💡 **Quick Revision Anchor (2-3 Words)**: `Translog & Refresh`

```mermaid
sequenceDiagram
    autonumber
    Client->>Node1: POST /products/_doc/101 (Document JSON)
    Note over Node1: Shard Routing: Shard = hash(doc_id) % num_primary_shards
    Node1->>Node2: Forward to Primary Shard (Node 2: P1)
    Node2->>Node2: Write to Memory Buffer & Write-Ahead Log (Translog)
    Node2->>Node3: Replicate to Replica Shard (Node 3: R1)
    Node3-->>Node2: Replica ACK
    Node2-->>Node1: Primary ACK
    Node1-->>Client: 201 Created
```

- **Near Real-Time (NRT)**: Changes become searchable only after an in-memory buffer is flushed to a Lucene segment during **Refresh** (default: every $1	ext{s}$).

[⬆ Back to Top](#📑-table-of-contents)

---

## 7. The Read Path (Query & Fetch Phases)

> 💡 **Quick Revision Anchor (2-3 Words)**: `Scatter-Gather Phases`

Searching across a sharded index uses a 2-phase process:

```
                  Coordinating Node
                   /      |                        ↓       ↓       ↓
               Shard 0 Shard 1 Shard 2
```

1. **Query Phase**: The coordinating node broadcasts the query to all shards. Each shard executes search locally and returns only **document IDs and relevance scores (Top K)**.
2. **Fetch Phase**: The coordinating node merges and sorts all shard scores, selects the overall Top K, and requests full document JSON payloads only for the winning IDs.

[⬆ Back to Top](#📑-table-of-contents)

---

## 8. Lucene Segments & Immutability

> 💡 **Quick Revision Anchor (2-3 Words)**: `Immutable Segment Files`

- Lucene writes inverted indexes in immutable chunk files called **Segments**.
- **Why Immutability?** Eliminates write lock contention, allows aggressive OS page cache read caching.
- **Deletions/Updates**: Updates do not modify segments in-place. An update marks the old document ID in a `.del` bitmap file and appends the new document version to a new segment.
- **Segment Merging**: Background worker threads periodically merge smaller segments into large ones, purging deleted records.

[⬆ Back to Top](#📑-table-of-contents)

---

## 9. RDBMS vs. Elasticsearch (Placement Comparison)

> 💡 **Quick Revision Anchor (2-3 Words)**: `Exact vs Search`

| Feature | Relational Database (RDBMS) | Elasticsearch |
| :--- | :--- | :--- |
| **Primary Data Structure** | B+ Tree | **Inverted Index + BKD Trees** |
| **Primary Strength** | Strict ACID transactions, Relations | Full-text fuzzy search, Relevance ranking |
| **Search Performance** | $O(N)$ table scans on wildcards | $O(1)$ term postings lookup |
| **ACID Compliance** | Full ACID guarantees | Eventual consistency, No distributed joins |
| **Best Used As** | Primary system of record | Secondary search index / Log analytics |

[⬆ Back to Top](#📑-table-of-contents)

---

## 10. 1-Page Master Revision Cheat Sheet & Placement Q&A

```text
==================================================================================================
                        ELASTICSEARCH & FULL-TEXT SEARCH CHEAT SHEET
==================================================================================================

1. INVERTED INDEX:
   - Maps Term -> [Doc IDs list] (Posting list).
   - Multi-term searches execute set intersections (AND) or unions (OR) in O(1) dictionary time.

2. ANALYSIS PIPELINE:
   - Raw Text -> Character Filter -> Tokenizer -> Token Filters (Lowercase, Stopwords, Stemming).

3. CLUSTER & SHARDING:
   - Primary Shards: Partition data horizontally across nodes. Cannot change count after creation.
   - Replica Shards: Exact copies for high availability and read throughput scaling.
   - Routing: shard = hash(doc_id) % num_primary_shards.

4. WRITE PATH & NEAR REAL-TIME:
   - Write arrives at Primary -> Translog (durability) + In-memory Buffer -> Replicated to Replicas.
   - Refresh: Every 1s, in-memory buffer flushes to a new Lucene Segment, making docs searchable.

5. READ PATH (2 PHASES):
   - Query Phase: Coordinating node scatters query; shards return Top-K doc IDs and scores.
   - Fetch Phase: Coordinating node gathers, ranks Top-K, and fetches full JSON from winning shards.

6. LUCENE IMMUTABILITY:
   - Segments are immutable files. Updates = Mark old doc in .del file + append new version.
   - Background segment merging purges deleted records and consolidates index files.
==================================================================================================
```

[⬆ Back to Top](#📑-table-of-contents)
