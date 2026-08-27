# Maven

source: https://www.youtube.com/watch?v=N2EXGMJVwUU

# 📦 Maven Notes (Spring Framework)

> **Definition**
> 
> 
> **Maven** is a **Project Management and Build Automation Tool** for Java projects.
> 
> It automates project building, dependency management, testing, and packaging.
> 

---

# 🎯 Why Maven?

Without Maven, you would have to:

- ❌ Download JAR files manually
- ❌ Manage library versions yourself
- ❌ Resolve dependency conflicts
- ❌ Compile projects manually
- ❌ Create JAR files manually
- ❌ Share dependencies with teammates manually

### ✅ Maven solves all of these automatically.

---

# 📚 What is a JAR File?

**JAR = Java Archive**

A JAR file is similar to a ZIP file that packages Java project files together.

It contains:

- Compiled `.class` files
- Resources
- Images
- Properties files
- Package structure

```
Order.class
User.class
Payment.class
        ↓
project.jar
```

---

# 💡 Why Do We Use JAR Files?

## 1. Share Your Own Java Code

Example

```
Calculator.jar
```

Other developers can add this library to their projects.

---

## 2. Use Third-Party Libraries

Examples:

- Spring Framework
- Spring Boot
- MySQL Connector
- Hibernate
- Jackson
- Lombok

All of these are distributed as **JAR files**.

---

# 📖 Library vs Application

| Library | Application |
| --- | --- |
| Contains reusable code | Runnable program |
| Usually no `main()` method | Has `main()` method |
| Cannot run independently | Runs independently |
| Used by applications | Uses libraries |

---

# 📦 Dependency

A **Dependency** is an external library your project requires.

Examples

```
Spring Boot
Hibernate
Lombok
MySQL Connector
JUnit
```

---

# 🔄 Transitive Dependency

Sometimes one dependency requires another dependency.

Example

```
Spring Boot
      ↓
Spring Core
      ↓
Jackson
      ↓
Logging Library
```

Without Maven, you'd need to download **every dependency manually**.

Maven downloads them automatically.

---

# ❌ Problems Without Maven

### Manual Downloads

```
Google

↓

Download JAR

↓

Copy into project
```

---

### Version Conflicts

Example

```
Spring Boot 4

+

Spring 6

❌ Incompatible Versions
```

Maven automatically selects compatible versions.

---

### Team Collaboration

Without Maven

```
Developer A

↓

"Download these 25 JAR files"

↓

Developer B
```

With Maven

```
Git Clone

↓

Maven downloads everything automatically
```

---

# 🚀 What Maven Does

Maven mainly performs four tasks.

### 📁 1. Standard Folder Structure

Creates a consistent project layout.

---

### ⚙️ 2. Compiles Java Code

```
.java

↓

.class
```

---

### 📦 3. Packages the Project

Creates

```
project.jar
```

---

### 📥 4. Manages Dependencies

Automatically downloads

- Libraries
- Dependency versions
- Transitive dependencies

---

# 📂 Maven Project Structure

```
Project
│
├── src
│   ├── main
│   │   ├── java
│   │   └── resources
│   │
│   └── test
│       └── java
│
├── pom.xml
│
└── target
```

---

# 📂 src/main/java

Contains all Java source code.

Examples

```
Main.java
User.java
Order.java
Controller.java
Service.java
Repository.java
```

---

# 📂 src/main/resources

Contains non-Java files.

Examples

```
application.properties

application.yml

Images

Templates

Static Files
```

---

# 📂 src/test/java

Contains test classes.

Common testing libraries

- JUnit
- Mockito

---

# 📄 pom.xml

> **POM = Project Object Model**
> 

The most important Maven configuration file.

It contains:

- Project name
- Version
- Dependencies
- Plugins
- Build configuration
- Java version

Think of it as the **blueprint** of the project.

---

# 📂 target Folder

Generated after compilation.

Contains:

- Compiled `.class` files
- Generated sources
- Packaged JAR

Example

```
target/

├── classes/
├── generated-sources/
└── project.jar
```

---

# ⚙️ Compilation Flow

```
Main.java

↓

Maven Compile

↓

Main.class

↓

JVM

↓

Output
```

---

# 📦 Packaging Flow

```
Java Source

↓

Compile

↓

Package

↓

project.jar
```

The generated JAR is stored inside

```
target/
```

---

# 🔄 Maven Lifecycle (Mentioned in Video)

```
validate
    ↓
compile
    ↓
test
    ↓
package
    ↓
verify
    ↓
install
    ↓
deploy
```

The video mainly explains:

- `compile`
- `package`

The remaining phases are introduced for later discussion.

---

# 💻 Creating a Maven Project in IntelliJ

```
New Project

↓

Build System

↓

Maven

↓

Choose JDK

↓

Create Project
```

---

# ⭐ Advantages of Maven

- Standard folder structure
- Automatic dependency management
- Automatic version management
- Automatic transitive dependency resolution
- Easy project sharing
- Build automation
- Team-friendly
- Industry standard

---

# 📝 Interview Questions

### ❓ What is Maven?

**Answer:**
Maven is a **Project Management and Build Automation Tool** for Java projects. It manages dependencies, builds projects, runs tests, and packages applications into JAR files.

---

### ❓ What is a JAR file?

**Answer:**
A **JAR (Java Archive)** file is a compressed package that contains compiled Java classes (`.class` files), resources, metadata, and other files required for a Java application or library.

---

### ❓ What is a Dependency?

**Answer:**
A dependency is an external library or framework that a project requires to provide additional functionality without writing the code from scratch.

**Examples:**

- Spring Boot
- Hibernate
- Lombok
- MySQL Connector
- JUnit

---

### ❓ What is `pom.xml`?

**Answer:**`pom.xml` (Project Object Model) is the main configuration file of a Maven project. It contains:

- Project information
- Dependencies
- Plugins
- Build configuration
- Java version
- Project metadata

---

### ❓ What is the `target` folder?

**Answer:**
The `target` folder is the default build output directory created by Maven. It contains:

- Compiled `.class` files
- Generated resources
- Packaged JAR/WAR files
- Other build artifacts

---

### ❓ What is the difference between a Library and an Application?

| Library | Application |
| --- | --- |
| Contains reusable code | Runnable program |
| Usually has no `main()` method | Has a `main()` method |
| Cannot run independently | Can run independently |
| Used by applications | Uses libraries/dependencies |

---

# ⚡ Quick Revision

> **Maven** → Project Management & Build Tool
> 

> **JAR** → Java Archive
> 

> **Dependency** → External Library
> 

> **Transitive Dependency** → Dependency of another dependency
> 

> **pom.xml** → Maven Configuration File
> 

> **src/main/java** → Java Source Code
> 

> **src/main/resources** → Configuration & Resources
> 

> **src/test/java** → Test Code
> 

> **target** → Build Output Folder
> 

> **compile** → Converts `.java` → `.class`
> 

> **package** → Creates the JAR file
> 

---

## 📌 Memory Tip

**Maven = "Manage Everything"**

Whenever you think of Maven, remember it automates the entire Java project workflow:

**Code → Compile → Test → Package → Dependency Management → Deployment**