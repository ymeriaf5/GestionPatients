const http = require('http');
const url = require('url');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const pool = require('./db');
const nodemailer = require('nodemailer');
const speakeasy = require('speakeasy');

const hostname = '127.0.0.1';
const port = 3000;
const SECRET_KEY = '843567893696976453275974432697R634976R738467TR678T34865R6834R8763T478378637664538745673865783678548735687R3'; // Replace with a strong secret key
const OTP_SECRET = speakeasy.generateSecret().base32; // Generate a strong secret key for OTP

// Configure nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'younessmeriaf3@gmail.com',
    pass: 'zkgjlvufnoltnmlr'
  }
});

// Send OTP to user's email
const sendOtpEmail = (email, otp) => {
  const mailOptions = {
    from: 'younessmeriaf3@gmail.com',
    to: email,
    subject: 'Your OTP Code',
    text: `Your OTP code is ${otp}`
  };
  return transporter.sendMail(mailOptions);
};

const authenticateUser = async (req, res) => {
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });
  req.on('end', async () => {
    try {
      const { email, password } = JSON.parse(body);
      const query = 'SELECT * FROM employee WHERE email = ?';
      const [rows] = await pool.query(query, [email]);

      if (rows.length === 0) {
        res.statusCode = 401;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'User not found' }));
        return;
      }

      const user = rows[0];
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        res.statusCode = 401;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Incorrect password' }));
        return;
      }

      const otp = speakeasy.totp({ secret: OTP_SECRET, encoding: 'base32' });
      await sendOtpEmail(email, otp);

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ email, otpSent: true }));
    } catch (error) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Error processing request', details: error.message }));
    }
  });
};

const verifyOtp = async (req, res) => {
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });
  req.on('end', async () => {
    try {
      const { email, otp } = JSON.parse(body);
      const isValid = speakeasy.totp.verify({ secret: OTP_SECRET, encoding: 'base32', token: otp, window: 1 });

      if (!isValid) {
        res.statusCode = 401;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Invalid OTP' }));
        return;
      }

      const query = 'SELECT * FROM employee WHERE email = ?';
      const [rows] = await pool.query(query, [email]);

      if (rows.length === 0) {
        res.statusCode = 401;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'User not found' }));
        return;
      }

      const user = rows[0];
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

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.statusCode = 401;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Token missing' }));
    return;
  }

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      res.statusCode = 403;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Invalid token' }));
      return;
    }

    req.user = user;
    next();
  });
};

const getEmployees = async (req, res) => {
  try {
    const query = 'SELECT * FROM employee';
    const [rows] = await pool.query(query);
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(rows));
  } catch (error) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Error fetching employees', details: error.message }));
  }
};

const addEmployee = async (req, res) => {
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });
  req.on('end', async () => {
    try {
      const { name, email, password } = JSON.parse(body);
      const hashedPassword = await bcrypt.hash(password, 10);
      const query = 'INSERT INTO employee (name, email, password) VALUES (?, ?, ?)';
      const values = [name, email, hashedPassword];
      await pool.query(query, values);
      res.statusCode = 201;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ message: 'Employee added' }));
    } catch (error) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Error adding employee', details: error.message }));
    }
  });
};

const updateEmployee = async (req, res, id) => {
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });
  req.on('end', async () => {
    try {
      const { name, email, password } = JSON.parse(body);
      const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;
      const query = 'UPDATE employee SET name = ?, email = ?, password = ? WHERE id = ?';
      const values = [name, email, hashedPassword, id];
      await pool.query(query, values);
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ message: 'Employee updated' }));
    } catch (error) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Error updating employee', details: error.message }));
    }
  });
};

const deleteEmployee = async (req, res, id) => {
  try {
    const query = 'DELETE FROM employee WHERE id = ?';
    const values = [id];
    await pool.query(query, values);
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ message: 'Employee deleted' }));
  } catch (error) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Error deleting employee', details: error.message }));
  }
};

const getEmployeeById = async (req, res, id) => {
  try {
    const query = 'SELECT * FROM employee WHERE id = ?';
    const values = [id];
    const [rows] = await pool.query(query, values);

    if (rows.length === 0) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Employee not found' }));
      return;
    }

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(rows[0]));
  } catch (error) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Error fetching employee', details: error.message }));
  }
};

const addDefaultUser = async (name, email, password) => {
  try {
    const query = 'SELECT * FROM employee WHERE email = ?';
    const values = [email];
    const [rows] = await pool.query(query, values);

    if (rows.length === 0) {
      // No default user found, add one
      const hashedPassword = await bcrypt.hash(password, 10);
      const insertQuery = 'INSERT INTO employee (name, email, password) VALUES (?, ?, ?)';
      const insertValues = [name, email, hashedPassword];
      await pool.query(insertQuery, insertValues);
      console.log('Default user added');
    } else {
      console.log('Default user already exists');
    }
  } catch (error) {
    console.error('Error adding default user:', error.message);
  }
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
  } else if (pathname === '/api/verify-otp' && method === 'POST') {
    verifyOtp(req, res);
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
  await addDefaultUser('Youness Meriaf', 'youness.meriaf@uit.ac.ma', 'admin');
});
