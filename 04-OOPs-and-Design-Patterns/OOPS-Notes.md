# OOPS

# 🚀 OOPS Placement Notes

---

# 📌 What is OOP?

**Object-Oriented Programming (OOP)** is a programming paradigm that models software as **objects**, where each object contains:

- **Data (Attributes/Fields)**
- **Behavior (Methods/Functions)**

### Why OOP?

Procedural Programming has problems like:

- Code duplication
- Difficult maintenance
- Poor scalability
- Low code reusability

OOP solves these using:

- Encapsulation
- Abstraction
- Inheritance
- Polymorphism

---

# 🎯 Class vs Object

## Class

A **blueprint** used to create objects.

```java
class Student{
    String name;
    int age;

    void study(){}
}
```

## Object

An instance of a class.

```java
Student s = new Student();
```

### Difference

| Class | Object |
| --- | --- |
| Blueprint | Instance |
| Logical entity | Physical entity |
| No memory allocated | Memory allocated |
| Defines properties | Uses properties |

⭐ Interview Tip:

> "A class is a template; an object is a real-world instance of that template."
> 

---

# 🎯 Constructor

A constructor is a special method automatically called when an object is created.

```java
class Student{
    Student(){
        System.out.println("Object Created");
    }
}
```

## Types

- Default Constructor
- Parameterized Constructor
- Copy Constructor (C++)

### Frequently Asked Questions

✅ Can constructors be overloaded? → Yes

❌ Can constructors be overridden? → No

❌ Can constructors be inherited? → No

---

# 🎯 Destructor

Responsible for object cleanup.

### C++

```cpp
~Student(){}
```

### Java

No destructor.

Garbage Collector automatically reclaims unused objects.

---

# ⭐ Four Pillars of OOP

## 1️⃣ Encapsulation

### Definition

Wrapping data and methods into a single unit while hiding internal data using access modifiers.

```java
class BankAccount{

    private int balance;

    public void deposit(int amount){
        balance += amount;
    }

    public int getBalance(){
        return balance;
    }
}
```

### Advantages

- Data security
- Better maintenance
- Easy validation
- Loose coupling

### Real Example

ATM Machine

You can deposit or withdraw money but cannot directly modify the account balance.

### Interview Questions

- What is encapsulation?
- Why use private variables?
- Why use getters and setters?

## 2️⃣ Abstraction

### Definition

Showing only essential details while hiding implementation.

Example:

Car

You press Start.

You don't need to know how the engine starts.

## Abstract Class

```java
abstract class Animal{

    abstract void sound();

}
```

---

## Interface

```java
interface Payment{

    void pay();

}
```

---

## Interface vs Abstract Class

| Interface | Abstract Class |
| --- | --- |
| Pure contract | Partial implementation |
| Multiple inheritance | Single inheritance |
| No constructors | Constructors allowed |
| Implements | Extends |

### Interview Questions

- Why use abstraction?
- When to use Interface?
- When to use Abstract Class?

## 3️⃣ Inheritance

### Definition

One class acquires properties and methods of another.

```java
class Animal{

    void eat(){}

}

class Dog extends Animal{

}
```

## Types

- Single
- Multilevel
- Hierarchical
- Multiple (through interfaces in Java)

---

### Advantages

- Code Reuse
- Extensibility
- Easy Maintenance

### Interview Question

Why doesn't Java support multiple inheritance using classes?

Answer:

To avoid the **Diamond Problem**.

## 4️⃣ Polymorphism

### Definition

One interface, multiple implementations.

## Compile-Time Polymorphism

Method Overloading

```java
add(int a,int b)

add(int a,int b,int c)
```

---

## Runtime Polymorphism

Method Overriding

```java
class Animal{

    void sound(){}

}

class Dog extends Animal{

    @Override
    void sound(){}

}
```

---

## Overloading vs Overriding

| Overloading | Overriding |
| --- | --- |
| Compile Time | Runtime |
| Same Class | Parent-Child |
| Different Parameters | Same Parameters |

---

# Object Relationships in Java

**Association, Aggregation, and Composition** are three important ways objects can relate to each other.

## 1. Association

## Definition

**Association = one object knows, uses, or works with another object.**

### Example

A `Teacher` teaches a `Student`.

```
class Student {
    String name;
}
class Teacher {
    String name;

    void teach(Student student) {
        System.out.println(name + " teaches " + student.name);
    }
}
```

### Relationship

```
Teacher ─────── Student
       "teaches"
```

Neither object necessarily owns the other.

### 💡 Think

> **"uses / knows / works with"**
> 

### Examples

- `Doctor → Patient`
- `Teacher → Student`
- `Driver → Car`
- `Customer → Bank`

## 2. Aggregation

## Definition

**Aggregation = a "has-a" relationship where the contained object can exist independently.**

### Example

A `Team` has `Players`, but the `Players` can exist without the `Team`.

```
class Player {
    String name;

    Player(String name) {
        this.name = name;
    }
}
class Team {
    List<Player> players;

    Team(List<Player> players) {
        this.players = players;
    }
}
```

### Relationship

```
Team
 ├── Player
 ├── Player
 └── Player
```

If the `Team` disappears, the `Player` objects can still exist.

### 💡 Think

> **"has-a, but doesn't own the lifetime"**
> 

### Key Point

The `Team` **contains** `Player` objects, but it does not control their entire lifecycle.

## 3. Composition

## Definition

**Composition = a "has-a" relationship where the contained object's lifecycle is controlled by the containing object.**

Composition is a **stronger relationship** than aggregation.

### Example

A `Car` creates and manages its own `Engine`.

```
class Engine {
    void start() {
        System.out.println("Engine started");
    }
}
class Car {
    private Engine engine;

    Car() {
        engine = new Engine();
    }
    void startCar() {
        engine.start();
    }
}
```

### Relationship

```
Car
 └── Engine
```

Conceptually:

> A `Car` is composed of an `Engine`.
> 

### Key Point

The `Car` **owns and controls** the `Engine` object's lifecycle.

## Association vs Aggregation vs Composition

| Relationship | Meaning | Example |
| --- | --- | --- |
| **Association** | Uses / knows | `Teacher → Student` |
| **Aggregation** | Has-a, but independent | `Team → Player` |
| **Composition** | Has-a, owned | `Car → Engine` |

# 🎯 Access Modifiers

| Modifier | Same Class | Package | Child | Outside |
| --- | --- | --- | --- | --- |
| Private | ✅ | ❌ | ❌ | ❌ |
| Default | ✅ | ✅ | ❌ | ❌ |
| Protected | ✅ | ✅ | ✅ | ❌ |
| Public | ✅ | ✅ | ✅ | ✅ |

---

# 🎯 this Keyword

Represents the current object.

Uses

- Current object reference
- Constructor chaining
- Method chaining

Example

```java
this.name = name;

this();

this.display();
```

---

# 🎯 super Keyword

Used to access parent class.

```java
super();

super.display();

super.name;
```

---

# 🎯 Static Keyword

Belongs to the class rather than objects.

```java
class Student{

    static int count;

}
```

### Interview Questions

Can static methods access instance variables?

❌ No

Can static methods call static methods?

✅ Yes

---

# 🎯 Final Keyword

## final Variable

Cannot be modified.

## final Method

Cannot be overridden.

## final Class

Cannot be inherited.

---

## 🎯 Early vs Late Binding

## Early Binding

Occurs at Compile Time.

Example

Method Overloading

---

## Late Binding

Occurs at Runtime.

Example

Method Overriding

---

---

# SOLID Principles

**SOLID** is a set of **5 principles for writing maintainable OOP code**.

```
S → Single Responsibility
O → Open/Closed
L → Liskov Substitution
I → Interface Segregation
D → Dependency Inversion
```

> **Don't memorize the names first. Understand the problem each principle solves.**
> 

## 1. S — Single Responsibility Principle

## Simple Meaning

> **A class should have one main responsibility.**
> 

Suppose you create:

```java
class Employee {
    void calculateSalary() {
    }

    void saveToDatabase() {
    }

    void generateReport() {
    }

    void sendEmail() {
    }
}
```

This class is doing too much.

It has responsibilities related to:

- Salary
- Database
- Reports
- Email

If the email system changes, you have to modify `Employee`.

That's bad design.

## Better

```java
class Employee {
    private String name;
    private double salary;

    public double calculateSalary() {
        return salary;
    }
}
```

Then:

```java
class EmployeeRepository {
	void save(Employee employee) {
    }
}
```

and others

```
Employee
   ↓
Employee data + salary

EmployeeRepository
   ↓
Database

EmployeeReport
   ↓
Reports

EmailService
   ↓
Email
```

## Why?

If the database changes, you don't need to modify `Employee`.

## Interview Answer

> **SRP means a class should have one responsibility and therefore one main reason to change.**
> 

## 2. O — Open/Closed Principle

## Simple Meaning

> **Classes should be open for extension but closed for modification.**
> 

Suppose we have:

```java
class PaymentService {
    void pay(String type) {

        if (type.equals("UPI")) {
            System.out.println("Pay using UPI");
        }
        else if (type.equals("CARD")) {
            System.out.println("Pay using Card");
        }
        else if (type.equals("CASH")) {
            System.out.println("Pay using Cash");
        }
    }
}
```

Initially this works.

But tomorrow you add:

```
PayPal
Crypto
Net Banking
Apple Pay
```

You'll keep modifying `PaymentService`.

That's not ideal.

## Better: Use Polymorphism

Create an interface:

```java
interface Payment {
	void pay();
}
```

Then:

```java
class UpiPayment implements Payment {
    @Override
    public void pay() {
        System.out.println("Paying using UPI");
    }
}
```

```java
class CardPayment implements Payment {
    @Override
    public void pay() {
        System.out.println("Paying using Card");
    }
}
```

Now:

```java
class PaymentService {
    void processPayment(Payment payment) {
        payment.pay();
    }
}
```

### Usage

```java
PaymentService service = new PaymentService();

service.processPayment(new UpiPayment());
service.processPayment(new CardPayment());
```

Tomorrow:

```java
class PayPalPayment implements Payment {
    @Override
    public void pay() {
        System.out.println("Paying using PayPal");
    }
}
```

You **added a new class** instead of modifying `PaymentService`.

That's the idea of OCP.

```
Payment
   ↑
   ├── UpiPayment
   ├── CardPayment
   ├── PayPalPayment
   └── CashPayment
```

## Key Idea

**Bad:**

```
Add feature
   ↓
Modify existing class
```

**Better:**

```
Add feature
   ↓
Create new implementation
```

## 3. L — Liskov Substitution Principle

## Simple Meaning

> **If B is a subtype of A, you should be able to use B wherever A is expected without breaking the program.**
> 

This principle is mainly about **inheritance**.

## Bad Example

```java
class Bird {
	void fly() {
		System.out.println("Flying");
    }
}
```

Now:

```java
class Sparrow extends Bird {
}
```

That's fine.

But:

```java
class Penguin extends Bird {
    @Override
    void fly() {
        throw new UnsupportedOperationException();
    }
}
```

Problem:

```java
Bird bird=new Penguin();
bird.fly();
```

💥 The program breaks.

The parent says:

> Every `Bird` can fly.
> 

But `Penguin` can't.

The inheritance relationship is wrong.

## Better Design

Separate the concepts:

```java
class Bird {
    void eat() {
        System.out.println("Eating");
    }
}
```

Then:

```java
interface Flyable {
	void fly();
}
```

Sparrow:

```java
class Sparrow extends Bird implements Flyable {
    @Override
    public void fly() {
        System.out.println("Flying");
    }
}
```

Penguin:

```java
class Penguin extends Bird {
}
```

Now:

```
Bird
 ├── Sparrow → Flyable
 └── Penguin
```

## Core Idea

> **Don't force a child class to support behavior that doesn't make sense for it.**
> 

## 4. I — Interface Segregation Principle

## Simple Meaning

> **Don't force a class to implement methods it doesn't need.**
> 

Create more interfaces not one big Interface

Suppose:

```java
interface Worker {
	void work();
	void eat();
}
```

Human:

```java
class Human implements Worker {

    public void work() {
        System.out.println("Working");
    }
    public void eat() {
        System.out.println("Eating");
    }
}
```

Fine.

But now:

```java
class Robot implements Worker {

    public void work() {
        System.out.println("Working");
    }
    public void eat() {
        // Robot doesn't eat!
    }
}
```

The interface is too big.

## Better Design

```java
interface Workable {
	void work();
}
```

```java
interface Eatable {
	void eat();
}
```

Human:

```java
class Human implements Workable, Eatable {

    public void work() {
    }
    public void eat() {
    }
}
```

Robot:

```java
class Robot implements Workable {

    public void work() {
    }
}
```

Now each class implements only what it needs.

## Key Idea

**Bad:**

```
One giant interface
        ↓
Everyone must implement everything
```

**Good:**

```
Small focused interfaces
        ↓
Classes choose what they need
```

---

## 5. D — Dependency Inversion Principle

## Simple Meaning

> **High-level code should depend on abstractions, not concrete implementations.**
> 

Don't make your main class depend directly on one specific class. Make it depend on an interface.

## Bad Example

Suppose we have:

```java
class EmailService {
    void sendEmail() {
        System.out.println("Sending email");
    }
}
```

Then:

```java
class NotificationService {
    private EmailService emailService = new EmailService();
    
    void notifyUser() {
        emailService.sendEmail();
    }
}
```

`NotificationService` is tightly connected to `EmailService`.

What if you want SMS?

```
NotificationService
        ↓
   EmailService
```

It's stuck.
If tomorrow we want to send an SMS instead of an email, we have to change `NotificationService`

## Better: Use an Interface

```java
interface Notification {
	void send();
}
```

Email:

```java
class EmailNotification implements Notification {

    public void send() {
        System.out.println("Sending Email");
    }
}
```

SMS:

```java
class SmsNotification implements Notification {

    public void send() {
        System.out.println("Sending SMS");
    }
}
```

Now:

```java
class NotificationService {

    private Notification notification;

    NotificationService(Notification notification) {
        this.notification = notification;
    }

    void notifyUser() {
        notification.send();
    }
}
```

### Usage — Email

```java
Notification email = new EmailNotification();

NotificationService service = new NotificationService(email);

service.notifyUser();
```

### Usage — SMS

```java
Notification sms = new SmsNotification();

NotificationService service = new NotificationService(sms);

service.notifyUser();
```

Now `NotificationService` doesn't care whether the notification is:

- Email
- SMS
- Push notification
- WhatsApp
- etc.

### Relationship

```
             Notification
              ↑       ↑
              │       │
     EmailNotification  SmsNotification
              ↑
              │
     NotificationService
```

## Core Idea

**Bad:**

```
High-level class
       ↓
Concrete implementation
```

**Better:**

```
High-level class
       ↓
   Abstraction
       ↑
Concrete implementations
```

## Important Connection

> **Dependency Inversion naturally leads to Dependency Injection.**
> 
> 
> **Dependency Inversion = depend on abstractions.**
> 
> **Dependency Injection = give the required dependency from outside.**
> 

# ⭐ SOLID — Quick Revision

| Principle | Easy Meaning | Main Problem |
| --- | --- | --- |
| **S — Single Responsibility** | One job | Class doing too many things |
| **O — Open/Closed** | Extend, don't modify | Constantly changing existing code |
| **L — Liskov Substitution** | Child should behave like parent | Incorrect inheritance |
| **I — Interface Segregation** | Small interfaces | Classes forced to implement unnecessary methods |
| **D — Dependency Inversion** | Depend on abstractions | Tight coupling to concrete classes |

---

---