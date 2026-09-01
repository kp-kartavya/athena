## Intro
I am a Full Stack Java Developer with around 4 years of experience and currently work at TCS.
I mainly work with Java, Spring Boot, and Microservices.
My role involves developing REST APIs, implementing business logic, and working with databases.
On the backend, I have experience with Spring Boot, Hibernate, JPA, Kafka, Redis, and Elasticsearch.
I have also worked on implementing authentication and authorization using Spring Security and JWT.
For communication between services, I have used Kafka for asynchronous messaging.
On the frontend, I work with React.js to build user interfaces.
I use Redux for state management and Axios to integrate frontend applications with backend APIs.
Currently, I am looking for opportunities where I can work on large-scale microservices and full-stack applications while continuing to improve my technical skills.

## Architecture
In our project, we followed a microservices architecture.
The frontend was built using React.js and communicated with backend services via REST APIs.
The backend consisted of multiple Spring Boot microservices, each responsible for a specific business capability.
For data persistence, we used MySQL and DB2, while Redis was used for caching to improve performance.
We integrated Elasticsearch for advanced search capabilities.
For asynchronous communication between services, we used Apache Kafka.
The application was deployed on Linux-based cloud servers, and builds were created using Maven and deployed through a CI/CD pipeline.
We had multiple environments such as Development, QA, UAT, and Production.
For monitoring and debugging, we used centralized logging tools like OpenShift to analyze logs.

## Deployment
In my project, the DevOps and architecture team was responsible for the deployment part
After development, we pushed the code to the Git repositories.
Once SIT testing was approved, the DevOps team triggered Jenkins builds.
The generated build artifacts were then moved to the ARCH Jenkins server.
Finally, the architecture team handled deployment on Nginx servers using Jenkins deployment scripts.

## @Springbootapplication
It is annotated on the main entry point of the class
It is a combination of 3 annotations:
@Configuration - it declares a class as a Spring configuration class
@EnableAutoConfiguration - it automatically configures beans based on project dependencies
@ComponentScanning - it scans packages for components to be managed as beans.


## Dependency Injection
It is a design pattern where objects do not create their own dependencies; they are injected from an external source, like Spring, through constructor, setter, or field injection
It allows loose coupling, improves testability, and makes components easier to maintain.

## What is dependency injection in Spring Boot?

Dependency injection is a design pattern where Spring provides the required dependencies to a class instead of the class creating them itself.

## ACID
Four key properties of DB transactions: A - Atomicity, C - Consistency, I - Isolation, D - Durability
Atomicity: it states that all operations in a transaction are considered as a single unit; either all succeed or none
Consistency: It states that data must be valid before and after a transaction and should follow all the constraints.
Isolation: It states that multiple transactions do not interfere with each other; each works independently
Durability: It states that after a transaction, data should remain saved even if the system crashes due to a database failure

## JPA
It stands for java persistence api
It is a Java specification used for managing relational data in a Java application using objects
It is only a specification; Hibernate is the tool that implements JPA
Hibernate translates your methods into appropriate SQL queries and interacts with the database.
@Entity, @Table, @OneToMany

## Transaction Management
It is a concept that ensures all DB operations execute successfully as a single unit
For example, money was debited from bank A and was not credited to bank B due to a database failure; money was lost
Transaction management prevents this by rolling back both operations

@Transactional
It is annotated mostly on service layer methods
It implements transaction management
It commits on success and rolls back the transaction if an exception occurs

## ORM
It stands for object-relational mapping
It is a technique used to map Java objects to database tables
It reduces boilerplate code and allows developers to interact with the database using objects instead of writing complex SQL queries

## StreamAPI
It is used to process collections of data in a declarative and efficient way using methods like filter(), sort(), and collect()
filter() - takes predicate, has test(), return true/false
map() - takes function, has apply(), return transformed element
collect() - converts stream results into a collection/final output
sort() - used to sort a stream and takes a comparator

## Serialization
It is the process of converting a Java object into a byte stream so that it can be stored, transferred, or persisted
Deserialization is the reverse process of converting the byte stream back into a Java object
A class must implement the Serializable interface to support serialization

transient: tells the JVM to exclude that field when serializing an object.

## serialVersionUID
It is a unique identifier used during serialization and deserialization
## When an object is deserialized, the JVM compares the serialVersionUID in the serialized data with the current class's serialVersionUID.
If they match, deserialization succeeds.
If they don't match, an InvalidClassException is thrown.
It ensures version compatibility between serialized objects and their corresponding class.

## IOC
It stands for inversion of control
It is the principle where the control of object creation and dependency management is transferred from the programmer to the Spring container
Instead of creating objects manually with new, Spring manages and injects them automatically
It helps in loose coupling

## Bean Lifecycle
Spring container creates the bean
dependencies are injected through the constructor, setter, or field injection
bean is initialized using @PostConstruct and init methods
After initialization, the bean becomes available in the application context and is ready to be used throughout the application
After usage, the application context is closed, and clean-up methods like @PreDestroy or destroy are used


## Hash-Map
It has key-value pairs where the key is unique, and the value can be duplicated.
The average initial capacity is 16
## When we put key-value pairs into a HashMap, Java calculates the hash code of the key using hashCode()
This hash code is used to determine the index of the bucket in an internal array
If the bucket is empty, the entry is stored
If another entry exists in the same index(collision), the new entry is stored either in a linked list / red-black tree
For retrieval, the hash is calculated again, the bucket is identified, and equals() is used to find the same key

## SOLID
5 OOPS design principles:
Single responsibility principle
It states that a class should have only one reason to change
Open-closed principle
A class should be open for extension but closed for modification
Liskov Substitution Principle
Child classes should be replaceable with parent classes without affecting parent behavior
Interface segregation principle
Clients should not be forced to implement unused interfaces
Dependency inversion principle
High-level modules depend on abstraction, not concrete implementation

## Mono vs Micro
In mono, the app is deployed as a single unit; components are tightly coupled, easier to develop initially, but harder to maintain
One failure affects the whole app
In micro, the app is split into independent services, loosely coupled; each service has its own DB and deployment, making it easier to scale, maintain, and deploy independently.
Failure in one service does not affect others

## Sync vs Async
In sync, one service sends a request to another service and waits for the response, for example, rest api calls over http
In async, one service sends a message/event and continues processing without waiting for a response, for example, Kafka, RabbitMQ

## Fault tolerance
It is the ability of a system to continue functioning even if some components fail
It prevents cascading failures
It is achieved through timeouts, circuit breakers, and fallbacks

## API gateway
It is the entry point of all client requests in a microservices architecture
It routes requests to services based on the request path or headers
It handles authentication, authorization, rate limiting, and logging
For example, Google Cloud Endpoints, azure api mangement

## Circuit breaker pattern
It is a pattern that prevents the system from calling failing services repeatedly
It stops requests when failures exceed a certain threshold
It moves through closed, open, and half-open states
It improves fault tolerance and system stability
It is commonly implemented using Resilience4J or Hystrix
for example
Order service calls the unavailable inventory service repeatedly
It will lead to increased latency, resource exhaustion, and cascading failures
In a circuit breaker, a threshold is set.
## If a request fails and exceeds this threshold, the circuit breaker trips to the open state
In this state, requests are rejected with a predefined fallback UI
After a time period, it changes to a half-open state, where limited requests are allowed to see if the inventory service has recovered
If test requests are successful, it changes to a closed state, allowing normal traffic to resume
If not, it changes to the open state again

## Service registry
It is the centralized directory where service instances and their network locations (IP address, ports) are stored
Services register themselves at startup
For example, Netflix Eureka, Eureka, and Consul

## Service discovery
It is the process by which services automatically locate and communicate with each other without using a hardcoded URL or IP address
It supports dynamic routing
It can be client-side(Eureka) and server-side(kubernetes)

## Load balancing
It is the process of distributing incoming requests(traffic) across multiple instances of a service to avoid overloading a single instance
It increases fault tolerance and prevents server overload
it can be client side(spring cloud load balancer), or server side(nginx)

## Config server
It is a centralized service used to manage external configuration for all microservices
It stores config in git/file system
It ensures dynamic config updates
For example, Spring Cloud Config Server


## Spring Cloud Bus
It is used to broadcast config changes and events across services
When the config is updated in the config server, Spring Cloud Bus notifies all connected services so that they can refresh their config without restarting
It connects services using a message broker (Kafka/RabbitMQ)

## Distributed tracing
It is a technique to track a single request as it flows across multiple microservices
It helps in debugging and performance monitoring
Each request carries a trace ID and a span ID
Tools used: Zipkin

## == vs equals()
== compares the memory address of two objects
equals() compares the actual content/values of the object

## heap vs stack
heap stores objects and instance variables; the stack stores local variables and method calls
Garbage collectors manage heap memory, and stack memory is allocated and deallocated in LIFO order
The heap is shared among threads; the stack is thread-specific
The heap is a larger memory size; the stack is smaller

## hashmap vs concurrent hashmap
HashMap is not thread-safe and is suited for a single-threaded application; it throws a ConcurrentModificationException when accessed by multiple threads
ConcurrentHashMap creates a copy of the HashMap and supports concurrent access by multiple threads, so it is thread-safe

## @Component vs @Service vs @Repository
@Component is used to create a generic Spring bean
@Service and @Repository are specialized forms of @Component
Internally, Spring treats all of them as beans
@Service improves readability for the service layer
@Repository adds database exception translation support

## Sealed Classes
Sealed classes restrict which classes can extend or implement them
Sealed classes are sealed using the sealed keyword
Allowed child classes are specified using the permit keyword
Child classes must be declared as final, sealed, or non-sealed


## Spring security
The client sends a request to the application
request passes through the Spring Security filter chain
authentication filter extracts credentials( username, password, JWT )
AuthenticationManager validates the credentials
UserDetailsService loads user details from the DB
If authentication succeeds, Spring creates an authentication object and stores it in the SecurityContext
Authorization checks whether the user has the required roles/permissions
If authorized, the request reaches the controller; otherwise, access is denied (401,403)

## Java 8 features
Lambda expression: enables functional programming and reduces boilerplate code
Stream api: process collections using operations like filter(), map(), collect(), etc
Functional interface: interface with single method(for example, predicate, function)
Method references: a shorter way to refer to a method using the operator (::)
Default methods: allow method implementation inside interfaces
Optional class: helps avoid NullPointerException

## Saga Pattern
It is a transaction management pattern used in microservices where each service executes its local transaction and publishes an event.
## If a step fails, compensating transactions are executed to undo previous changes
types:
Choreography-based: services communicate through events
Orchestration-based: a central orchestrator controls the workflow
For example, the flow goes from order service to payment service, but at the inventory service, it fails, and payment will be refunded through a compensating transaction

## Observer Pattern
It is a behavioral design pattern where one object(Subject) maintains a list of dependent objects (Observers) and automatically notifies them whenever it's states changes
Subject - it maintains observers and sends notifications
Observer - it receives updates from the subject
For example, in a stock market application, investors (observers) are notified whenever the stock price (subject) changes.

## Factory Pattern
It is a creational design pattern that provides an interface for creating objects without exposing the object creation logic to the client
Instead of using new directly, the client requests the factory to create the required object
For example, a ShapeFactory creates different objects like Circle, Rectangle, or Square based on input

## @ControllerAdvice vs @RestControllerAdvice
@ControllerAdvice is used for global exception handling, and @RestControllerAdvice is a specialized version of @ControllerAdvice
@ControllerAdvice returns views,pages and @RestControllerAdvice returns response bodies(usually JSON) directly
@ControllerAdvice explicitly needs @ResponseBody to return response bodies but @RestControllerAdvice is a combination of both

## @Scope
It is used to define the lifecycle and visibility of a Spring bean within an IOC container
We can specify common scopes like:
singleton: only one bean instance per Spring container
prototype: a new bean instance is created every time it is requested
session: one bean instance per http session


## Volatile keyword
It ensures that changes made to a variable by one thread are immediately visible to all other threads.
Without volatile, threads may cache variables locally, leading to inconsistent data.

## Api flow
Client sends http request
Request reaches dispatcher servlet
The dispatcher servlet forwards the request to the appropriate controller
Controller calls the service layer for business logic
Services interact with the repo layer
Repo communicates with the DB
Data is returned; the controller returns the response; the dispatcher servlet sends the response back to the client

## Why are strings immutable?
## When a string literal is declared ( String str = ‘hello’), the Java compiler checks the string pool.
If the string already exists in the pool, a reference to the existing object is assigned to the variable.
If the string is not found in the pool, a new String object is created and added to the pool.
Thus, strings are immutable, and it optimizes memory usage by avoiding creating multiple identical String objects.

## ArrayList vs. LinkedList
ArrayList uses a dynamic array internally, so it provides fast access(O(1)) using an index.
A linked list uses a doubly linked list internally, so it provides slower access(O(n)), but it is more efficient for frequent insertions and deletions(O(1))

## Functional interface vs Abstract classes
A functional interface can have only one abstract method and is used with lambda expressions, whereas an abstract class can have multiple abstract and concrete methods
A class can implement multiple interfaces, but a  class can extend only one abstract class

## Fail-fast vs Fail-safe iterator
When we iterate over a collection, Fail-fast iterators immediately throw a ConcurrentModificationException if they detect that the collection has been modified by another thread after the iterator was created.
Fail-safe iterators do not throw ConcurrentModificationException if the collection is modified during iteration. They work on a copy of the collection, so modifications to the original collection do not affect the iterator.
## When working with multiple threads, prefer concurrent collections(fail-safe iterators).

## Comparable vs Comparator
Comparable
It is a functional interface that a class implements to define its natural ordering.
It has a single method, compareTo(), which compares the current object with another object of the same type.
This defines how objects of that class are sorted by default.

Comparator
It is also a functional interface that defines a separate comparison logic.
It has a compare() method that compares two objects.
You create a separate class that implements Comparator when you need a different sorting order than the natural ordering defined by Comparable, or when you want to sort objects of a class that doesn't implement Comparable.

Methods: add(), addAll(), contains(), clear(), remove()


## Overloading vs Overriding
overloading
When we define multiple methods with the same name but different parameters, it is called method overloading. The compiler decides which methods to invoke based on the parameters passed in, so it is also called compile-time polymorphism
overriding
In a parent-child relationship, when a method defined by the parent class is implemented again by the child class with the same name but to do different work is called method overriding. It is achieved through runtime polymorphism

## Generic and Type Erasure
generics
Generics specify the type of object a class, interface, or method will work with
Earlier collections, like lists, used to store any type of object, but while retrieving elements, we needed to do manual typecasting every time, which was error-prone, so generics were created to prevent this.
type Erasure
It removes generic type information to ensure backward compatibility, so that it is compatible with older versions of Java

## Logging
It means recording app events/messages while the app is running
It is used for debugging, tracking requests, and monitoring failures
Tools used: OpenShift

## Metrics
These are numerical measurements of app performance
For example, CPU usage, memory usage, request count, response time, error rate, active users
It is implemented through actuators

## Servlet
It intercepts all the requests and delegates them to appropriate controller, and returns the response to the client
filter
A Filter is part of the Servlet API and executes before the request reaches the DispatcherServlet. It is commonly used for CORS, logging, and request/response modification.
interceptor
An Interceptor is part of Spring MVC and executes after the DispatcherServlet but before the controller. It is mainly used for authentication, authorization, logging, and request processing. Interceptors provide preHandle, postHandle, and afterCompletion methods for different stages of request processing.


## CI/CD
It stands for continuous integration and continuous deployment
CI: Developer merges code into a shared repo; build and test runs are automated on every commit, but need manual approval before prod deployment
CD: The release process of the app is automated with no manual intervention

## Rate limiting
It is a technique used to control the number of requests a client can make to an api within a specific time period
A limit of 100 requests per minute means any requests beyond that limit will be rejected or delayed.
It prevents API abuse
It protects against DDoS attacks

## Stored procedure
It is a precompiled collection of SQL statements stored in the DB
It can be executed repeatedly to improve performance, security, and reusability

For example:
Execution:
Docker image build command
command:

## Feign client implementation
It is a declarative HTTP client used in microservices to simplify REST API communication between services.
You define an interface, and it is annotated with @FeignClient.
Spring scans interfaces annotated with @FeignClient.
A dynamic proxy implementation is created at runtime.
## When a method is called, Feign converts it into http request.
The target microservice is invoked.
The response is converted back into Java objects and returned.

Enable Feign Client
Create Feign Interface
Inject and Use

## Advantages of Spring Boot
Spring Boot is built on top of Spring and reduces the amount of configuration and setup required to develop an application.
It automatically configures beans based on project dependencies and reduces the amount of XML and Java configuration.
It comes with an embedded server, such as Apache Tomcat.
Spring Boot applications are packaged as JAR files, which simplifies deployment.
Spring Boot configuration can be done in external files.
It provides metrics, health checks, and app monitoring tools.

## Idempotency
An operation is idempotent if performing it multiple times produces the same result as performing it once.
example:
GET: Idempotent (only retrieves data)
PUT: Idempotent (updating the same resource multiple times results in the same state)
DELETE: Idempotent (deleting an already deleted resource does not change the outcome)
POST: Not Idempotent (multiple requests may create multiple resources)

## Cascading
It is a JPA mechanism that automatically propagates operations performed on a parent entity to its related child entities.
For example, when a parent entity is saved or deleted, the same operation can automatically be applied to its child entities

## String vs StringBuilder vs StringBuffer
String objects are immutable, so they are thread-safe
StringBuilder objects are mutable, so they are not thread-safe because multiple threads can access and modify the same object concurrently.
StringBuffer objects are also mutable, but they are thread-safe because their methods are synchronized, meaning only one thread can access and modify them at a time.

## final vs finally vs finalize
final
It is a modifier that can be applied to variables, methods, and classes.
The final variables cannot be changed; they become constants.
The final method cannot be overridden by child classes.
The final class cannot be inherited.
finally
finally is a block of code that is used with try-catch blocks.
The code within the finally block is always executed, regardless of whether an exception is thrown or not.
It's typically used for cleanup tasks, such as closing resources (files, network connections, etc.).
finalize
It is a method called by the garbage collector for cleanup tasks related to native resources
It is deprecated, and try-with-resources is used for clean-up tasks now.

## Garbage collection
It is an automatic process of identifying and removing unused objects from heap memory to free resources and improve application performance

## Multi-threading
It is the process of executing multiple threads concurrently within a single process
It enables parallel task execution and improves application performance
It is achieved by extending the Thread class, implementing the Runnable interface, and using an executor service

## Lifecycle of a thread
New: The thread is created but not yet started.
Runnable: The thread is ready to run and is waiting for the CPU to allocate its time.
Running: The thread is currently executing its run() method.
Waiting: The thread is temporarily paused:
Blocked: Waiting for a lock (e.g., in a synchronized block).
Waiting: Waiting indefinitely for another thread (e.g., using wait(), join()).
Timed Waiting: Waiting for a specified time (e.g., using sleep(), wait(timeout)).
Terminated (Dead): The thread has finished executing its run() method or has been terminated due to an exception.

## Creation of threads
Extending the Thread class
## When we extend myClass from a thread class, we have to override the run() method.
We then have to create an instance of our myClass and invoke the start method on it.


## Implementing a Runnable interface
In case of implementing a Runnable interface, we will override the run() method.
We then have to create an instance of our myClass and pass this instance to the Thread class constructor.


## Executor Service
It is a Java framework used to manage and execute threads efficiently through a thread pool
Instead of creating threads manually, tasks are submitted to an executor service, and it handles their creation, reuse, and destruction
submit(): executes a task and returns a Future
execute(): executes a task without returning a result
shutdown(): stops the executor


## start vs run
run()
The run() method contains the code that a thread will execute.
It is the entry point for the thread's execution.
start()
The start() method is used to start a new thread of execution.
It creates a new thread and then calls the run() method in that new thread.
After calling start(), the new thread executes concurrently with the current thread.
If you try to call start() on the same thread object again, you'll get an IllegalThreadStateException because a thread can only be started once.

## synchronization
It is a technique that ensures that only one thread accesses a shared resource at a time, preventing race conditions and maintaining data consistency
types:
synchronized method: locks the entire object and the entire body is synchronized
synchronized block: locks only a specific section of code
static synchronization(class level lock): locks the class object itself

## thread communication
it is acheived using wait(), notify() and notifyAll()
wait(): causes the thread to release the lock and wait
notify(): wakes up one waiting thread
notifyAll(): wakes up all waiting threads
All these methods are defined in the Object class and must be used in a synchronized context

## join() method
The join() method is used to synchronize the execution of threads.
It ensures that the current thread doesn't proceed until another thread has completed its task.
It is different from wait() because it releases the object's monitor lock, whereas join() does not release any lock.


## Daemon thread
It is a thread that provides support services to the user threads
It runs in the background and automatically terminates when all user threads have finished execution
For example, the garbage collector and background monitoring tasks


## OOPS concept
Encapsulation: wrapping data and methods into a single unit(class) and restricting direct access using access modifiers.
Abstraction: hiding implementation details and exposing only essential functionality.
Inheritance: acquiring properties and behavior of the parent class into the child class for code reusability.
Polymorphism: the ability of one object to take multiple forms.

## How do you write queries in your project?
We write queries using the @Query annotation.
We use either JPQL for entity-based queries or Native SQL for DB-specific queries.

JPQL - Java Persistence Query Language
Native SQL


## Lazy Loading
It is a technique where related data is loaded from the DB only when it is actually needed, rather than loading it immediately
Here, orders are fetched only when getOrders is called


## Redis(Remote Dictionary Server)
It is an in-memory key-value data store used for caching, session management, etc.
Since data is stored in memory, Redis provides very fast read and write operations.
In my project, I used Redis as a cache layer to store frequently accessed data.
Before querying the database, the application first checked Redis.
If the data was available in Redis (cache hit), it was returned directly.
Otherwise, the application fetched it from the database, stored it in Redis, and then returned the response.
This reduced database calls and improved API response time.

Implementation:
Add dependency
Configure Redis
Use Redis Template

## Kafka
Kafka is a distributed messaging platform used for asynchronous communication between microservices.
For example, when a user completes an action, one service publishes an event to a Kafka topic.
Other interested services consume that event and perform their respective operations independently.
This reduces direct service-to-service dependency and improves scalability and fault tolerance.

## Components
Producer → Sends messages to Kafka.
Topic → Category/channel where messages are stored.
Consumer → Reads messages from a topic.
Broker → Kafka server that stores messages.

Implementation:
Producer
Consumer

## ElasticSearch
In my project, Elasticsearch was used to provide fast search functionality.
Data from the database was indexed into Elasticsearch, and whenever users searched using keywords, filters, or multiple criteria, the application queried Elasticsearch instead of the database.
This significantly improved search performance.
Database searches scan tables and can become slower with large datasets.
Elasticsearch uses inverted indexes, making text searches extremely fast.

Implementation:
Entity
Repository
Service


## flatMap
It is used to transform and flatten nested collections or streams into a single stream for easier processing.
Flattening means transforming data from Stream<Stream<T>> to Stream<T>.


## Parallel Streams
A parallel stream allows stream operations to be executed concurrently by splitting the data into multiple parts and processing those parts using multiple threads. We can create it using parallelStream() or by calling parallel() on a normal stream. Parallel streams generally use the ForkJoinPool common pool. They are useful for large datasets and CPU-intensive independent operations, but they should not be used for small datasets or I/O-heavy operations; the overhead can make them slower than sequential streams.


## Completable Future
CompletableFuture is a Java API used for asynchronous programming. It allows us to execute tasks asynchronously and perform further operations when the result becomes available without blocking the main flow. supplyAsync() is used when the asynchronous task returns a value, while runAsync() is used when it doesn't. We can chain operations using methods like thenApply(), thenAccept(), and thenCombine(). It is useful when we have independent operations, such as calling multiple services concurrently, and want to improve overall response time.


## REACT JS

## React js
It is a component-based JS library that uses virtual DOM to build fast, scalable, and interactive user interfaces, especially single-page applications (SPA's)

## Component
It is a reusable building block of ui that has its own logic and presentation, making applications modular and maintainable

## functional vs class component
Functional components are simple JS functions that use hooks(useState, useEffect) for state and lifecycle
Class components have classes extending React.component that use state and lifecycle methods
Functional components are recommended in modern React because they are less complex compared to class components

## usestate
It is used to manage and update state in functional components
It returns the current state value and a setter function to update the state
Whenever a state is updated, a component is re-rendered
It replaces this.state in class components

## useeffect
It is used to perform side effects in functional components
It is used to api calls, data fetching, DOM updates, etc
It takes a callback function and a dependency array
[ ] - empty dependency array means it runs only once after initial render
[value] - runs only when value changes
No dependency array means it runs after every render

## Virtual DOM
It is an in-memory copy of the actual DOM that React uses to detect changes and efficiently update the modified parts of the UI.
## When state or props change, React creates a new virtual DOM.
React compares it with the previous virtual DOM (Diffing).
React identifies only the changed elements and then updates only those changes in the real DOM(Reconciliation).

## props vs state
Props are read-only, immutable inputs passed from a parent component to a child component.
State is mutable data managed within a component that can change over time and trigger re-renders.

## Component lifecycle
A React component lifecycle consists of mounting, updating, and unmounting phases.
Mounting happens when the component is first rendered.
Updating happens when state or props change.
Unmounting occurs when a component is removed from the DOM.
In functional components, lifecycle methods are handled using the useEffect hook.
Based on the dependency array, useEffect can mimic mounting, updating, and unmounting behavior.

## Controlled component
It is a form element whose value is managed by React state, making React the single source of truth for the form data.
It helps in getting better control over form data.

## Redux
It is a centralized state management library used to share data across components.
## When the user performs an action like clicking the submit button, the component dispatches an action to a reducer.
The reducer updates the state and returns a new state
The updated state is stored in the Store
Components subscribed to the store automatically receive the updated state and are re-rendered.

Component => Dispatch Action => Reducer => Store Updated => UI Re-rendered

Key components:
Store: centralized state container
Action: describes what happened
Reducer: contains logic for the updated state
Dispatch: sends action to reducer

## axios
It is a promise-based HTTP client used to send HTTP requests from a React app to backend services.
It simplifies API communication by providing automatic features like JSON parsing, interceptors, request cancellation and better error handling

## Prop drilling
It means lifting the state of a component up to a higher-level/parent component so that it can be accessed by multiple components.
Disadvantage: Whenever data is needed from the parent component, it comes from each level rather than directly.
It can be avoided using Redux or the React Context API, which allows components to access shared state directly without passing props through intermediate components.

## React Context API
It is a built-in React feature used to share data across multiple components without passing data manually using props.
It is suitable for small to medium shared data; for complex app redux is suitable.

Implementation
Create a context
Wrap Components with a provider
Access data using useContext

## STREAM HANDS-ON QUESTIONS
## Word count
## Character count
## List of duplicate characters
## Highest salary
## Second highest salary
## Find average
## Find max and min
## Reverse words
## Sum of digits

## Interview Experience

## INFOSYS EXPERIENCE

## If a Kafka consumer is lagging, what would you do and how would you monitor it?
First, I would check the consumer lag to see how far behind the consumer is from the latest messages in the partition. I would monitor metrics such as consumer lag, records consumed rate, processing latency, consumer errors, and CPU/memory usage.
If the consumer is lagging, I would identify the reason. It could be slow business logic, slow database calls, insufficient consumer threads, network issues, or too few partitions/consumers.
Depending on the bottleneck, I could optimize the consumer processing logic, improve database queries, increase the number of consumers within the consumer group, or increase the number of Kafka partitions if more parallelism is required.
For monitoring, we can use tools such as Prometheus and Grafana, Kafka monitoring tools, or cloud monitoring solutions to create dashboards and alerts when consumer lag crosses a configured threshold.

## How did you handle exceptions?
We handled exceptions centrally using @RestControllerAdvice instead of writing try-catch blocks in every controller. We extended ResponseEntityExceptionHandler and overrode methods such as handleMethodArgumentNotValid() to handle validation errors. For business-specific errors, we used custom exceptions and handled them with @ExceptionHandler. We returned a common ApiResponseCommon response structure containing the success flag, message code, description, timestamp, and other error details. This gave us a consistent error response across all APIs and kept the controller and service code clean.
We use global exception handling because it avoids duplicate exception-handling code in every controller, provides a consistent response format, and makes the application easier to maintain.
For @Valid request-body validation, Spring throws MethodArgumentNotValidException. We handled it globally by overriding handleMethodArgumentNotValid() and extracted the validation message before returning our standard error response.

## How did you optimize your React application?
We optimized our React application mainly by reducing unnecessary re-renders and avoiding unnecessary API calls. We used proper componentization and managed state carefully using Redux, so only the required components were updated when state changed. We also used lazy loading and code splitting for larger components, and used pagination when APIs returned large amounts of data. For search fields, we used debouncing so that an API request was not sent for every keystroke.
We avoided keeping unnecessary state at the parent level and passed only the required props to child components. Where required, we used React.memo, useMemo, and useCallback to avoid unnecessary component rendering and recalculation.


## Did you integrate AI in your project?
Yes, I worked on integrating an AI-based chatbot using Spring AI and RAG. The chatbot allowed users to ask questions about application-related information available in our documents and knowledge base.
On the backend, we used Spring Boot with Spring AI to communicate with the LLM. For RAG, we converted the source documents into embeddings and stored them in a vector database. When a user asked a question, we converted the question into an embedding, searched the vector database for relevant documents, and passed the retrieved context along with the question to the LLM.
The LLM generated the response based on the retrieved context, and our Spring Boot API returned the response to the React frontend. This helped us provide answers based on our application's specific data instead of relying only on the model's general knowledge.
With RAG, we retrieve relevant information from our own knowledge base and provide it as context to the LLM. This makes the response more relevant and grounded in our application data.

## How was your app deployed in AWS?
Our application was deployed on AWS using a microservices-based architecture. The React frontend was hosted separately, while the Spring Boot microservices were deployed on AWS compute infrastructure. We used an API Gateway or load balancer as the entry point, which routed requests to the appropriate microservice. The microservices communicated with PostgreSQL for persistent data, while Redis was used for caching and Kafka for asynchronous communication.
We used AWS monitoring services such as CloudWatch to monitor application logs, CPU, memory, and other metrics. Environment-specific configuration and sensitive credentials were managed outside the application code. The deployment process was automated through CI/CD, so after a successful build and testing, the application could be deployed to the required AWS environment.



## Miscellaneous Interview Questions

## BACKEND

## How do multiple threads share data?
Threads in Java share data through objects stored in heap memory. Since multiple threads can access the same object simultaneously, race conditions may occur. To ensure thread safety, we use synchronization mechanisms such as synchronized blocks and concurrent collections. Each thread has its own stack for local variables, but heap memory is shared among all threads.

## Which component provides HTTP support?
DispatcherServlet in Spring MVC handles HTTP requests, while Tomcat provides the underlying HTTP server support

## What was the most complex thing that you did in your project?


## COMPLETE JWT AUTHENTICATION FLOW
## When a user clicks the Login button, the React application sends the username and password to the authentication API.
Spring Security authenticates the credentials using the AuthenticationManager, which internally calls the UserDetailsService to load the user details from the database. If the credentials are valid, the application generates a JWT signed using HS256 and returns it to the client.
The JWT contains three parts: the header, payload, and signature. The payload typically contains claims such as the username, roles, issued time, and expiration time.
The client stores the token in sessionStorage (or localStorage depending on the application). For every subsequent request, the React application sends the token in the Authorization header as a Bearer token.
A Spring Security filter, such as OncePerRequestFilter, extracts the JWT, validates its signature and expiration, loads the user details if required, and creates an authentication object, which is stored in the SecurityContext. The request is then allowed to proceed to the controller.
If the token has expired or is invalid, the request is rejected with a 401 Unauthorized response, and the user must authenticate again.
JWT is considered stateless because the server does not maintain session data. Every request contains all the information needed to authenticate the user.

## EXPLAIN SPRING SECURITY FILTER CHAIN
We use OncePerRequestFilter to ensure our JWT validation logic runs only once for each HTTP request. Inside the doFilterInternal() method, we first read the Authorization header and check whether it contains a Bearer token. If it does, we extract the JWT, retrieve the username from the token, and validate its signature and expiration. We then load the user details using UserDetailsService and create a UsernamePasswordAuthenticationToken. This authentication object is stored in the SecurityContextHolder, which maintains the authentication information for the current request. After setting the authentication, we call filterChain.doFilter() so the request continues to the controller. If we don't set the authentication in the SecurityContext, Spring treats the user as unauthenticated, and secured endpoints return 401 Unauthorized or 403 Forbidden

## REDIS
We used Redis mainly for master data APIs such as Get States and Get Districts because these APIs were accessed frequently, but the data changed very rarely.
We implemented caching using Spring Cache with the @Cacheable annotation. On the first request, Spring checks Redis and finds that the data is not present, so the service fetches the data from PostgreSQL, returns it to the client, and stores it in Redis.
For subsequent requests, Spring directly returns the data from Redis without calling the repository, which reduces database load and significantly improves response time.
Whenever the master data changes, we invalidate or update the cache using annotations such as @CacheEvict or @CachePut, ensuring Redis always contains fresh data.
If Redis goes down in production, the application should continue working by fetching the data directly from the database. Users should still receive the correct response, but the response time may increase because every request now hits the database. This also increases the load on the database.
To handle this, we monitor Redis health, configure appropriate timeouts, and ensure the application gracefully falls back to the database instead of failing the request. Once Redis is available again, the cache is repopulated automatically as requests are processed.

## KAFKA
We primarily used synchronous REST APIs for request-response operations because the client needed an immediate response. However, for operations that did not require an immediate response, we used Kafka for asynchronous communication.
For example, when a user successfully submitted a passport application, the Passport Application Service stored the application details in the database and immediately returned a success response to the user. At the same time, it published an ApplicationSubmitted event to a Kafka topic.
Multiple services subscribed to this event independently. The Notification Service consumed the event to send an email or SMS confirmation, the Audit Service recorded the activity for compliance, and the Analytics Service updated reporting data.
This approach reduced direct service-to-service dependencies. If one of the consumer services was temporarily unavailable, the application submission was still successful because Kafka retained the event until the consumer became available again.
If Kafka is unavailable, the producer will fail to publish the event. Depending on the implementation, the application can retry publishing the event, log the failure, or send the event to a retry mechanism
Kafka was part of our project architecture, but my direct contribution was limited. I mainly worked on the producer-side integration and understood how events were published and consumed. Most of my day-to-day work involved Spring Boot APIs, Spring Security, Redis, and PostgreSQL.


## ELASTIC SEARCH
We chose Elasticsearch because our application needed fast and efficient searching across a large amount of passport data. Although PostgreSQL supports indexing, Elasticsearch is specifically designed for full-text search, keyword search, filtering, fuzzy matching, and relevance-based results.
When documents are indexed, Elasticsearch analyzes the text, breaks it into tokens, and creates an inverted index. For example, if a user searches for "Swapnil Pathak", Elasticsearch tokenizes the query, looks up those tokens in the inverted index, calculates relevance scores, and returns the matching documents.
To handle around 10 million passport records, Elasticsearch distributes the data across multiple primary shards. For example, if the index has 5 primary shards, approximately 2 million documents are stored in each shard. When a search request comes in, all five shards execute the search in parallel, and Elasticsearch aggregates the results before returning them. This parallel processing significantly reduces search time and allows the system to scale horizontally by adding more nodes.
For high availability, each primary shard can have one or more replica shards. If a node containing a primary shard fails, Elasticsearch automatically promotes a replica to become the new primary, ensuring the search service remains available.

## TRANSACTIONAL
@Transactional is used to manage database transactions. We generally apply it at the Service layer because that's where business logic is implemented.
Internally, Spring uses AOP (aspect-oriented programming) to implement transaction management. Instead of calling the actual service bean directly, Spring creates a proxy around the bean. Whenever a transactional method is invoked through the proxy, it starts a database transaction before executing the method.
If the method completes successfully, the proxy commits the transaction. If a runtime exception occurs, the proxy rolls back the transaction, ensuring database consistency.
The proxy then closes the transaction and returns the response to the caller.
One important limitation is that if one @Transactional method calls another @Transactional method within the same class, the second method is invoked directly and bypasses the Spring proxy. Since the proxy is skipped, Spring cannot apply transaction management to that internal call.


## LAZY AND EAGER FETCHING
Lazy fetching loads related entities only when they are accessed, while eager fetching loads related entities immediately along with the parent entity.
By default, @ManyToOne and @OneToOne use EAGER fetching, whereas @OneToMany and @ManyToMany use LAZY fetching.
One common performance issue is the N+1 query problem. For example, if we load 100 departments and then access the employees of each department, Hibernate first executes one query to fetch all departments and then one additional query for each department to fetch its employees, resulting in 101 queries. This can significantly impact performance.
We can solve this by using a Fetch Join, @EntityGraph, or DTO projections to retrieve the required data in a single query.
In production, I generally prefer LAZY loading because it avoids loading unnecessary data. Whenever related data is required, I explicitly fetch it using a Fetch Join or an EntityGraph.

## SAVE, FLUSH, SAVEandFLUSH, COMMIT, FIRST LEVEL CACHE
save() persists the entity through JPA, but Hibernate may not immediately execute the SQL because it maintains entities inside the persistence context, which also acts as the first-level cache.
flush() synchronizes the changes from the persistence context with the database by executing pending SQL statements, but it does not commit the transaction.
saveAndFlush() saves the entity and forces Hibernate to flush pending changes immediately.
Commit happens when the transaction successfully completes and makes the changes permanent. Even after a flush, the transaction can still be rolled back before commit.
Hibernate's first-level cache is enabled by default and exists at the persistence-context/session level. If the same entity is requested multiple times within the same persistence context, Hibernate can return it from the first-level cache instead of querying the database again.


## WHY MUST WE OVERRIDE BOTH EQUALS() AND HASHCODE() TOGETHER?
We override both equals() and hashCode() because HashMap first uses hashCode() to determine the bucket and then uses equals() to identify the correct key within that bucket. If we override only equals() and not hashCode(), two logically equal objects may end up in different buckets, causing HashMap to treat them as different keys. This violates the Java contract and leads to incorrect behavior.


## MULTI THREADING
A thread is the smallest unit of execution within a process. Multiple threads share the same heap memory but have their own stack memory.
In a Spring Boot application, HTTP requests are handled by the embedded web server, such as Tomcat. Tomcat maintains a thread pool. When a request arrives, it assigns an available thread from the pool to process that request. After the response is sent, the thread is returned to the pool for reuse.
If 1000 users hit the application simultaneously, Spring Boot does not create 1000 new threads. It uses the configured Tomcat thread pool. If all threads are busy, additional requests wait in the queue until a thread becomes available.
We use thread pools because creating threads is expensive. Reusing existing threads improves performance, reduces memory usage, and limits the number of concurrent threads, making the application more scalable.
If the thread pool size is fixed at 5, only 5 tasks execute concurrently. The remaining 95 tasks are not rejected. They are placed in the work queue associated with the ExecutorService. As soon as one of the 5 threads completes its current task, it picks the next task from the queue and executes it. This process continues until all 100 tasks have been completed.

## STREAMS
map() transforms each element in the stream, whereas flatMap() is used when each element itself contains another collection or stream. It flattens nested streams into a single stream before applying transformations.
filter() removes elements based on a boolean condition using a Predicate, while map() transforms each element using a Function.
findFirst() always returns the first matching element according to the encounter order, whereas findAny() returns any matching element. In sequential streams, both often return the same result, but in parallel streams findAny() may return any matching element and is generally more efficient.
Streams are lazy because intermediate operations such as map() and filter() do not execute immediately. They are executed only when a terminal operation is invoked.
Intermediate operations return another stream, allowing further processing, while terminal operations produce the final result and terminate the stream pipeline.

## EXCEPTION
The finally block is mainly used for resource cleanup such as closing files, database connections, or sockets. It normally executes whether or not an exception occurs.
However, finally may not execute if the JVM terminates abruptly, for example by calling System.exit(0) or if the JVM crashes.
The throw keyword is used to explicitly throw an exception, whereas throws is used in a method signature to declare that the method may throw one or more exceptions.
Checked exceptions are verified at compile time and must either be handled or declared using throws. Unchecked exceptions occur at runtime and are not enforced by the compiler.

## @Component, @Service, @Repository, @Controller, @RestController
@Component is a generic stereotype annotation used to register a class as a Spring Bean.
@Service is a specialization of @Component and is used for the service layer where business logic is implemented.
@Repository is also a specialization of @Component and is used for the persistence layer. In addition to creating a bean, it provides automatic exception translation by converting low-level persistence exceptions into Spring's DataAccessException hierarchy.
@Controller is used for Spring MVC controllers that handle incoming HTTP requests and typically return a view.
@RestController is a combination of @Controller and @ResponseBody, so the return value of every handler method is automatically written to the HTTP response body, usually as JSON.
All of these annotations create Spring Beans. The reason for having different annotations is to clearly separate application layers, improve code readability, and allow Spring to apply layer-specific behavior where applicable.

## @Autowired
When Spring sees @Autowired, it looks for a bean that matches the required dependency and injects it into the target bean. Dependency resolution is primarily done by type. If multiple beans of the same type are available, Spring throws a NoUniqueBeanDefinitionException unless we resolve the ambiguity using @Qualifier or @Primary.
In field injection, Spring injects the dependency directly into the field. In setter injection, it uses a setter method, while in constructor injection, dependencies are provided through the constructor.
I prefer constructor injection because dependencies are explicit, can be declared as final, make the class easier to test, and ensure required dependencies are available when the object is created.

## GET API FLOW
When the client sends GET /employees/101, the request first reaches the embedded Tomcat server. Before the request reaches the controller, it passes through the configured servlet filters, including the Spring Security filter chain if security is enabled.
The request then reaches the DispatcherServlet, which acts as the front controller of Spring MVC. It identifies the appropriate handler method based on the request mapping, in this case EmployeeController.getEmployee().
Spring extracts 101 from the URL using @PathVariable and passes it to the controller method. The controller delegates the request to the service layer, where the business logic is implemented. The service calls the repository, which uses JPA/Hibernate to execute the database query.
The result is returned from the repository to the service, then to the controller. Spring MVC then serializes the returned Employee object, typically into JSON, and the DispatcherServlet sends the HTTP response back to the client.
The main responsibility of DispatcherServlet is request dispatching within Spring MVC. Authentication and authorization are generally handled earlier by Spring Security's filter chain.

## SPRING BOOT CONFIGURATION
Spring Boot uses the spring.datasource.*  properties along with the database and JPA dependencies on the classpath to configure the application's DataSource.
Spring Boot Auto-Configuration automatically configures commonly required beans based on the dependencies available on the classpath and the application configuration, reducing the amount of manual configuration required.
Starter dependencies are convenient dependency descriptors that bring together the libraries required for a particular feature. For example, spring-boot-starter-data-jpa provides the dependencies required for Spring Data JPA and Hibernate integration.
@SpringBootApplication is a convenience annotation that combines @Configuration, @EnableAutoConfiguration, and @ComponentScan. @Configuration indicates that the class can provide bean definitions, @EnableAutoConfiguration enables Boot's automatic configuration, and @ComponentScan searches for Spring components in the relevant package hierarchy.

## TIMEOUT, RETRY, CIRCUIT BREAKER, FALLBACK
If Order Service repeatedly calls an unavailable Payment Service, it can consume threads and connections, increase network overhead, and potentially cause cascading failures.
We can use a combination of timeout, retry, circuit breaker, and fallback. A timeout ensures Order Service doesn't wait indefinitely. For temporary failures, we can retry a limited number of times. If failures continue beyond the configured threshold, the circuit breaker moves from CLOSED to OPEN and subsequent calls are rejected immediately instead of reaching Payment Service.
After a configured wait period, the circuit moves to HALF-OPEN and allows a few test requests. If those requests succeed, the circuit returns to CLOSED. If they fail, it goes back to OPEN.
When the circuit is OPEN, we can provide a fallback response to the client, such as informing them that payment processing is temporarily unavailable, instead of allowing the entire request chain to fail.

## KAFKA IN DETAIL
A Kafka topic is a logical channel where producers publish records. A topic is divided into partitions, which allow Kafka to distribute data and process records in parallel. A consumer group is a group of consumers that collectively consume records from a topic, with each partition assigned to only one consumer within that group at a time.
If a topic has 3 partitions and a consumer group has 5 consumers, only 3 consumers can actively consume because one partition can be assigned to only one consumer within the same group. The remaining 2 consumers remain idle. If one active consumer goes down, Kafka performs a rebalance and assigns its partition to another available consumer.
An offset is the sequential position of a record within a Kafka partition. Kafka uses offsets to track how far a consumer has processed a partition. The committed offsets for consumer groups are stored in Kafka's internal __consumer_offsets topic. If a consumer processes a message but crashes before committing its offset, that message can be consumed again after the consumer restarts. This is the basis of at-least-once delivery, where messages are guaranteed to be processed at least once, but duplicates can occur.

## SQL



## SECOND HIGHEST SALARY
Query 1:

Query 2:


## SECOND HIGHEST SALARY FOR EACH DEPARTMENT

Query 1:


Query 2:


## SALARY GREATER THAN AVERAGE SALARY OF DEPARTMENT
Query 1:


Query 2:


## FRONT END

## useEffect
useEffect is a React hook used to perform side effects in a component, such as API calls, subscriptions, timers, or event listeners. With an empty dependency array, the effect runs after the initial render and doesn't re-run because of dependency changes. Without a dependency array, it runs after every render. If we provide [departmentId], it runs after the initial render and whenever departmentId changes. We return a cleanup function when we need to remove a subscription, event listener, timer, or other resource when the effect is cleaned up.


## PROPS AND STATES
Props are read-only data passed from a parent component to a child component. The parent provides the props, and the child should not directly modify them. If the child needs to communicate something back to the parent, the parent can pass a callback function through props.
State is data managed by a component or a state-management solution. When relevant state changes, React schedules a re-render of the component.
Prop drilling occurs when data needs to be passed through multiple intermediate components even though those components don't actually need the data themselves. We can avoid this using React Context API or a centralized state-management solution such as Redux, depending on the application's requirements.

## REDUX
Redux Store is the centralized place where application state is maintained. An Action describes an event or state change and generally contains a type and payload. The Reducer contains the logic for updating the state based on the action. dispatch() sends an action to the Redux store, which then passes it through the appropriate reducer. A Selector is used to read specific data from the Redux store.
For example, after a successful login, I can dispatch a login action containing the user information. The reducer updates the user state in the store, and components that consume that state using a selector are updated accordingly.

## AWS

## 1)  EC2 vs ECS vs EKS — which one would you use and why?
EC2 provides virtual servers where we manage the operating system and deploy our applications ourselves. ECS is a managed container orchestration service for running Docker containers, while EKS is AWS's managed Kubernetes service. For a Spring Boot microservices application, I would prefer ECS if the application is containerized and we don't need the complexity of Kubernetes. I would choose EKS when we specifically need Kubernetes features or already have a Kubernetes-based infrastructure.



## 2) How would you deploy a Spring Boot JAR on EC2?
First, I would build the Spring Boot application using Maven or Gradle and generate the JAR file. I would provision an EC2 instance with the required Java runtime and security configuration, copy the JAR to the server, configure the required environment properties, and run the application using the Java command. For production, I would run it as a service so that it can automatically restart if the application fails. I would then place a load balancer in front of the instances if multiple instances are required.



## 3) How does a Load Balancer distribute requests?
A load balancer acts as a single entry point for clients and distributes incoming requests across multiple healthy application instances. It performs health checks on the instances and sends traffic only to healthy instances. This improves availability and allows us to scale the application horizontally.



If EC2-2 becomes unhealthy:



## 4) What is Auto Scaling?
Auto Scaling automatically increases or decreases the number of application instances based on configured conditions such as CPU utilization, request count, or other metrics. During high traffic, it can launch additional instances, and when traffic decreases, it can remove unnecessary instances. This helps maintain availability while controlling infrastructure cost.



## 5) What is RDS?
Amazon RDS is a managed relational database service. It supports databases such as PostgreSQL, MySQL, Oracle, and others. AWS manages tasks such as backups, patching, monitoring, and high availability depending on the configuration. For a Spring Boot application using PostgreSQL, we can use RDS instead of managing PostgreSQL directly on an EC2 server.



## 6) What is S3?
Amazon S3 is an object storage service used to store files and objects such as images, documents, videos, backups, and static website files. It provides highly durable storage and can be integrated with other AWS services. For a React application, static build files can also be hosted using S3, often with CloudFront in front of it for faster global delivery.


## 7) What is CloudWatch?
Amazon CloudWatch is used for monitoring AWS resources and applications. We can use it to monitor metrics such as CPU utilization, memory-related metrics where configured, request counts, errors, and application logs. We can also configure alarms so that we are notified when a metric crosses a particular threshold.



## 8) How would you manage secrets?
I would avoid storing passwords, database credentials, API keys, or JWT secrets directly in the source code or Git repository. In AWS, I would use services such as AWS Secrets Manager or Systems Manager Parameter Store to securely store configuration and secrets. The application would retrieve them through the appropriate IAM permissions.
