# 🏛️ System Architecture Diagrams — Projects

This document contains detailed end-to-end system architecture blueprints for:
1. 🚀 **Career OS** — Distributed Cloud-Native Microservices Architecture
2. 🚗 **Drive Verify** — Vehicle Registration & Fraud Verification Architecture
3. 🤖 **Video-Mind AI (YT_ChatBot)** — RAG YouTube Intelligence Architecture

---

## 1. 🚀 Career OS — Distributed Cloud-Native Microservices Architecture

> **Stack:** React 19 • TypeScript • Vite • Spring Boot 3.3 • Spring Cloud Gateway • Netflix Eureka • PostgreSQL 15 • Google Gemini 2.5 Flash

```mermaid
flowchart TD
    %% Client Layer
    subgraph ClientLayer ["Client Layer (Frontend)"]
        Client["React 19 SPA<br/>(TypeScript, Vite, TanStack Query)<br/>Port: 5173"]
    end

    %% Ingress & Discovery
    subgraph IngressLayer ["Ingress & Routing Layer"]
        Gateway["API Gateway<br/>(Spring Cloud Gateway, WebFlux)<br/>Port: 8080"]
        
        Eureka["Service Discovery<br/>(Netflix Eureka Server)<br/>Port: 8761"]
    end

    %% Microservices Mesh
    subgraph ServiceMesh ["Microservices Layer"]
        Auth["Auth Service<br/>(Spring Boot, Spring Security, JJWT)<br/>Port: 8081"]

        Backend["Core Backend Service<br/>(Spring Boot, Spring Data JPA, Hibernate)<br/>Port: 8085"]

        AI["AI Extraction Service<br/>(Spring Boot, Java 11 HttpClient)<br/>Port: 8082"]
    end

    %% Persistence Layer
    subgraph StorageLayer ["Persistence Layer"]
        DB[("PostgreSQL 15 Database<br/>(HikariCP, ACID, Composite Unique Indexes)<br/>Port: 5432")]
    end

    %% External Services
    subgraph ExternalLayer ["External Services"]
        OAuth["Identity Providers<br/>(Google & GitHub OAuth2)"]

        Gemini["Google Gemini API<br/>(Gemini 2.5 Flash REST)"]
    end

    %% Client to Ingress
    Client -->|"HTTPS / REST (JWT)"| Gateway

    %% Discovery Lookups & Heartbeats
    Gateway <-->|"Instance Lookup (lb://)"| Eureka
    Auth -.->|"Heartbeat (5s)"| Eureka
    Backend -.->|"Heartbeat (5s)"| Eureka
    AI -.->|"Heartbeat (5s)"| Eureka

    %% Gateway Routing
    Gateway -->|"/api/auth/**, /api/profile/**"| Auth
    Gateway -->|"/api/applications/**, /api/placements/**, /api/routines/**"| Backend
    Gateway -->|"/api/extraction/**"| AI

    %% Microservices to Persistence
    Auth -->|"JDBC (Users, Profiles)"| DB
    Backend -->|"JDBC (Applications, Placements, Habits, Skills)"| DB

    %% Microservices to External
    Auth <-->|"OAuth2 Handshake"| OAuth
    AI <-->|"JSON Extraction (Sub-2s)"| Gemini
```

---

## 2. 🚗 Drive Verify — Vehicle Registration & Fraud Verification Architecture

> **Stack:** React 18 • Vite • TypeScript • TanStack Query • Spring Boot 3.3.x • Java 21 • MongoDB Atlas • Spring Data • Prometheus Actuator

```mermaid
flowchart TD
    %% Client Tier
    subgraph ClientTier ["Client Tier (Frontend)"]
        Client["Web Client / Browser<br/><b>React 18 + Vite + TypeScript</b><br/><i>TanStack Query &bull; Tailwind CSS &bull; Zod</i>"]
    end

    %% Security & Ingress
    subgraph GatewayTier ["Security & Validation Filter"]
        AuthFilter["Authentication / Authorization<br/><b>AdminKeyValidator Filter</b><br/><i>Bearer Session Token (ADM_SESS_*) / X-Admin-Secret-Key</i>"]
    end

    %% Backend Services Tier
    subgraph BackendTier ["Backend Application (Spring Boot 3.3.x / Java 21)"]
        direction TB
        
        subgraph Controllers ["Controllers (Spring WebMvc)"]
            AuthCtrl["AuthController<br/><i>/api/auth/admin</i>"]
            RcCtrl["RcController<br/><i>/api/rc/**</i>"]
        end

        subgraph CoreServices ["Core Services & Business Logic"]
            RiskSvc["Risk Assessment Engine<br/><b>RiskAssessmentService</b><br/><i>Deterministic Fraud & Trust Scoring</i>"]
            RcSvc["Vehicle & Audit Service<br/><b>RcServiceImpl</b><br/><i>PII Masking &bull; Ownership Derivation</i>"]
        end

        subgraph DataAccess ["Data Access Layer"]
            Repo["Spring Data Repositories & MongoTemplate<br/><i>RcRepository &bull; OwnershipHistoryRepository</i>"]
        end
    end

    %% Database Tier
    subgraph DatabaseTier ["Database Tier (MongoDB Atlas)"]
        VehiclesColl[("vehicles Collection<br/><i>Polymorphic Vehicle Records</i>")]
        HistoryColl[("ownership_history Collection<br/><i>Immutable Audit Trail</i>")]
    end

    %% Async Background Tier
    subgraph AsyncTier ["Asynchronous / Background Processing"]
        AsyncWorker["Background Worker<br/><b>Spring @Async TaskExecutor</b>"]
        EmailSvc["Email Notification Service<br/><b>EmailService (JavaMailSender)</b>"]
        SmtpServer["External SMTP / Mail Server<br/><i>(Welcome & Transfer Alerts)</i>"]
    end

    %% Observability Tier
    subgraph MonitoringTier ["Observability"]
        Actuator["Spring Boot Actuator<br/><i>/actuator/prometheus</i>"]
    end

    %% Request & Synchronous Data Flows
    Client -->|"HTTP REST Requests (JSON)"| AuthFilter
    AuthFilter -->|"Validates Session / Routes Public & Admin APIs"| Controllers
    
    AuthCtrl -->|"Session Token Issuance"| RcSvc
    RcCtrl -->|"Evaluate Seller Claims"| RiskSvc
    RcCtrl -->|"CRUD, Search & Transfer Operations"| RcSvc
    
    RiskSvc -->|"Read Records for Scoring"| RcSvc
    RcSvc -->|"Queries & Mutations"| Repo
    
    Repo -->|"Read / Write Document State"| VehiclesColl
    Repo -->|"Append Immutable Transfer Logs"| HistoryColl

    %% Asynchronous Background Flow
    RcSvc -.->|"async dispatch (non-blocking)"| AsyncWorker
    AsyncWorker -.->|"triggers"| EmailSvc
    EmailSvc -.->|"SMTP Protocol"| SmtpServer

    %% Monitoring Flow
    BackendTier -.->|"Exposes Metrics"| Actuator
```

---

## 3. 🤖 Video-Mind AI (YT_ChatBot) — RAG System Architecture

> **Stack:** React 19 • TypeScript • Vite • FastAPI • LangChain LCEL • HuggingFace all-MiniLM-L6-v2 • FAISS • Google Gemini 2.5 Flash

```mermaid
flowchart TD
    %% Client Tier
    subgraph ClientTier ["Client Tier (Frontend)"]
        Client["Web Client<br/>React 19 &bull; TypeScript &bull; Vite<br/>TailwindCSS &bull; Lucide &bull; Mermaid.js"]
    end

    %% Backend Service Tier
    subgraph BackendTier ["Backend Application Service"]
        API["API Layer & Validation<br/>FastAPI &bull; Uvicorn<br/>Pydantic v2 Schemas &bull; CORS Middleware"]

        RAG["RAG Orchestration Engine<br/>LangChain LCEL<br/>Custom Rolling-Window Chunker"]

        Embed["Local Embedding Model<br/>HuggingFace all-MiniLM-L6-v2<br/>(384-dimensional Dense Vectors)"]
    end

    %% Local Vector Storage Tier
    subgraph StorageTier ["Storage Tier (Persistent Vector Store)"]
        FAISS[("Local FAISS Store<br/>faiss_indexes/{video_id}/<br/>index.faiss (Vectors) + index.pkl (Docstore)")]
    end

    %% External Services Tier
    subgraph ExternalTier ["External Services & Third-Party APIs"]
        YT_API["YouTube Data Services<br/>YouTube Transcript API & oEmbed<br/>(Captions, Timestamps & Video Info)"]

        Gemini["LLM Service<br/>Google Gemini 2.5 Flash<br/>(Grounded Q&A, Summary, MindMap, Quiz)"]

        YT_Player["YouTube Video Player<br/>IFrame Embed API<br/>(In-App Playback & Timestamp Seek)"]
    end

    %% Data Flow
    Client -->|"1. HTTP POST Request (URL / Question / History)"| API
    API -->|"2. Forward validated payload"| RAG

    %% Ingestion Flow
    RAG -->|"3a. Fetch captions & metadata"| YT_API
    YT_API -->|"3b. Transcript snippets & details"| RAG
    RAG -->|"4a. Generate chunk embeddings"| Embed
    Embed -->|"4b. Persist vectors & docstore"| FAISS

    %% Retrieval & Semantic Search
    RAG -->|"5a. Query vector embedding"| Embed
    RAG -->|"5b. Similarity search (top-k chunks)"| FAISS
    FAISS -->|"5c. Matched chunks with timestamps"| RAG

    %% LLM Generation
    RAG -->|"6a. Grounded prompt + context + history"| Gemini
    Gemini -->|"6b. Synthesized answer / summary / quiz"| RAG

    %% Response Flow
    RAG -->|"7. Format answer, citations & latency metrics"| API
    API -->|"8. HTTP JSON Response"| Client

    %% In-App Media Seek
    Client -.->|"Direct seek to cited timestamp (&t=seconds)"| YT_Player
```
