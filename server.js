const express = require('express');
const mysql = require('mysql');
const colors = require('colors');
const rateLimit = require('express-rate-limit');
const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Rate limiting setup: limit requests to 50 per second per IP address
const limiter = rateLimit({
  windowMs: 1000, // 1 second
  max: 50, // limit each IP to 50 requests per windowMs
  message: 'Rate limit exceeded. Please try again after 3 seconds.'
});
app.use(limiter);

// MySQL database connection
const db = mysql.createConnection({
  host: "YOUR HOST",
  port: "YOUR PORT",
  user: "YOUR USERNAME",
  password: "YOUR PASSWORD",
  database: "YOUR DATABASE"
});

db.connect(err => {
  if (err) {
    console.error('Error connecting to the database:'.red, err);
    return;
  }
  console.log('Connected to the MySQL database'.green);
});

// Middleware function to validate SQL query structure
function validateSqlQuery(sqlQuery) {
  if (!sqlQuery || !sqlQuery.query || typeof sqlQuery.query !== 'string') {
    throw new Error('Invalid SQL query structure.');
  }
}

// Middleware function to check if table exists
function checkIfTableExists(tableName, callback) {
  const query = `SHOW TABLES LIKE '${tableName}'`;
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error checking table existence:', err);
      callback(err, false);
    } else {
      callback(null, results.length > 0);
    }
  });
}

// Handle SQL queries
app.post('/query', (req, res) => {
  const { key, sqlQuery } = req.body;

  // Log the key and SQL query
  console.log('Received request with key:'.blue, key);
  console.log('SQL Query:'.blue, JSON.stringify(sqlQuery, null, 2));

  // Check if key exists and is alphanumeric
  if (!key) {
    const errorMsg = 'Missing key.'.red;
    console.error(errorMsg);
    return res.status(400).json({ error: errorMsg });
  }
  
  if (!/^[a-zA-Z0-9]+$/.test(key)) {
    const errorMsg = 'Invalid key. Key must be alphanumeric.'.red;
    console.error(errorMsg);
    return res.status(400).json({ error: errorMsg });
  }

  try {
    // Validate SQL query structure
    validateSqlQuery(sqlQuery);

    // Check if the query contains restricted keywords
    const restrictedKeywords = ['SHOW TABLES', 'SHOW COLUMNS', 'INFORMATION_SCHEMA'];
    for (const keyword of restrictedKeywords) {
      if (sqlQuery.query.toUpperCase().includes(keyword)) {
        const errorMsg = `${keyword} is not allowed.`.red;
        console.error(errorMsg);
        return res.status(400).json({ error: errorMsg });
      }
    }

    // Define the table name
    let tableName;
    if (sqlQuery.query.includes('{TABLE_NAME}')) {
      tableName = `${key}_${sqlQuery.table}`;
      const formattedQuery = sqlQuery.query.replace('{TABLE_NAME}', tableName);

      // Log the formatted query
      console.log('Formatted SQL Query:'.green, formattedQuery);

      // Check if table exists before allowing CREATE TABLE
      if (sqlQuery.query.startsWith('CREATE')) {
        checkIfTableExists(tableName, (err, tableExists) => {
          if (err) {
            console.error('Error checking table existence:', err);
            return res.status(500).json({ error: 'Error checking table existence.', details: err.message });
          }

          if (tableExists) {
            const errorMsg = `Table '${tableName}' already exists. Cannot execute ${sqlQuery.query.split(' ')[0]} query.`.red;
            console.error(errorMsg);
            return res.status(400).json({ error: errorMsg });
          }

          // Proceed with creating the table
          executeQuery(formattedQuery, res);
        });
      } else {
        // For other queries (INSERT, UPDATE, DELETE), proceed with executing the query
        executeQuery(formattedQuery, res);
      }
    } else {
      const warningMsg = 'Your query does not contain {TABLE_NAME}. This means anyone can edit it!'.yellow;
      console.warn(warningMsg);

      // Proceed with executing the query with the warning
      executeQuery(sqlQuery.query, res);
    }
  } catch (err) {
    console.error('Invalid SQL query:', err.message);
    return res.status(400).json({ error: err.message });
  }
});

// Handle GET request to /ping
app.get('/ping', (req, res) => {
  console.log('Received ping request');
  res.status(200).json({ status: '200' });
});

app.get('/help', (req, res) => {
  console.log('Received help request');
  res.status(200).send('https://github.com/thekingofspace/BloxSQLPublic');
});

app.post('/request', (req, res) => {
  const { key } = req.body;

  if (!key) {
    console.log('No key provided in request');
    return res.status(400).send('No key provided in request');
  }

  console.log(`Received request with key: ${key}`);

  const query = `SHOW TABLES LIKE '%${key}%'`;

  connection.query(query, (error, results) => {
    if (error) {
      console.error('Error executing query:', error);
      return res.status(500).send('Error executing query');
    }

    const tables = results.map(row => Object.values(row)[0]);
    console.log(`Found tables: ${tables.join(', ')}`);
    res.status(200).json({ tables });
  });
});

// Function to execute SQL query
function executeQuery(query, res) {
  // Log the query execution
  console.log('Executing SQL Query:'.green, query);

  // Execute the SQL query
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error executing query:'.red, err);
      return res.status(500).json({ error: 'Error executing query.', details: err.message });
    }
    res.json({ results });
  });
}

app.listen(port, () => {
  console.log(`Server running on port ${port}`.green);
});