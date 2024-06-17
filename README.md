---

# Node.js Express MySQL API Server

This server provides a RESTful API interface for executing SQL queries on a MySQL database. It includes rate limiting to protect against abuse and supports dynamic table creation based on the provided SQL queries.

## Setup

1. **Install Dependencies**
   Ensure you have Node.js installed. Then, install required npm packages found in the package.

2. **Configure Database**
   Edit `app.js` and set your MySQL database connection details:

   ```javascript
   const db = mysql.createConnection({
     host: "YOUR HOST",
     port: "YOUR PORT",
     user: "YOUR USERNAME",
     password: "YOUR PASSWORD",
     database: "YOUR DATABASE"
   });
   ```

3. **Start the Server**
   Start the server with:

   ```bash
   node app.js
   ```

   Server will run on port 3000 by default. You can change `port` variable in `app.js` if needed.

## API Endpoints

### `POST /query`

Executes SQL queries on the MySQL database.

#### Request Body

- `key`: Alphanumeric identifier for query validation.
- `sqlQuery`: Object containing the SQL query to execute.

Example:
```json
{
  "key": "your_key",
  "sqlQuery": {
    "query": "SELECT * FROM {TABLE_NAME}",
    "table": "example_table"
  }
}
```

### Rate Limiting

Requests to `/query` endpoint are limited to 50 requests per second per IP address. Exceeding this limit will return a `429 Too Many Requests` response with message "Rate limit exceeded. Please try again after 3 seconds."

## Error Handling

- Missing or invalid request parameters will return a `400 Bad Request`.
- Database errors will return a `500 Internal Server Error` with details.

## Security Considerations

- Ensure database credentials (`host`, `port`, `user`, `password`) are kept secure and not exposed in version control.
- Validate input parameters (`key`, `sqlQuery`) to prevent SQL injection attacks.
- Limit access to the API endpoint (`/query`) based on IP or authentication if required.

---

Certainly! Here's a README documentation focusing on how to interact with the server using Lua scripting, specifically within the context of a game environment (likely Roblox, based on the `game:GetService("HttpService")` usage):

---

# Lua Script for Interacting with Node.js Express MySQL API

This Lua script demonstrates how to interact with a Node.js Express MySQL API server from a game environment. The server is used to execute SQL queries, including dynamic table creation based on the provided payload.

## Requirements

- **Lua Environment**: This script is designed to run within a Lua environment that supports HTTP requests. In this example, it's assumed to be within a game environment using Roblox.
- **HTTPService**: Ensure the environment supports `HttpService` for making HTTP requests.

## Usage

### Setup

1. **Configure Server URL**: Set the `SERVER_URL` variable to your server's endpoint where the API is hosted.

   ```lua
   local SERVER_URL = "YOUR_SERVER_URL_HERE"
   ```

2. **Payload Configuration**: Customize the `payload` table according to your SQL query needs. Ensure `key` is unique for security.

   ```lua
   local payload = {
       key = "AXSDSADS", -- Ensure this key is unique and secure
       sqlQuery = {
           table = "testTable",
           query = "CREATE TABLE IF NOT EXISTS {TABLE_NAME} (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255) NOT NULL)"
           -- Replace {TABLE_NAME} dynamically based on your game context
       }
   }
   ```

### Sending HTTP Request

- **Convert Lua Table to JSON**: Use `HttpService:JSONEncode()` to convert the Lua `payload` table into a JSON string.

   ```lua
   local payloadJson = game:GetService("HttpService"):JSONEncode(payload)
   ```

- **Create HTTP Request Object**: Define the HTTP request parameters including method, headers, and body.

   ```lua
   local request = {
       Url = SERVER_URL,
       Method = "POST",
       Headers = {
           ["Content-Type"] = "application/json"
       },
       Body = payloadJson
   }
   ```

- **Send HTTP Request Asynchronously**: Use `HttpService:RequestAsync()` to send the HTTP request to the server.

   ```lua
   local success, response = pcall(function()
       return game:GetService("HttpService"):RequestAsync(request)
   end)
   ```

### Handling Responses

- **Handle Success**: Log and process the server's response if the request is successful.

   ```lua
   if success then
       print("Raw response:", response.Body)
       local decodedResponse = game:GetService("HttpService"):JSONDecode(response.Body)
       if decodedResponse then
           if decodedResponse.error then
               print("Error:", decodedResponse.error)
           else
               print("Table created successfully:", decodedResponse)
           end
       else
           print("Error decoding JSON:", response.Body)
       end
   else
       print("Error sending request:", response)
       return
   end
   ```

- **Handle Errors**: In case of errors during the HTTP request or JSON decoding, appropriate error messages are logged for debugging.

## Security Considerations

- **Unique Key**: Ensure `key` in the `payload` is unique and not exposed to avoid unauthorized access.
- **Error Handling**: Validate and handle errors both during the request (HTTP errors) and response (JSON parsing errors) to ensure robustness.
- **Secure Transmission**: Consider using HTTPS if transmitting sensitive data to protect against eavesdropping.

---

How to use SQL

a basic explanation on how to work sql

SQL (Structured Query Language) is a tool for working with databases. You use it to send commands called queries for tasks like getting, adding, updating, or deleting data. Here are the main types of queries:


- **SELECT**: Retrieves data from a database.
  ```sql
  SELECT column1, column2 FROM table_name;
  ```
  ```sql
  SELECT column1, column2 FROM table_name WHERE condition;
  ```
- **INSERT INTO**

The `INSERT INTO` statement is used to add new records (rows) into a table in a database. It allows you to specify the table name, the columns into which data will be inserted, and the values to be inserted into those columns.

 Syntax:

```sql
INSERT INTO table_name (column1, column2, ...)
VALUES (value1, value2, ...);
```

- **table_name**: Name of the table where you want to insert data.
- **column1, column2, ...**: Names of the columns into which data will be inserted. It's optional to specify columns if you're inserting values for all columns in order.
- **VALUES (value1, value2, ...)**: Values to be inserted into the corresponding columns. Each value corresponds to the column in the same position in the column list.

 Example:

Let's say you have a table `students` with columns `id`, `name`, and `age`. To insert a new student into this table:

```sql
INSERT INTO students (name, age)
VALUES ('John Doe', 25);
```

This query inserts a new record with the name 'John Doe' and age 25 into the `students` table. If the `id` column is auto-incremented or has a default value set, it will automatically generate the next id value.

 Inserting Values into All Columns:

If you want to insert values into all columns of a table in the order they were defined:

```sql
INSERT INTO students VALUES (1, 'Jane Smith', 22);
```

This assumes the table `students` has columns in the order `id`, `name`, and `age`. Here, `1` would go into `id`, `'Jane Smith'` into `name`, and `22` into `age`.

- **UPDATE**: Modifies existing data in a database.
  ```sql
  UPDATE table_name SET column1 = new_value;
  ```
  ```sql
  UPDATE table_name SET column1 = new_value WHERE condition;
  ```

- **DELETE**: Removes data from a database.
  ```sql
  DELETE FROM table_name WHERE condition;
  ```
  ```sql
  DELETE FROM table_name;
  ```

When creating a table, use `CREATE TABLE` followed by column definitions:
```sql
CREATE TABLE table_name (
    column1 datatype,
    column2 datatype,
    column3 INT,
    column4 VARCHAR(255),
    column5 TEXT,
    column6 DATE,
    column7 TIMESTAMP,
    column8 BOOLEAN,
    column9 FLOAT,
    column10 DECIMAL(10, 2),
    column11 CHAR(10),
    column12 BLOB,
    -- you will most likely add "NOT NULL" to the end of each
);
```

When deleting a table, use `DROP TABLE`:
```sql
DROP TABLE table_name;
```

To check if a column exists and add it if it does not:

```sql
IF NOT EXISTS (
    SELECT *
    FROM information_schema.columns
    WHERE table_schema = 'your_database_name'
    AND table_name = 'your_table_name'
    AND column_name = 'your_column_name'
)
BEGIN
    ALTER TABLE your_database_name.your_table_name
    ADD your_column_name datatype;
END
```

Example:
```sql
IF NOT EXISTS (
    SELECT *
    FROM INFORMATION_SCHEMA.TABLES
    WHERE TABLE_NAME = 'MemberData'
)
BEGIN
    -- Your SQL code here
END
```

To filter data when querying, use `WHERE`:
```sql
SELECT column1, column2
FROM table_name
WHERE condition;
```

For example, to get employees older than 30:
```sql
SELECT name, age
FROM employees
WHERE age > 30;
```

SQL also supports various operators like `=`, `>`, `<`, `AND`, `OR`, `LIKE`, `IN`, `BETWEEN`, and handling `NULL` values. These help refine queries to specific criteria.

When fetching all data from a table (`SELECT * FROM table_name;`), you receive a result set which can be processed programmatically to handle each row and column individually in your application.
