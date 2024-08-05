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

//Patient

const getPatients = async (req, res) => {
  try {
    const query = `
      SELECT
        p.id,
        p.nom,
        p.prenom,
        p.cin,
        p.sexe,
        p.adresse,
        p.telephone,
        p.date_naissance,
        c.type AS couverture_type,
        pr.nom AS provenance_nom,
        a.nom AS antecedent_nom
      FROM
        GestionPatient.patient p
          JOIN GestionPatient.couverture c ON p.couverture_id = c.id
          JOIN GestionPatient.provenance pr ON p.provenance_id = pr.id
          JOIN GestionPatient.antecedent a ON p.antecedent_id = a.id
      ORDER BY
        p.id;

    `;
    const [rows] = await pool.query(query);
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(rows));
  } catch (error) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Error fetching patients', details: error.message }));
  }
};
const addPatient = async (req, res) => {
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });
  req.on('end', async () => {
    try {
      const { antecedent_id, couverture_id, date_naissance, provenance_id, adresse, nom, prenom, cin, sexe, telephone } = JSON.parse(body);

      // Insert patient into the database
      const query = 'INSERT INTO patient (antecedent_id, couverture_id, date_naissance, provenance_id, adresse, nom, prenom, cin, sexe, telephone) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
      const values = [antecedent_id, couverture_id, date_naissance, provenance_id, adresse, nom, prenom, cin, sexe, telephone];
      await pool.query(query, values);

      res.statusCode = 201;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ message: 'Patient added successfully' }));
    } catch (error) {
      console.error('Error Details:', error);
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Error adding patient', details: error.message }));
    }
  });
};

const updatePatient = async (req, res, id) => {
  let body = '';

  req.on('data', chunk => {
    body += chunk.toString();
  });

  req.on('end', async () => {
    try {
      const { antecedent_id, couverture_id, date_naissance, provenance_id, adresse, nom, prenom, cin, sexe, telephone } = JSON.parse(body);
      const query = `
        UPDATE patient
        SET antecedent_id = ?, couverture_id = ?, date_naissance = ?, provenance_id = ?, adresse = ?, nom = ?, prenom = ?, cin = ?, sexe = ?, telephone = ?
        WHERE id = ?
      `;
      const values = [antecedent_id, couverture_id, date_naissance, provenance_id, adresse, nom, prenom, cin, sexe, telephone, id];
      await pool.query(query, values);

      res.statusCode = 201;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ message: 'Patient added successfully' }));
    } catch (error) {
      console.error('Error Details:', error);
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Error adding patient', details: error.message }));
    }
  });
};


const deletePatient = async (req, res, id) => {
  try {
    const query = 'DELETE FROM patient WHERE id = ?';
    const values = [id];
    await pool.query(query, values);
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ message: 'Patient deleted' }));
  } catch (error) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Error deleting patient', details: error.message }));
  }
};

const getPatientById = async (req, res, id) => {
  try {
    const query = 'SELECT * FROM patient WHERE id = ?';
    const values = [id];
    const [rows] = await pool.query(query, values);

    if (rows.length === 0) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Patient not found' }));
      return;
    }

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(rows[0]));
  } catch (error) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Error fetching patient', details: error.message }));
  }
};
const addDefaultPatient = async (antecedent_id, couverture_id, date_naissance, provenance_id, adresse, nom, prenom, cin, sexe, telephone) => {
  try {
    // Check if the patient already exists by CIN (or any other unique identifier)
    const query = 'SELECT * FROM patient WHERE cin = ?';
    const [rows] = await pool.query(query, [cin]);

    if (rows.length === 0) {
      // Insert the default patient if they do not already exist
      const insertQuery = 'INSERT INTO patient (antecedent_id, couverture_id, date_naissance, provenance_id, adresse, nom, prenom, cin, sexe, telephone) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
      const values = [antecedent_id, couverture_id, date_naissance, provenance_id, adresse, nom, prenom, cin, sexe, telephone];
      await pool.query(insertQuery, values);
      console.log('Default patient added');
    } else {
      console.log('Default patient already exists');
    }
  } catch (error) {
    console.error('Error adding default patient:', error.message);
  }
};
const getAntecedents = async (req, res) => {
  try {
    const query = 'SELECT * FROM antecedent';
    const [rows] = await pool.query(query);
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(rows));
  } catch (error) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Error fetching antecedents', details: error.message }));
  }
};

const getCouvertures = async (req, res) => {
  try {
    const query = 'SELECT * FROM couverture';
    const [rows] = await pool.query(query);
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(rows));
  } catch (error) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Error fetching couvertures', details: error.message }));
  }
};

const getProvenances = async (req, res) => {
  try {
    const query = 'SELECT * FROM provenance';
    const [rows] = await pool.query(query);
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(rows));
  } catch (error) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Error fetching provenances', details: error.message }));
  }
};
const addConsultation = async (req, res) => {
  let body = '';

  req.on('data', chunk => {
    body += chunk.toString();
  });
  console.log("hi");

  req.on('end', async () => {
    try {
      const {
        dateConsultation,
        prestataire,
        motifConsultation,
        signesFonctionnels,
        signesPhysiques,
        diagnostics,
        examensParacliniques,
        resultatsExamens,
        traitementsPrescrits,
        posologie,
        recommandations,
        referenceInfo,
        prochainRendezVous,
        remarquesSuivi,
        patientId // Assume patientId is used to associate with the Patient table
      } = JSON.parse(body);

      // Convert date values to the correct format for MySQL
      const formattedDateConsultation = new Date(dateConsultation).toISOString().slice(0, 19).replace('T', ' ');
      const formattedProchainRendezVous = new Date(prochainRendezVous).toISOString().slice(0, 19).replace('T', ' ');

      // Insert consultation into the database
      const query = `
        INSERT INTO consultation (
          date_Consultation,
          prestataire,
          motif_Consultation,
          signes_Fonctionnels,
          signes_Physiques,
          diagnostics,
          examens_Paracliniques,
          resultats_Examens,
          traitements_Prescrits,
          posologie,
          recommandations,
          reference_Info,
          prochain_Rendez_Vous,
          remarques_Suivi,
          patient_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const values = [
        formattedDateConsultation, prestataire, motifConsultation, signesFonctionnels,
        signesPhysiques, diagnostics, examensParacliniques, resultatsExamens,
        traitementsPrescrits, posologie, recommandations, referenceInfo,
        formattedProchainRendezVous, remarquesSuivi, patientId
      ];
      await pool.query(query, values);

      res.statusCode = 201;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ message: 'Consultation added successfully' }));
    } catch (error) {
      console.error('Error Details:', error);
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Error adding consultation', details: error.message }));
    }
  });
};
const getConsultationsById = async (req, res, id) => {
  try {
    const query = 'SELECT * FROM consultation where patient_id= ?';
    const values = [id];
    const [rows] = await pool.query(query, values);
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(rows));
  } catch (error) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Error fetching Consultation', details: error.message }));
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
  }else if (pathname === '/api/patients' && method === 'GET') {
    verifyToken(req, res, () => getPatients(req, res));
  } else if (pathname === '/api/patients' && method === 'POST') {
    verifyToken(req, res, () => addPatient(req, res));
  } else if (pathname.startsWith('/api/patients/') && method === 'PUT') {
    const id = pathname.split('/')[3];
    verifyToken(req, res, () => updatePatient(req, res, id));
  } else if (pathname.startsWith('/api/patients/') && method === 'DELETE') {
    const id = pathname.split('/')[3];
    verifyToken(req, res, () => deletePatient(req, res, id));
  } else if (pathname.startsWith('/api/patients/') && method === 'GET') {
    const id = pathname.split('/')[3];
    verifyToken(req, res, () => getPatientById(req, res, id));
  }else if (pathname === '/api/antecedents' && method === 'GET') {
    verifyToken(req, res, () => getAntecedents(req, res));
  } else if (pathname === '/api/couvertures' && method === 'GET') {
    verifyToken(req, res, () => getCouvertures(req, res));
  } else if (pathname === '/api/provenances' && method === 'GET') {
    verifyToken(req, res, () => getProvenances(req, res));
  }else if (pathname === '/api/consultations' && method === 'POST') {
    verifyToken(req, res, () => addConsultation(req, res));
  } else if (pathname.startsWith('/api/consultations/') && method === 'PUT') {
    const id = pathname.split('/')[3];
    verifyToken(req, res, () => updateConsultation(req, res, id));
  }else if (pathname.startsWith('/api/consultations/') && method === 'GET') {
    const id = pathname.split('/')[3];
    verifyToken(req, res, () => getConsultationsById(req, res, id));
  } else {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Not Found');
  }
});

server.listen(port, hostname, async () => {
  console.log(`Server running at http://${hostname}:${port}/`);
  //await addDefaultUser('Youness Meriaf', 'youness.meriaf@uit.ac.ma', 'admin');
  //await addDefaultPatient(1, 1, '2000-01-01', 1, '123 Main St', 'Doe', 'John', 'CD6100', 'M', '555-1234');
});
