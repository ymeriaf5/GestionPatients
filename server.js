const http = require('http');
const url = require('url');
const client = require('./db');

const hostname = '127.0.0.1';
const port = 3000;

const server = http.createServer((req, res) => {
  const reqUrl = url.parse(req.url, true);
  const method = req.method.toUpperCase();
  const pathname = reqUrl.pathname;

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, content-type');

  // Handle preflight request
  if (method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (pathname === '/api/employees' && method === 'GET') {
    getEmployees(req, res);
  } else if (pathname === '/api/employees' && method === 'POST') {
    addEmployee(req, res);
  } else if (pathname.startsWith('/api/employees/') && method === 'PUT') {
    const id = pathname.split('/')[3];
    updateEmployee(req, res, id);
  } else if (pathname.startsWith('/api/employees/') && method === 'DELETE') {
    const id = pathname.split('/')[3];
    deleteEmployee(req, res, id);
  } else if (pathname.startsWith('/api/employees/') && method === 'GET') {
    const id = pathname.split('/')[3];
    getEmployeeById(req, res, id);
  } else {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Not Found');
  }
});

const getEmployees = (req, res) => {
  client.query('SELECT * FROM employee order by id', (err, result) => {
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

const addEmployee = (req, res) => {
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });
  req.on('end', () => {
    const employee = JSON.parse(body);
    const query = 'INSERT INTO employee (name, email, password) VALUES ($1, $2, $3) RETURNING id';
    const values = [employee.name, employee.email, employee.password];
    client.query(query, values, (err, result) => {
      if (err) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: err.message }));
      } else {
        res.statusCode = 201;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ id: result.rows[0].id }));
      }
    });
  });
};

const updateEmployee = (req, res, id) => {
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });
  req.on('end', () => {
    const employee = JSON.parse(body);
    const query = 'UPDATE employee SET name = $1, email = $2, password = $3 WHERE id = $4';
    const values = [employee.name, employee.email, employee.password, id];
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

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
