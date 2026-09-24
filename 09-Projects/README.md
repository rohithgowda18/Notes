# 💼 Project Case Studies & Placement Deep Dives

This directory contains deep-dive interview preparation guides for full-stack and AI-driven projects, structured with architecture breakdowns, database designs, technical challenges, and expected interview questions.

---

## 🏛️ System Architecture Blueprints
- 📊 **[Consolidated System Architecture Diagrams](./architecture%20diagram.md)**: Interactive end-to-end Mermaid blueprints for **Career OS** (Spring Cloud Microservices & AI Gateway), **Drive Verify** (Vehicle Registration & Fraud Verification), and **Video-Mind AI** (LangChain RAG System).

---

## 📑 Projects Index

### 1. 🚀 [Career OS — 15+ LPA Java Backend & Microservices Masterclass](./Career%20OS.md)
- **Role**: Senior Java Backend & Distributed Systems Engineer
- **Stack**: Java 17, Spring Boot 3.3, Spring Cloud Gateway, Eureka, PostgreSQL 15, Gemini 2.5 Flash, Docker
- **Core Focus**:
  - High-impact overnight revision dossier built specifically for 15+ LPA technical rounds.
  - 60s & 2m spoken pitches, 10-step end-to-end request walkthrough, and project Q&A.
  - Core Java & Concurrency deep-dive (HashMap internals, CAS locks, volatile, Streams, thread pools).
  - Spring Boot & JPA internals (AOP `@Transactional`, singleton thread safety, N+1 query elimination).
  - Architectural trade-offs defense (shared DB, symmetric JWT, localStorage, Eureka vs K8s).
  - Top 50 high-probability questions and a 60-minute final night revision plan.

---

### 2. 🚗 [Drive Verify — Vehicle Registration & Fraud Verification Platform](./Drive%20Verify%20-%20Vehicle%20Registration%20%26%20Fraud%20Verification.md)
- **Role**: Full-Stack Developer
- **Stack**: Java 21, Spring Boot, MongoDB, React, TypeScript, Zod, React Query
- **Core Focus**:
  - Used-vehicle verification and fraud-risk calculation.
  - Automated ownership-history audit trail and server-side derived owner counts.
  - Hybrid MongoDB schema (embedded vehicle attributes + separate audit collection).
  - Actuator + Micrometer + Prometheus observability and asynchronous mail workers.
  - 60-second and 2-minute interview pitch scripts.

---

### 3. 🤖 [Video-Mind AI (YT_ChatBot) — RAG YouTube Intelligence](./YT_ChatBot%20-%20RAG%20Video-Mind%20AI%20Revision.md)
- **Role**: AI / Full-Stack Engineer
- **Stack**: Python, FastAPI, LangChain, HuggingFace MiniLM, FAISS, Gemini 2.5 Flash, React
- **Core Focus**:
  - Retrieval-Augmented Generation (RAG) architecture and semantic search.
  - Video transcript extraction, chunking strategies (1200 chars / 250 overlap), 384-dim embeddings.
  - FAISS vector similarity search and grounded prompt engineering.
  - Clickable timestamp source citations, executive summaries, and key takeaways.
  - RAG vs. Traditional LLM vs. Fine-tuning comparison.

---

### 4. 🧬 [XMARs — Mutation Analysis, Machine Learning & SHAP](./XMARS.md)
- 🎯 [XMARs Interview Questions & Answers (Cheat Sheet)](./XMARs%20Interview%20Questions%20%26%20Answers.md)
- **Role**: ML / Mutation Analysis Subsystem Lead (4-Person Team Project)
- **Stack**: Python, Scikit-Learn, SHAP, Pandas, NumPy, RobustScaler
- **Core Focus**:
  - Precision-oncology decision-support prototype for Non-Small Cell Lung Cancer (NSCLC).
  - 1,984-row mutation feature dataset and dynamic runtime VAF injection.
  - Soft Voting Ensemble of Random Forest, Gradient Boosting, and AdaBoost (**98.14% verified test accuracy**).
  - Local model explainability using `TreeExplainer` and multi-model consensus feature attribution.
  - Explicit heuristic rules for driver vs. passenger mutation classification.
  - Defensive interview boundaries, IBM-focused questions, and safe answers.

---

## 🎯 How to Explain Projects in Interviews (STAR Method)

- **Situation**: What was the user problem and motivation behind the application?
- **Task**: What was your specific responsibility and system goal within the team?
- **Action**: What architecture did you choose? What databases, ML pipelines, and design patterns did you implement?
- **Result**: What metrics did you achieve (e.g., query latency, test accuracy, throughput, scalability)?

