const express = require('express');
const mysql = require('mysql');
const colors = require('colors');
const rateLimit = require('express-rate-limit');
const app = express();
const port = 3000;

app.use(express.json());

const limiter = rateLimit({
  windowMs: 1000,
  max: 50,
  message: 'Rate limit exceeded. Please try again after 3 seconds.'
});
app.use(limiter);

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

function validateSqlQuery(sqlQuery) {
  if (!sqlQuery || !sqlQuery.query || typeof sqlQuery.query !== 'string') {
    throw new Error('Invalid SQL query structure.');
  }
}

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

app.post('/query', (req, res) => {
  const { key, sqlQuery } = req.body;

  console.log('Received request with key:'.blue, key);
  console.log('SQL Query:'.blue, JSON.stringify(sqlQuery, null, 2));

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
    validateSqlQuery(sqlQuery);

    const restrictedKeywords = ['SHOW TABLES', 'SHOW COLUMNS', 'INFORMATION_SCHEMA'];
    for (const keyword of restrictedKeywords) {
      if (sqlQuery.query.toUpperCase().includes(keyword)) {
        const errorMsg = `${keyword} is not allowed.`.red;
        console.error(errorMsg);
        return res.status(400).json({ error: errorMsg });
      }
    }

    let tableName;
    if (sqlQuery.query.includes('{TABLE_NAME}')) {
      tableName = `${key}_${sqlQuery.table}`;
      const formattedQuery = sqlQuery.query.replace('{TABLE_NAME}', tableName);

      console.log('Formatted SQL Query:'.green, formattedQuery);

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

          executeQuery(formattedQuery, res);
        });
      } else {
        executeQuery(formattedQuery, res);
      }
    } else {
      const warningMsg = 'Your query does not contain {TABLE_NAME}. This means anyone can edit it!'.yellow;
      console.warn(warningMsg);

      executeQuery(sqlQuery.query, res);
    }
  } catch (err) {
    console.error('Invalid SQL query:', err.message);
    return res.status(400).json({ error: err.message });
  }
});

app.get('/ping', (req, res) => {
  console.log('Received ping request');
  res.status(200).send('200');
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

  db.query(query, (error, results) => {
    if (error) {
      console.error('Error executing query:', error);
      return res.status(500).send('Error executing query');
    }

    const tables = results.map(row => Object.values(row)[0]);
    console.log(`Found tables: ${tables.join(', ')}`);
    res.status(200).json({ tables });
  });
});

function executeQuery(query, res) {
  console.log('Executing SQL Query:'.green, query);

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error executing query:'.red, err);
      return res.status(500).json({ error: 'Error executing query.', details: err.message });
    }

    if (query.trim().toUpperCase().startsWith('SELECT')) {
      console.log('Query results:', results);
      res.json({ data: results });
    } else {
      res.json({ message: 'Query executed successfully.' });
    }
  });
}

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`.green);
});
