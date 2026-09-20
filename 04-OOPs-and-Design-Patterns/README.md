# 🧱 Object-Oriented Programming (OOP), Design Patterns & Low-Level Design (LLD)

A masterclass curriculum and comprehensive study notes repository covering **Object-Oriented Programming (OOP)**, **UML Modeling**, **SOLID Principles**, **23 GoF Design Patterns**, and **Enterprise Machine Coding Case Studies** (derived directly from the complete 40-video Code Army LLD masterclass series).

---

## 🗺️ Complete 40-Topic Masterclass Index

### 📂 01. Core OOPs and UML Modeling
| # | Topic | Documentation | Key Focus |
| :---: | :--- | :--- | :--- |
| **01** | Introduction To System Design | [01-Introduction-To-System-Design.md](./01-Core-OOPs-and-UML/01-Introduction-To-System-Design.md) | DSA vs LLD vs HLD, 4-stage interview framework, Trade-offs. |
| **02** | OOPs Real-World Examples, Abstraction, Encapsulation | [02-OOPs-Real-World-Examples-Abstraction-Encapsulation.md](./01-Core-OOPs-and-UML/02-OOPs-Real-World-Examples-Abstraction-Encapsulation.md) | Classes vs Objects, Car abstraction, BankAccount encapsulation. |
| **03** | Inheritance & Polymorphism in OOPs | [03-Inheritance-and-Polymorphism-in-OOPs.md](./01-Core-OOPs-and-UML/03-Inheritance-and-Polymorphism-in-OOPs.md) | Diamond problem, Overloading vs Overriding, Virtual method table (vtable). |
| **04** | UML Diagrams — Class & Sequence Diagrams | [04-UML-Diagrams-Class-and-Sequence-Diagrams.md](./01-Core-OOPs-and-UML/04-UML-Diagrams-Class-and-Sequence-Diagrams.md) | 6 Core Class Relationships (Aggregation vs Composition), Sequence lifeline diagrams. |

---

### 📂 02. SOLID Design Principles
| # | Topic | Documentation | Key Focus |
| :---: | :--- | :--- | :--- |
| **05** | SOLID Design Principles — Part 1 | [05-SOLID-Design-Principles-Part-1.md](./02-SOLID-Principles/05-SOLID-Design-Principles-Part-1.md) | **S**ingle Responsibility Principle & **O**pen/Closed Principle with refactored ShoppingCart. |
| **06** | SOLID Design Principles — Part 2 | [06-SOLID-Design-Principles-Part-2.md](./02-SOLID-Principles/06-SOLID-Design-Principles-Part-2.md) | **L**iskov Substitution (Square-Rectangle problem), **I**nterface Segregation, **D**ependency Inversion. |

---

### 📂 03. Design Patterns
| # | Pattern | Category | Documentation | Key Focus |
| :---: | :--- | :--- | :--- | :--- |
| **08** | Strategy Pattern | Behavioral | [08-Strategy-Design-Pattern.md](./03-Design-Patterns/08-Strategy-Design-Pattern.md) | Composition over inheritance, interchangeable algorithms. |
| **09** | Factory Pattern | Creational | [09-Factory-Design-Pattern.md](./03-Design-Patterns/09-Factory-Design-Pattern.md) | Simple vs Factory Method vs Abstract Factory. |
| **10** | Singleton Pattern | Creational | [10-Singleton-Design-Pattern.md](./03-Design-Patterns/10-Singleton-Design-Pattern.md) | Double-checked locking with `volatile`, Bill Pugh, Enum singleton. |
| **12** | Observer Pattern | Behavioral | [12-Observer-Design-Pattern.md](./03-Design-Patterns/12-Observer-Design-Pattern.md) | Pub-Sub event dispatch, thread-safe listener registrations. |
| **13** | Decorator Pattern | Structural | [13-Decorator-Design-Pattern.md](./03-Design-Patterns/13-Decorator-Design-Pattern.md) | Dynamic capability stacking, Java I/O Streams, Mario power-ups. |
| **15** | Command Pattern | Behavioral | [15-Command-Design-Pattern.md](./03-Design-Patterns/15-Command-Design-Pattern.md) | Decoupling invoker and receiver, multi-level Undo/Redo stack. |
| **16** | Adapter Pattern | Structural | [16-Adapter-Design-Pattern.md](./03-Design-Patterns/16-Adapter-Design-Pattern.md) | Bridging incompatible interfaces (XML to JSON, 3rd-party APIs). |
| **17** | Facade Pattern | Structural | [17-Facade-Design-Pattern.md](./03-Design-Patterns/17-Facade-Design-Pattern.md) | Unified subsystem wrapper, Law of Demeter (Least Knowledge). |
| **19** | Composite Pattern | Structural | [19-Composite-Design-Pattern-File-System.md](./03-Design-Patterns/19-Composite-Design-Pattern-File-System.md) | Part-whole tree hierarchies (OS Directory and File tree). |
| **20** | Template Method Pattern | Behavioral | [20-Template-Method-Pattern.md](./03-Design-Patterns/20-Template-Method-Pattern.md) | Invariant algorithm skeleton, Hollywood principle, ML pipeline. |
| **21** | Proxy Pattern | Structural | [21-Proxy-Design-Pattern.md](./03-Design-Patterns/21-Proxy-Design-Pattern.md) | Virtual (Lazy 4K Image), Protection (RBAC), Remote proxies. |
| **22** | Chain of Responsibility | Behavioral | [22-Chain-of-Responsibility-Pattern.md](./03-Design-Patterns/22-Chain-of-Responsibility-Pattern.md) | Request pipelines, ATM cash dispense denomination cascading. |
| **25** | Bridge Pattern | Structural | [25-Bridge-Pattern.md](./03-Design-Patterns/25-Bridge-Pattern.md) | Decoupling Abstraction from Implementation ($M \times N \rightarrow M + N$). |
| **28** | Builder Pattern | Creational | [28-Builder-Design-Pattern.md](./03-Design-Patterns/28-Builder-Design-Pattern.md) | Telescoping constructor elimination, immutable HTTP Request builder. |
| **29** | Iterator Pattern | Behavioral | [29-Iterator-Design-Pattern.md](./03-Design-Patterns/29-Iterator-Design-Pattern.md) | Encapsulated sequence traversal (Playlist, Binary Tree in-order). |
| **30** | Flyweight Pattern | Structural | [30-Flyweight-Design-Pattern.md](./03-Design-Patterns/30-Flyweight-Design-Pattern.md) | RAM optimization (Intrinsic vs Extrinsic state), 1M Asteroids. |
| **32** | State Pattern | Behavioral | [32-State-Design-Pattern-Vending-Machine.md](./03-Design-Patterns/32-State-Design-Pattern-Vending-Machine.md) | State machine transitions without nested switch blocks (Vending Machine). |
| **35** | Mediator Pattern | Behavioral | [35-Mediator-Design-Pattern-Chat-Room.md](./03-Design-Patterns/35-Mediator-Design-Pattern-Chat-Room.md) | Hub-and-spoke star topology, Chat room colleague orchestration. |
| **36** | Prototype Pattern | Creational | [36-Prototype-Design-Pattern.md](./03-Design-Patterns/36-Prototype-Design-Pattern.md) | Fast object cloning, Deep vs Shallow copy, NPC game spawning. |
| **38** | Visitor Pattern | Behavioral | [38-Visitor-Design-Pattern.md](./03-Design-Patterns/38-Visitor-Design-Pattern.md) | Double Dispatch, decoupling algorithms from element hierarchies. |
| **39** | Memento Pattern | Behavioral | [39-Memento-Design-Pattern.md](./03-Design-Patterns/39-Memento-Design-Pattern.md) | Originator-Memento-Caretaker, Database transaction rollbacks. |
| **40** | Null Object Pattern | Behavioral | [40-Null-Object-Pattern.md](./03-Design-Patterns/40-Null-Object-Pattern.md) | Replacing null checks with polymorphism, God Object Anti-Pattern. |

---

### 📂 04. Real-World LLD & Machine Coding Case Studies
| # | Case Study | Documentation | Architectural Patterns Involved |
| :---: | :--- | :--- | :--- |
| **07** | Build Google Docs (Document Editor) | [07-Build-Google-Docs-Document-Editor-LLD.md](./04-LLD-Case-Studies/07-Build-Google-Docs-Document-Editor-LLD.md) | Composite, Facade, Strategy |
| **11** | Build Zomato / Swiggy Food Delivery | [11-Build-Zomato-Food-Delivery-App.md](./04-LLD-Case-Studies/11-Build-Zomato-Food-Delivery-App.md) | State Machine, Strategy, Factory |
| **14** | Build Notification Engine | [14-Build-Your-Own-Notification-Engine.md](./04-LLD-Case-Studies/14-Build-Your-Own-Notification-Engine.md) | Strategy, Observer, Decorator, Singleton |
| **18** | Build Spotify / Music Player App | [18-Build-Spotify-Music-Player-App.md](./04-LLD-Case-Studies/18-Build-Spotify-Music-Player-App.md) | Singleton, Strategy, Adapter, Factory, Facade |
| **23** | Build Payment Gateway System | [23-Build-Payment-Gateway-System.md](./04-LLD-Case-Studies/23-Build-Payment-Gateway-System.md) | Template Method, Strategy, Remote Proxy, Retry Logic |
| **24** | Build Discount Coupon Engine | [24-Build-Discount-Coupon-Engine.md](./04-LLD-Case-Studies/24-Build-Discount-Coupon-Engine.md) | Strategy, Decorator (Coupon Stacking) |
| **26** | Build Zepto (Dark Store Inventory) | [26-Build-Zepto-Inventory-Management.md](./04-LLD-Case-Studies/26-Build-Zepto-Inventory-Management.md) | Strategy, Geo-Routing, Concurrency Control |
| **27** | Build Tinder / Dating Site | [27-Build-Tinder-Dating-Site.md](./04-LLD-Case-Studies/27-Build-Tinder-Dating-Site.md) | Strategy (Jaccard Score), Observer (Match alerts) |
| **31** | Build Splitwise Clone | [31-Build-Splitwise-Clone.md](./04-LLD-Case-Studies/31-Build-Splitwise-Clone.md) | Strategy (Equal/Exact/Percent), Bilateral Ledger, Invariants |
| **33** | Build Tic Tac Toe Game | [33-Build-Tic-Tac-Toe-Game.md](./04-LLD-Case-Studies/33-Build-Tic-Tac-Toe-Game.md) | Top-Down Design, Deque Turn Queue, Strategy ($O(N)$/$O(1)$) |
| **34** | Build Snake and Ladder Game | [34-Build-Snake-and-Ladder-Game.md](./04-LLD-Case-Studies/34-Build-Snake-and-Ladder-Game.md) | Jump Abstraction, Dynamic Dice, Exact Landing Rule |
| **37** | Build Chess Game | [37-Build-Chess-Game.md](./04-LLD-Case-Studies/37-Build-Chess-Game.md) | Polymorphic Piece Geometry, Move Validation, Mediator Chat |

---

## 📚 Supplementary References
- 📝 [OOPS Notes](./OOPS-Notes.md)
- 📄 [OOPS Concepts in Java (PDF)](./OOPS-Concepts-in-Java.pdf)
- 📄 [OOPs Interview Questions](./OOPs-Interview-Questions.pdf)
- 📄 [Design Patterns Placement Notes](./Design_Patterns_Placement_Notes.pdf)
