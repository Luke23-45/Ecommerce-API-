Avoiding Transitive Dependency Access: CartService should not have to reach into productService to get authService (e.g., this.productService.getAuthService()). This would break the encapsulation of productService and violate the Dependency Inversion Principle. CartService shouldn't need to know about the internal dependencies of productService.

Clearer Intent and Testability: By injecting authService directly into CartService, you make it explicit in CartService's constructor signature that it needs user/auth capabilities. When testing CartService, you can easily provide a mock IAuthService directly, regardless of whether you provide a real or mock IProductService.

MongoDB is a NoSQL database that uses a document-oriented data model. Its architecture is designed to provide high performance, high availability, and easy scalability. Below is a detailed explanation of the key components of MongoDB architecture:

### 1. **Database**
A MongoDB database is a container for collections. Each database can have multiple collections and is stored in a single data file on disk. MongoDB allows multiple databases to be created within a single instance.

### 2. **Collections**
Collections are analogous to tables in relational databases. They are groups of MongoDB documents and do not enforce a schema, meaning that documents within a collection can have different fields and structures. Collections are created automatically when the first document is inserted.

### 3. **Documents**
Documents are the basic units of data in MongoDB and are represented in BSON (Binary JSON) format. Each document is a set of key-value pairs, where keys are strings and values can be various data types, including arrays and nested documents. This flexibility allows for complex data structures to be stored easily.

### 4. **BSON**
BSON (Binary JSON) is a binary representation of JSON-like documents. It extends JSON's capabilities by including additional data types, such as ObjectId, Date, and others, which are not available in standard JSON. BSON is designed to be efficient for both storage and scanning.

### 5. **Indexes**
Indexes in MongoDB are similar to indexes in relational databases. They improve the speed of data retrieval operations on a collection. MongoDB supports various types of indexes, including single-field, compound, geospatial, text, and hashed indexes. Indexes can significantly enhance query performance but may slow down write operations due to the overhead of maintaining the index.

### 6. **Replica Sets**
A replica set is a group of MongoDB servers that maintain the same data set. Replica sets provide redundancy and high availability. Each replica set consists of a primary node (which receives all write operations) and one or more secondary nodes (which replicate the primary's data). If the primary node fails, one of the secondary nodes can be automatically elected as the new primary.

### 7. **Sharding**
Sharding is a method for distributing data across multiple servers to ensure horizontal scalability. In a sharded cluster, data is partitioned into chunks, and each chunk is stored on different shards (servers). MongoDB uses a shard key to determine how data is distributed. This allows for handling large datasets and high throughput by spreading the load across multiple servers.

### 8. **Config Servers**
Config servers store metadata and configuration settings for a sharded cluster. They maintain the mapping of the data chunks to the shards and provide the necessary information for routing queries to the appropriate shard. Config servers are critical for the operation of sharded clusters.

### 9. **Mongos**
Mongos is a routing service for sharded clusters. It acts as an interface between client applications and the sharded database. When a client sends a query, mongos determines which shard(s) to route the query to based on the shard key and the metadata stored in the config servers.

### 10. **Aggregation Framework**
The aggregation framework in MongoDB allows for the processing of data and the transformation of documents into aggregated results. It provides a powerful way to perform operations such as filtering, grouping, and sorting. The aggregation pipeline consists of multiple stages, where each stage transforms the data in some way.

### 11. **Change Streams**
Change streams allow applications to access real-time data changes without the complexity and risk of tailing the oplog. This feature enables developers to listen for changes to documents in a collection and react accordingly, making it easier to build reactive applications.

### 12. **Drivers and APIs**
MongoDB provides official drivers for various programming languages, allowing developers to interact with the database using their preferred language. These drivers handle the communication between the application and the MongoDB server, providing a convenient API for performing CRUD (Create, Read, Update, Delete) operations.

### 13. **Management Tools**
MongoDB offers various management tools, such as MongoDB Atlas (a cloud-based database service), MongoDB Compass (a GUI for managing and visualizing data), and the MongoDB shell (a command-line interface for interacting with the database). These tools help developers and administrators manage their MongoDB deployments effectively.

### Conclusion
MongoDB's architecture is designed to provide flexibility, scalability, and high availability. Its document-oriented model allows for complex data structures, while features like replica sets and sharding ensure that applications can handle large volumes of data and traffic. Understanding these components is crucial for effectively utilizing MongoDB in modern application development.

Let's delve into the details of the "Defining Schemas and Models" module, focusing on the learning objectives and the first two topics: "Introduction to Mongoose Schemas" and "Data Types."

## In-Depth Explanation of Defining Schemas and Models in Mongoose

**Learning Objectives:**

1. **Understand the importance of defining schemas in Mongoose.**

Defining schemas in Mongoose is **absolutely fundamental** to working effectively with MongoDB in your Node.js applications.1 Here's why it's so important:
* **Data Structure and Consistency:** MongoDB is schema-less, meaning documents within a collection don't have to adhere to a rigid structure. While this flexibility can be beneficial, it can also lead to inconsistencies and difficulties in managing and querying your data over time. Mongoose schemas provide a way to **impose structure** on your MongoDB documents. By defining a schema, you specify the fields that documents in a collection should have, their data types, and any additional constraints. This ensures a level of consistency across your data, making it easier to understand, maintain, and query.

* **Data Validation:** Schemas allow you to define **validation rules** for your data. This is crucial for ensuring data integrity. You can specify whether a field is required, the minimum or maximum length of a string, the range of a number, whether a value must be unique, and much more. Mongoose automatically handles this validation before saving data to the database, preventing invalid or incomplete data from being stored. This reduces the risk of errors and inconsistencies in your application.

* **Data Type Casting and Conversion:** Mongoose schemas define the expected data type for each field. When you interact with your MongoDB database through Mongoose, it attempts to **cast the data** you provide into the specified data type. For example, if you define a field as a `Number` and you try to save a string that can be converted to a number (like "123"), Mongoose will automatically convert it. This simplifies data handling and reduces the need for manual type conversions in your application code.

* **Middleware (Hooks):** Schemas enable you to define **middleware functions** (also known as hooks) that are executed at specific points during the lifecycle of your documents (e.g., before saving, before validating, before removing). This allows you to perform actions like data transformation, logging, or triggering other events automatically. Middleware provides a powerful mechanism for encapsulating logic related to your data within the schema definition.

* **Simplified Querying and Manipulation:** By defining a schema and creating a Mongoose **model** from it, you gain access to a rich set of methods provided by Mongoose for querying, updating, and deleting documents. These methods are more abstract and easier to use compared to the lower-level operations provided by the native MongoDB driver. Mongoose handles the complexities of interacting with MongoDB behind the scenes, allowing you to focus on your application logic.

* **Documentation and Collaboration:** Schemas serve as a form of **documentation** for your data structure. When other developers (or even your future self) look at a Mongoose schema, they can quickly understand the expected structure and types of data in your MongoDB collections. This improves collaboration and makes it easier to maintain the application over time.
```

In essence, Mongoose schemas bring the benefits of structure and organization to the flexibility of MongoDB, making it easier to build robust and maintainable applications.2

2. **Learn how to define various data types and schema options.**

Mongoose provides a wide range of built-in data types that you can use to define the type of data each field in your documents should hold.3 Additionally, it offers various schema options that allow you to configure the behavior and constraints of your fields.

```
**Data Types:**

* **`String`:** Used for storing textual data.
    * **Example:** `name: { type: String }`
    * **Schema Options:** You can apply options like `required` (must have a value), `default` (a default value if none is provided), `enum` (allowed values), `match` (a regular expression to match), `minlength`, `maxlength`, `trim` (remove leading/trailing whitespace), `lowercase`, `uppercase`.
    * **Example with Options:**
        ```javascript
        const userSchema = new mongoose.Schema({
          username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
            minlength: 3,
            maxlength: 50
          }
        });
        ```
* **`Number`:** Used for storing numerical data (both integers and floating-point numbers).
    * **Example:** `age: { type: Number }`
    * **Schema Options:** `required`, `default`, `min`, `max`.
    * **Example with Options:**
        ```javascript
        const productSchema = new mongoose.Schema({
          price: {
            type: Number,
            required: true,
            min: 0
          }
        });
        ```

* **`Boolean`:** Used for storing true/false values.
    * **Example:** `isActive: { type: Boolean }`
    * **Schema Options:** `required`, `default`.
    * **Example with Options:**
        ```javascript
        const taskSchema = new mongoose.Schema({
          isCompleted: {
            type: Boolean,
            default: false
          }
        });
        ```

* **`Date`:** Used for storing dates and times.
    * **Example:** `createdAt: { type: Date }`
    * **Schema Options:** `required`, `default` (can be `Date.now` for the current date/time), `min`, `max`.
    * **Example with Options:**
        ```javascript
        const eventSchema = new mongoose.Schema({
          startDate: {
            type: Date,
            required: true
          },
          endDate: {
            type: Date,
            default: Date.now
          }
        });
        ```

* **`Array`:** Used for storing ordered lists of values. The values in the array can be of any valid Mongoose data type (including other arrays or objects).
    * **Example:** `tags: { type: [String] }` (an array of strings)
    * **Example:** `scores: { type: [Number] }` (an array of numbers)
    * **Example:** `items: { type: [{ name: String, quantity: Number }] }` (an array of embedded objects)
    * **Schema Options:** You can apply validators to the array itself (e.g., `minlength`, `maxlength`) and to the elements within the array.
    * **Example with Options and Embedded Object:**
        ```javascript
        const orderSchema = new mongoose.Schema({
          items: {
            type: [{
              name: { type: String, required: true },
              quantity: { type: Number, required: true, min: 1 }
            }],
            validate: {
              validator: function(array) {
                return array && array.length > 0;
              },
              message: 'Order must have at least one item.'
            }
          }
        });
        ```

* **`Object`:** Used for storing arbitrary JavaScript objects. This provides flexibility but can sometimes make querying and validation more complex.
    * **Example:** `settings: { type: Object }`
    * **Schema Options:** You can define the structure of the object within the schema definition.
    * **Example with Defined Properties:**
        ```javascript
        const configSchema = new mongoose.Schema({
          settings: {
            type: {
              theme: String,
              notificationsEnabled: Boolean
            }
          }
        });
        ```

* **`Buffer`:** Used for storing binary data, such as images or files.
    * **Example:** `imageData: { type: Buffer }`
    * **Schema Options:** `required`.

* **`Mixed`:** Represents a schema-less type. You can store any kind of data in a field defined as `Mixed`. This bypasses Mongoose's type casting and validation. Use with caution as it can reduce the benefits of using Mongoose.
    * **Example:** `data: { type: mongoose.Schema.Types.Mixed }`
    * **Note:** It's generally better to be as specific as possible with your data types.

* **`ObjectId`:** Represents a unique identifier, typically used for referencing other documents in the database (similar to foreign keys in relational databases). It's the default type for the `_id` field in Mongoose documents.
    * **Example:** `author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }` (This example also demonstrates how to create a reference to the 'User' model for population).
    * **Schema Options:** `required`, `ref` (specifies the model to which this `ObjectId` refers, enabling population).


**Creating `mongoose.Schema` Instances:**

To define a schema, you create an instance of the `mongoose.Schema` class, passing in an object that describes the structure of your documents.



```JavaScript
const mongoose = require('mongoose');

// Define a simple schema for a blog post
const blogPostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // Assuming you have a 'User' model
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// You can also pass a second argument to the Schema constructor
// to define additional schema options at the schema level.
const anotherSchema = new mongoose.Schema({
  // ... your schema definition ...
}, {
  timestamps: true // Automatically adds createdAt and updatedAt fields
});

// To use this schema, you need to create a Mongoose model from it
const BlogPost = mongoose.model('BlogPost', blogPostSchema);

// Now you can create and interact with BlogPost documents
```

In the example above:

- We import the `mongoose` library.
- We create a new `mongoose.Schema` instance, passing in an object where the keys represent the field names and the values define the data type and any associated options.
- For the `author` field, we use `mongoose.Schema.Types.ObjectId` and the `ref` option to establish a reference to the 'User' model. This allows us to use Mongoose's population feature to retrieve the actual user document when querying for blog posts.
- For `createdAt` and `updatedAt`, we set the `default` value to `Date.now`, which will automatically set the current date and time when a new document is created.
- The second example demonstrates using the `timestamps` schema option, which automatically adds `createdAt` and `updatedAt` fields to the schema.

Understanding these data types and schema options is crucial for effectively modeling your data in MongoDB using Mongoose. By choosing the appropriate types and options, you can ensure data integrity, improve query performance, and simplify your application logic.



Okay, here are more than six examples of complex database structures involving nested objects and arrays. For each example, you'll need to create a corresponding Mongoose schema later. I've also included an example object that would fit that structure.

**Example 1: A Recipe**

* A recipe has a title, description, an array of ingredients, and an array of instructions.
* Each ingredient in the array is an object with properties like `name` (string) and `quantity` (string).
* Each instruction in the array is a string representing a step.

**Example Object:**

```json
{
  "title": "Delicious Chocolate Cake",
  "description": "A classic chocolate cake recipe.",
  "ingredients": [
    { "name": "Flour", "quantity": "2 cups" },
    { "name": "Sugar", "quantity": "1.5 cups" },
    { "name": "Cocoa Powder", "quantity": "0.75 cup" }
  ],
  "instructions": [
    "Preheat oven to 350°F.",
    "Grease and flour a cake pan.",
    "Mix dry ingredients together."
  ]
}
```

**Example 2: A Bookstore Order**

* An order has an order ID, a customer ID, an array of ordered items, and a shipping address.
* Each ordered item in the array is an object with properties like `bookId` (string), `title` (string), `quantity` (number), and `price` (number).
* The shipping address is a nested object with properties like `street` (string), `city` (string), `zipCode` (string), and `country` (string).

**Example Object:**

```json
{
  "orderId": "ORD-12345",
  "customerId": "CUST-6789",
  "orderedItems": [
    { "bookId": "ISBN-001", "title": "The Great Novel", "quantity": 1, "price": 25.99 },
    { "bookId": "ISBN-002", "title": "Mystery Solved", "quantity": 2, "price": 12.50 }
  ],
  "shippingAddress": {
    "street": "123 Main Street",
    "city": "Anytown",
    "zipCode": "12345",
    "country": "USA"
  }
}
```

**Example 3: A University Course**

* A course has a course code, a title, a description, an array of instructors, and an array of modules.
* Each instructor in the array is an object with properties like `name` (string) and `email` (string).
* Each module in the array is an object with properties like `title` (string) and an array of `topics` (strings).

**Example Object:**

```json
{
  "courseCode": "CS101",
  "title": "Introduction to Computer Science",
  "description": "A foundational course in computer science.",
  "instructors": [
    { "name": "Dr. Smith", "email": "smith@uni.edu" },
    { "name": "Professor Jones", "email": "jones@uni.edu" }
  ],
  "modules": [
    {
      "title": "Module 1: Basics of Programming",
      "topics": ["Variables", "Data Types", "Control Flow"]
    },
    {
      "title": "Module 2: Object-Oriented Programming",
      "topics": ["Classes", "Objects", "Inheritance"]
    }
  ]
}
```

**Example 4: A Social Media Post**

* A post has a user ID, content (string), a timestamp, and an array of comments.
* Each comment in the array is an object with properties like `userId` (string), `text` (string), and `createdAt` (date).

**Example Object:**

```json
{
  "userId": "user123",
  "content": "Just finished reading a great book!",
  "timestamp": "2025-04-16T10:00:00Z",
  "comments": [
    { "userId": "user456", "text": "Which book?", "createdAt": "2025-04-16T10:05:00Z" },
    { "userId": "user789", "text": "Sounds interesting!", "createdAt": "2025-04-16T10:10:00Z" }
  ]
}
```

**Example 5: A Product with Variations**

* A product has a name, description, base price, and an array of variations.
* Each variation in the array is an object with properties like `color` (string), `size` (string), and `stock` (number).

**Example Object:**

```json
{
  "name": "T-Shirt",
  "description": "A comfortable cotton t-shirt.",
  "basePrice": 20.00,
  "variations": [
    { "color": "Red", "size": "S", "stock": 50 },
    { "color": "Blue", "size": "M", "stock": 30 },
    { "color": "Green", "size": "L", "stock": 25 }
  ]
}
```

**Example 6: A Company Organization Chart**

* A company has a name and an array of departments.
* Each department in the array is an object with a `name` (string) and an array of `employees`.
* Each employee in the array is an object with properties like `name` (string), `position` (string), and a nested `contact` object.
* The `contact` object has properties like `email` (string) and an array of `phoneNumbers` (strings).

**Example Object:**

```json
{
  "name": "Acme Corp",
  "departments": [
    {
      "name": "Marketing",
      "employees": [
        {
          "name": "Alice Smith",
          "position": "Marketing Manager",
          "contact": {
            "email": "alice.smith@acme.com",
            "phoneNumbers": ["123-456-7890", "987-654-3210"]
          }
        },
        {
          "name": "Bob Johnson",
          "position": "Marketing Specialist",
          "contact": {
            "email": "bob.johnson@acme.com",
            "phoneNumbers": ["111-222-3333"]
          }
        }
      ]
    },
    {
      "name": "Engineering",
      "employees": [
        {
          "name": "Charlie Brown",
          "position": "Lead Engineer",
          "contact": {
            "email": "charlie.brown@acme.com",
            "phoneNumbers": ["444-555-6666"]
          }
        }
      ]
    }
  ]
}
```

**Example 7: A Travel Itinerary**

* An itinerary has a trip name, start date, end date, and an array of days.
* Each day in the array is an object with a `date` (date) and an array of `activities`.
* Each activity in the array is an object with a `time` (string) and a `description` (string).

**Example Object:**

```json
{
  "tripName": "European Adventure",
  "startDate": "2025-05-01",
  "endDate": "2025-05-10",
  "days": [
    {
      "date": "2025-05-01",
      "activities": [
        { "time": "9:00 AM", "description": "Arrive in Paris" },
        { "time": "11:00 AM", "description": "Check into hotel" }
      ]
    },
    {
      "date": "2025-05-02",
      "activities": [
        { "time": "10:00 AM", "description": "Visit the Eiffel Tower" },
        { "time": "2:00 PM", "description": "Explore the Louvre Museum" }
      ]
    }
  ]
}
```
Let's explore the details of the "Creating and Reading Data" module in Mongoose.

**Learning Objectives:**

1.  **Learn how to create new documents in your MongoDB collections using Mongoose models.**

    This objective focuses on understanding the process of taking the structure defined by your Mongoose schema and using it to insert new data into your MongoDB database. Mongoose provides convenient ways to create and save documents based on your defined models.

2.  **Master various methods for reading data from the database based on different criteria.**

    This objective emphasizes the importance of being able to retrieve data from your MongoDB database efficiently and accurately. You'll learn about different methods that allow you to specify various conditions and criteria to find the specific documents you need.

3.  **Understand how to query for single documents and multiple documents.**

    This objective highlights the distinction between retrieving one specific document (e.g., a user by their ID) versus retrieving a collection of documents that match certain criteria (e.g., all active users). Mongoose offers different methods tailored for each of these scenarios.

4.  **Explore different query options for filtering, sorting, and limiting results.**

    This objective focuses on refining your data retrieval process. You'll learn how to use various options to filter the results based on specific conditions, sort the retrieved documents in a desired order, and limit the number of documents returned to optimize performance and manage data effectively.

**Topics:**

**Creating Documents:**

1.  **Creating Mongoose models from schemas using `mongoose.model()`:**

    Before you can create documents, you need to create a **model**. A Mongoose model is a constructor compiled from your schema definition. An instance of a model represents a MongoDB document. You use the `mongoose.model()` method to create a model. It takes two arguments:

    * The **name of the collection** (Mongoose will typically pluralize this name and look for the corresponding collection in your MongoDB database).
    * The **schema** you previously defined.

    ```javascript
    const mongoose = require('mongoose');

    // Define a schema (as shown in the previous explanation)
    const userSchema = new mongoose.Schema({
      username: { type: String, required: true, unique: true },
      email: { type: String, required: true },
      age: Number
    });

    // Create a Mongoose model named 'User' based on the userSchema
    const User = mongoose.model('User', userSchema);

    // Now 'User' is your model, and you can use it to interact with the 'users' collection
    ```

2.  **Instantiating model objects:**

    Once you have a model, you can create new document objects (instances of the model) in memory. This is similar to creating an object from a class in other programming languages. You do this using the `new` keyword followed by the model name.

    ```javascript
    // Create a new User document object
    const newUser = new User({
      username: 'john.doe',
      email: 'john.doe@example.com',
      age: 30
    });

    // The 'newUser' object now holds the data but hasn't been saved to the database yet.
    ```

3.  **Saving documents using the `save()` method:**

    To persist the in-memory document object to your MongoDB database, you use the `save()` method on the model instance. This method returns a Promise, so you'll typically use `async/await` or `.then()` and `.catch()` to handle the result.

    ```javascript
    async function saveNewUser() {
      const newUser = new User({
        username: 'jane.doe',
        email: 'jane.doe@example.com',
        age: 25
      });

      try {
        const savedUser = await newUser.save();
        console.log('User saved:', savedUser);
      } catch (error) {
        console.error('Error saving user:', error);
      }
    }

    saveNewUser();
    ```

    When you call `save()`, Mongoose will perform any defined validation on the document before attempting to save it. If validation fails, the `save()` operation will result in an error.

4.  **Creating multiple documents using the `create()` method:**

    Mongoose also provides a convenient way to create and save one or more documents in a single operation using the static `create()` method on the model. This method also performs validation before saving. It returns a Promise that resolves to the created document(s).

    ```javascript
    async function createUsers() {
      try {
        const users = await User.create([
          { username: 'peter.pan', email: 'peter.pan@neverland.com', age: 100 },
          { username: 'wendy.darling', email: 'wendy@neverland.com', age: 16 }
        ]);
        console.log('Users created:', users);
      } catch (error) {
        console.error('Error creating users:', error);
      }
    }

    createUsers();

    // You can also create a single document using create()
    async function createSingleUser() {
      try {
        const user = await User.create({ username: 'captain.hook', email: 'hook@neverland.com' });
        console.log('User created:', user);
      } catch (error) {
        console.error('Error creating user:', error);
      }
    }

    createSingleUser();
    ```

**Reading Documents (Querying):**

Mongoose provides several methods for querying documents from your MongoDB collections.

1.  **Basic querying using the `find()` method to retrieve multiple documents:**

    The `find()` method is used to retrieve all documents that match a given query. If you pass an empty object `{}` as the query, it will return all documents in the collection. It returns a Query object, which you can then `await` or use `.then()` to get the results.

    ```javascript
    async function getAllUsers() {
      try {
        const allUsers = await User.find();
        console.log('All users:', allUsers);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    }

    getAllUsers();

    // Find users with age greater than 20
    async function getAdultUsers() {
      try {
        const adultUsers = await User.find({ age: { $gt: 20 } });
        console.log('Adult users:', adultUsers);
      } catch (error) {
        console.error('Error fetching adult users:', error);
      }
    }

    getAdultUsers();
    ```

2.  **Finding a single document using `findOne()`:**

    The `findOne()` method retrieves at most one document that matches the provided query. If multiple documents match the query, it will return the first one found. It also returns a Query object.

    ```javascript
    async function findUserByUsername(username) {
      try {
        const user = await User.findOne({ username: username });
        console.log(`User with username '${username}':`, user);
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    }

    findUserByUsername('john.doe');
    ```

3.  **Finding a document by its `_id` using `findById()`:**

    Since every MongoDB document has a unique `_id` field, Mongoose provides the `findById()` method as a convenient way to retrieve a document by its ID. The `_id` is typically an `ObjectId`.

    ```javascript
    async function findUserById(id) {
      try {
        const user = await User.findById(id);
        console.log(`User with ID '${id}':`, user);
      } catch (error) {
        console.error('Error fetching user by ID:', error);
      }
    }

    // Assuming you have a user ID, for example:
    const userIdToFind = 'someObjectIdString';
    findUserById(userIdToFind);
    ```

**Query Selectors:**

Query selectors are special operators that you can use within your query objects to specify more complex conditions.

* **Comparison Operators:**
    * `$eq`: Matches values that are equal to a specified value. Example: `{ age: { $eq: 30 } }` (age is 30)
    * `$ne`: Matches all values that are not equal to a specified value. Example: `{ username: { $ne: 'admin' } }` (username is not 'admin')
    * `$gt`: Matches values that are greater than a specified value. Example: `{ age: { $gt: 25 } }` (age is greater than 25)
    * `$gte`: Matches values that are greater than or equal to a specified value. Example: `{ age: { $gte: 18 } }` (age is 18 or greater)
    * `$lt`: Matches values that are less than a specified value. Example: `{ age: { $lt: 10 } }` (age is less than 10)
    * `$lte`: Matches values that are less than or equal to a specified value. Example: `{ age: { $lte: 65 } }` (age is 65 or less)
    * `$in`: Matches any of the values specified in an array. Example: `{ age: { $in: [20, 30, 40] } }` (age is 20, 30, or 40)
    * `$nin`: Matches none of the values specified in an array. Example: `{ username: { $nin: ['root', 'guest'] } }` (username is neither 'root' nor 'guest')

* **Logical Operators:**
    * `$and`: Joins query clauses with a logical AND returns all documents that match the conditions of both clauses. Example: `{ $and: [{ age: { $gt: 20 } }, { username: { $ne: 'admin' } }] }` (age is greater than 20 AND username is not 'admin')
    * `$or`: Joins query clauses with a logical OR returns all documents that match the conditions of either clause. Example: `{ $or: [{ age: { $lt: 18 } }, { age: { $gt: 60 } }] }` (age is less than 18 OR age is greater than 60)
    * `$not`: Inverts the effect of a query expression and returns documents that do *not* match the query expression. Example: `{ age: { $not: { $eq: 30 } } }` (age is not 30)
    * `$nor`: Joins query clauses with a logical NOR returns all documents that fail to match both clauses. Example: `{ $nor: [{ age: { $lt: 18 } }, { username: 'admin' }] }` (age is not less than 18 AND username is not 'admin')

* **Element Operators:**
    * `$exists`: Matches documents that have the specified field. Example: `{ age: { $exists: true } }` (documents that have the 'age' field) or `{ age: { $exists: false } }` (documents that do not have the 'age' field)
    * `$type`: Selects documents where the value of a field is of a specified BSON type. Example: `{ age: { $type: 'number' } }` (documents where the 'age' field is a number). You can use type numbers (e.g., 16 for int) or aliases (e.g., 'string', 'object').

* **Evaluation Operators:**
    * `$expr`: Allows the use of aggregation expressions within the query language. This is more advanced and allows for complex comparisons within a document.
    * `$jsonSchema`: Allows you to validate documents against a given JSON schema.
    * `$mod`: Performs a modulo operation on the value of a field and selects documents with a specified result. Example: `{ age: { $mod: [10, 0] } }` (documents where the 'age' is divisible by 10).
    * `$regex`: Provides regular expression capabilities for pattern matching strings. Example: `{ username: { $regex: 'doe', $options: 'i' } }` (usernames that contain 'doe', case-insensitive).
    * `$text`: Performs text search on fields indexed with a text index.
    * `$where`: Allows you to use JavaScript functions within your query to define custom matching conditions. Use this sparingly due to potential performance and security implications.

* **Array Operators:**
    * `$all`: Matches documents where the value of a field is an array that contains all the specified elements. Example: `{ tags: { $all: ['mongodb', 'node'] } }` (documents where the 'tags' array contains both 'mongodb' and 'node').
    * `$elemMatch`: Matches documents that contain an array field with at least one element that matches all the specified query criteria. Example: `{ grades: { $elemMatch: { $gte: 80, $lt: 90 } } }` (documents where the 'grades' array has at least one grade between 80 and 89).
    * `$size`: Matches documents where the value of an array field has a specific number of elements. Example: `{ tags: { $size: 3 } }` (documents where the 'tags' array has exactly 3 elements).

* **Geospatial Operators:** These operators are used for querying based on location data.
    * `$geoWithin`: Selects geometries within a specified shape.
    * `$geoIntersects`: Selects geometries that intersect with a specified geometry.
    * `$near`: Returns geospatial objects in proximity to a point.
    * `$nearSphere`: Returns geospatial objects in proximity to a point on a spherical surface.

**Query Options:**

Query options allow you to further refine your queries. You chain these options after your initial `find()`, `findOne()`, etc., methods.

* **`sort()`:** Specifies the order in which the matching documents should be returned. You pass an object where the keys are the field names and the values are either `1` (for ascending order) or `-1` (for descending order).
    ```javascript
    // Find all users and sort them by age in descending order
    const usersSortedByAgeDesc = await User.find().sort({ age: -1 });

    // Find all users and sort them by username in ascending order
    const usersSortedByUsernameAsc = await User.find().sort({ username: 1 });

    // Sort by age descending, then by username ascending
    const usersSortedByAgeDescThenUsernameAsc = await User.find().sort({ age: -1, username: 1 });
    ```

* **`limit()`:** Limits the number of documents returned by the query. You pass an integer representing the maximum number of documents to return.
    ```javascript
    // Find the first 10 users
    const firstTenUsers = await User.find().limit(10);
    ```

* **`skip()`:** Skips a specified number of documents before returning the results. This is often used for pagination.
    ```javascript
    // Skip the first 5 users and return the rest
    const usersAfterFirstFive = await User.find().skip(5);

    // For pagination (e.g., get the second page with a page size of 10)
    const pageNumber = 2;
    const pageSize = 10;
    const usersOnSecondPage = await User.find().skip((pageNumber - 1) * pageSize).limit(pageSize);
    ```

* **`select()`:** Specifies which fields to include or exclude in the returned documents. You can pass a string of space-separated field names to include (e.g., `'username email'`) or exclude (e.g., `'-_id -age'` to exclude `_id` and `age`). You can also use an object with field names as keys and `1` for include or `0` for exclude.
    ```javascript
    // Include only the username and email fields
    const usersWithUsernameAndEmail = await User.find().select('username email');

    // Exclude the age field
    const usersWithoutAge = await User.find().select('-age');

    // Include username and exclude email using object syntax
    const usersWithUsernameOnly = await User.find().select({ username: 1, email: 0 });
    ```

* **`where()`:** Provides a more fluent interface for building complex queries. You can chain multiple `where()` calls or use it with comparison operators.
    ```javascript
    // Find users where age is greater than 25
    const usersWhereAgeGt25 = await User.find().where('age').gt(25);

    // Find users where age is less than or equal to 30 and username starts with 'j'
    const usersComplexWhere = await User.find().where('age').lte(30).where('username').startsWith('j');

    // Using where with a query object
    const anotherWayToQueryAgeGt20 = await User.find().where({ age: { $gt: 20 } });
    ```

By mastering these methods, query selectors, and query options, you'll be well-equipped to create, read, and manipulate data effectively in your MongoDB database using Mongoose within your Express.js applications. Remember to practice using these concepts with different scenarios to solidify your understanding.