const mysql = require('mysql2/promise');

// Create a connection pool
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  database: 'GestionPatient',
  password: 'admin', // Add your password here if needed
  port: 3306,
});

// Test the connection to ensure it works
pool.getConnection()
  .then(() => console.log('Connected to MySQL'))
  .catch(err => console.error('Connection error', err.stack));

module.exports = pool;
