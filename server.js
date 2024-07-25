const http = require('http');
const url = require('url');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const client=require('./db');
const hostname = '127.0.0.1';
const port = 3000;
const SECRET_KEY = 'your-secret-key'; // Replace with a strong secret key

const addDefaultUser = async () => {
  try {
    const defaultUser = {
      name: 'Infermier',
      email: 'infermier@example.com',
      password: 'admin' // Use a strong password in a real application
    };

    // Hash the default user's password
    const hashedPassword = await bcrypt.hash(defaultUser.password, 10);

    const query = 'INSERT INTO employee (name, email, password) VALUES ($1, $2, $3) RETURNING id';
    const values = [defaultUser.name, defaultUser.email, hashedPassword];
    const result = await client.query(query, values);

    console.log(`Default user added with ID: ${result.rows[0].id}`);
  } catch (error) {
    console.error('Error adding default user:', error.message);
  }
};

const authenticateUser = (req, res) => {
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });
  req.on('end', async () => {
    try {
      const { email, password } = JSON.parse(body);

      // Query the database to find the user by email
      const query = 'SELECT * FROM employee WHERE email = $1';
      const values = [email];
      const result = await client.query(query, values);

      // Check if the user exists
      if (result.rows.length === 0) {
        res.statusCode = 401;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'User not found' }));
        return;
      }

      const user = result.rows[0];

      // Check if the password matches
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        res.statusCode = 401;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Incorrect password' }));
        return;
      }

      // Generate and return the token
      const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, SECRET_KEY, { expiresIn: '1h' });

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ token, name: user.name }));
    } catch (error) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Error processing request', details: error.message }));
    }
  });
};


const addEmployee = (req, res) => {
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });
  req.on('end', async () => {
    try {
      const employee = JSON.parse(body);

      // Hash the password before saving it
      const hashedPassword = await bcrypt.hash(employee.password, 10); // Use 10 salt rounds

      const query = 'INSERT INTO employee (name, email, password) VALUES ($1, $2, $3) RETURNING id';
      const values = [employee.name, employee.email, hashedPassword];
      const result = await client.query(query, values);

      res.statusCode = 201;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ id: result.rows[0].id }));
    } catch (error) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Error processing request', details: error.message }));
    }
  });
};

const verifyToken = (req, res, callback) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;


  if (!token) {
    res.statusCode = 401;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ error: 'No token provided' }));
  }

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      res.statusCode = 403;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ error: 'Invalid token' }));
    }
    req.user = user;
    callback(); // Call the original route handler
  });
};

const getEmployees = (req, res) => {
  client.query('SELECT * FROM employee ORDER BY id', (err, result) => {
    if (err) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: err.message }));
    } else {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(result.rows));
    }
  });
};

const updateEmployee = (req, res, id) => {
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });
  req.on('end', async () => {
    try {
      const employee = JSON.parse(body);

      // Hash the new password before updating it
      const hashedPassword = await bcrypt.hash(employee.password, 10); // Use 10 salt rounds

      const query = 'UPDATE employee SET name = $1, email = $2, password = $3 WHERE id = $4';
      const values = [employee.name, employee.email, hashedPassword, id];
      await client.query(query, values);

      res.statusCode = 204;
      res.end();
    } catch (error) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Error processing request', details: error.message }));
    }
  });
};

const deleteEmployee = (req, res, id) => {
  const query = 'DELETE FROM employee WHERE id = $1';
  const values = [id];
  client.query(query, values, (err, result) => {
    if (err) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: err.message }));
    } else {
      res.statusCode = 204;
      res.end();
    }
  });
};

const getEmployeeById = (req, res, id) => {
  const query = 'SELECT * FROM employee WHERE id = $1';
  const values = [id];
  client.query(query, values, (err, result) => {
    if (err) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: err.message }));
    } else {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(result.rows[0]));
    }
  });
};

const server = http.createServer((req, res) => {
  const reqUrl = url.parse(req.url, true);
  const method = req.method.toUpperCase();
  const pathname = reqUrl.pathname;

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, content-type, authorization');

  // Handle preflight request
  if (method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (pathname === '/api/authenticate' && method === 'POST') {
    authenticateUser(req, res);
  } else if (pathname === '/api/employees' && method === 'GET') {
    verifyToken(req, res, () => getEmployees(req, res));
  } else if (pathname === '/api/employees' && method === 'POST') {
    verifyToken(req, res, () => addEmployee(req, res));
  } else if (pathname.startsWith('/api/employees/') && method === 'PUT') {
    const id = pathname.split('/')[3];
    verifyToken(req, res, () => updateEmployee(req, res, id));
  } else if (pathname.startsWith('/api/employees/') && method === 'DELETE') {
    const id = pathname.split('/')[3];
    verifyToken(req, res, () => deleteEmployee(req, res, id));
  } else if (pathname.startsWith('/api/employees/') && method === 'GET') {
    const id = pathname.split('/')[3];
    verifyToken(req, res, () => getEmployeeById(req, res, id));
  } else {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Not Found');
  }
});


server.listen(port, hostname, async () => {
  console.log(`Server running at http://${hostname}:${port}/`);
  await addDefaultUser();
});
