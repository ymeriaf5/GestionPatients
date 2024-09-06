const http = require('http');
const url = require('url');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
//const poolPromise = require('./db');
const { sql, poolPromise } = require('./db');
const nodemailer = require('nodemailer');
const speakeasy = require('speakeasy');
const pool = require("./db");
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

      // Validate input types
      if (typeof email !== 'string' || typeof password !== 'string') {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Invalid input' }));
        return;
      }

      // Wait for the poolPromise to resolve
      const pool = await poolPromise;

      // Execute the query
      const result = await pool.request()
        .input('email', sql.NVarChar, email) // Ensure this matches your SQL column data type
        .query('SELECT * FROM P_Personelle WHERE Email = @email');

      if (result.recordset.length === 0) {
        res.statusCode = 401;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'User not found' }));
        return;
      }

      const user = result.recordset[0];

      // Directly compare plain text passwords
      if (password !== user.MotDePasse) {
        res.statusCode = 401;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Incorrect password' }));
        return;
      }
      //console.log("Executing query: SELECT * FROM P_Personelle WHERE Email = @Email with Email:", email);
      //console.log("Query result:", result.recordset);

      // Generate OTP
      const otp = speakeasy.totp({ secret: OTP_SECRET, encoding: 'base32' });
      await sendOtpEmail(email, otp);

      // Assuming the user record has the fields id_Personelle, Nom, and Id_Etablissement
      const userId = user.id_Personelle;
      const userName = user.Nom;
      const establishmentId = user.Id_Etablissement;

      console.log(userId,userName,establishmentId);

      // Retrieve the province_id based on Id_Etablissement
      const provinceResult = await pool.request()
        .input('Id_Etablissement', sql.Int, establishmentId)
        .query('SELECT Id_Province FROM P_Etablissement WHERE Id_Etablissement = @Id_Etablissement');

      let provinceId = null;
      if (provinceResult.recordset.length > 0) {
        provinceId = provinceResult.recordset[0].Id_Province;
        console.log(provinceId);
      }

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        email,
        otpSent: true,
        id: userId,
        username: userName,
        provenance_id: provinceId
      }));
    } catch (error) {
      console.error('Error processing request:', error);
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

      // Verify OTP
      const isValid = speakeasy.totp.verify({
        secret: OTP_SECRET,
        encoding: 'base32',
        token: otp,
        window: 1
      });

      if (!isValid) {
        res.statusCode = 401;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Invalid OTP' }));
        return;
      }

      // Wait for the poolPromise to resolve
      const pool = await poolPromise;

      // Use parameterized query with named parameters
      const result = await pool.request()
        .input('email', sql.VarChar, email)
        .query('SELECT * FROM P_Personelle WHERE Email = @email');

      if (result.recordset.length === 0) {
        res.statusCode = 401;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'User not found' }));
        return;
      }

      const user = result.recordset[0];

      // Generate JWT token
      const token = jwt.sign(
        { id: user.Id_Personelle, email: user.Email, name: user.Nom+' '+user.Prenom },
        SECRET_KEY,
        { expiresIn: '1h' }
      );

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ token, name: user.Nom+' '+user.Prenom }));
    } catch (error) {
      console.error('Error processing request:', error); // Log error details for debugging
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
    const pool = await poolPromise;
    const query = 'SELECT * FROM P_Personelle';
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
      const { id_Personelle,Nom, Email, MotDePasse } = JSON.parse(body);

      // Wait for the poolPromise to resolve
      const pool = await poolPromise;

      // Use request.query to execute the update statement
      const result = await pool.request()
        .input('Nom', sql.NVarChar, Nom)
        .input('Email', sql.NVarChar, Email)
        .input('MotDePasse', sql.NVarChar, MotDePasse)
        .input('id', sql.Int, id_Personelle)
        .query(`
          UPDATE P_Personelle
          SET
            Nom = @Nom,
            Email = @Email,
            MotDePasse = CASE WHEN @MotDePasse IS NOT NULL THEN @MotDePasse ELSE MotDePasse END
          WHERE id_Personelle = @id
        `);

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ message: 'Employee updated' }));
    } catch (error) {
      console.error('Error Details:', error);
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
    // Wait for the poolPromise to resolve
    const pool = await poolPromise;

    // Use request.query to fetch the employee data
    const result = await pool.request()
      .input('id', sql.Int, id)  // Parameterized query to avoid SQL injection
      .query('SELECT * FROM P_Personelle WHERE id_Personelle = @id');

    const rows = result.recordset;

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
    console.error('Error Details:', error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Error fetching employee', details: error.message }));
  }
};


const addDefaultUser = async (name, email, password) => {
  try {
    const query = 'SELECT * FROM employee WHERE email = ?';
    const values = [email];
    const [rows] = await poolPromise.query(query, values);

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
    // Wait for the poolPromise to resolve
    const pool = await poolPromise;

    // Define the query
    const query = `
      SELECT p.Id_Patient,
             p.Nom,
             p.Prenom,
             p.CNIE,
             p.Sexe,
             p.adresse,
             p.Telephone,
             p.DateNaissance,
             c.nom AS couverture_type,
             pr.nom AS provenance_nom,
             STRING_AGG(a.nom, ', ') AS antecedent_nom,  -- Aggregates antecedents into a comma-separated string
             n.nom AS NiveauScolaire_nom,
             e.Nom_Etablissement AS Etablissement_nom
      FROM GestionPatient.dbo.T_Patient p
      JOIN GestionPatient.dbo.P_Couverture c ON p.Id_Couverture = c.Id_Couverture
      JOIN GestionPatient.dbo.P_Provenance pr ON p.Id_Provenance = pr.Id_Provenance
      LEFT JOIN GestionPatient.dbo.Patient_Antecedents ap ON p.Id_Patient = ap.Id_Patient
      LEFT JOIN GestionPatient.dbo.P_Antecedent a ON ap.Id_Antecedent = a.Id_Antecedent
      JOIN GestionPatient.dbo.P_NiveauScolarite n ON p.Id_NiveauScolarite = n.Id_NiveauScolarite
      JOIN GestionPatient.dbo.P_Etablissement e ON p.Id_Etablissement = e.Id_Etablissement
      GROUP BY p.Id_Patient, p.Nom, p.Prenom, p.CNIE, p.Sexe, p.adresse,
               p.Telephone, p.DateNaissance, c.nom, pr.nom, n.nom, e.Nom_Etablissement
      ORDER BY p.Id_Patient;
    `;

    // Execute the query
    const result = await pool.request().query(query);

    // Respond with the fetched rows
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(result.recordset));
  } catch (error) {
    // Handle any errors
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Error fetching patients', details: error.message }));
  }
};


const addPatient = async (req, res) => {
  try {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', async () => {
      try {
        const {
          Id_Antecedent, Id_Couverture, DateNaissance, Id_Provenance,
          adresse, Nom, Prenom, CNIE, Sexe, Telephone,
          Id_NiveauScolarite, Id_Etablissement
        } = JSON.parse(body);

        // Wait for the poolPromise to resolve
        const pool = await poolPromise;

        // Insert into T_Patient and get the inserted Id_Patient
        const insertPatientQuery = `
          INSERT INTO T_Patient
          (Id_Couverture, DateNaissance, Id_Provenance, adresse, Nom, Prenom, CNIE, Sexe, Telephone, Id_NiveauScolarite, Id_Etablissement)
          OUTPUT INSERTED.Id_Patient
          VALUES
          (@Id_Couverture, @DateNaissance, @Id_Provenance, @adresse, @Nom, @Prenom, @CNIE, @Sexe, @Telephone, @Id_NiveauScolarite, @Id_Etablissement)
        `;

        const result = await pool.request()
          .input('Id_Couverture', sql.Int, Id_Couverture)
          .input('DateNaissance', sql.Date, DateNaissance)
          .input('Id_Provenance', sql.Int, Id_Provenance)
          .input('adresse', sql.NVarChar, adresse)
          .input('Nom', sql.NVarChar, Nom)
          .input('Prenom', sql.NVarChar, Prenom)
          .input('CNIE', sql.NVarChar, CNIE)
          .input('Sexe', sql.NVarChar, Sexe)
          .input('Telephone', sql.NVarChar, Telephone)
          .input('Id_NiveauScolarite', sql.Int, Id_NiveauScolarite)
          .input('Id_Etablissement', sql.Int, Id_Etablissement)
          .query(insertPatientQuery);

        const Id_Patient = result.recordset[0].Id_Patient;

        // Check if Id_Antecedent is a string and split it, otherwise use it directly as an array
        const antecedentIds = Array.isArray(Id_Antecedent)
          ? Id_Antecedent
          : Id_Antecedent.split(',').map(id => id.trim());

        for (let antecedentId of antecedentIds) {
          antecedentId = parseInt(antecedentId, 10);  // Ensure it's an integer
          if (!isNaN(antecedentId)) {
            const insertJoinTableQuery = `
              INSERT INTO Patient_Antecedents (Id_Antecedent, Id_Patient)
              VALUES (@Id_Antecedent, @Id_Patient)
            `;

            await pool.request()
              .input('Id_Antecedent', sql.Int, antecedentId)
              .input('Id_Patient', sql.Int, Id_Patient)
              .query(insertJoinTableQuery);
          } else {
            console.error(`Invalid Id_Antecedent: ${antecedentId}`);
          }
        }

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
  } catch (error) {
    console.error('Error Details:', error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Error handling request', details: error.message }));
  }
};





const updatePatient = async (req, res, id) => {
  try {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });

    req.on('end', async () => {
      try {
        console.log(id)
        const {
          Id_Antecedent, // This should be an array of antecedent IDs
          Id_Couverture,
          DateNaissance,
          Id_Provenance,
          Adresse,
          Nom,
          Prenom,
          CNIE,
          Sexe,
          Telephone,
          Id_NiveauScolarite,
          id_Etablissement,
        } = JSON.parse(body);

        // Convert CNIE to uppercase
        const CIN_Uppercase = CNIE.toUpperCase();

        // Wait for the poolPromise to resolve
        const pool = await poolPromise;

        // Begin transaction
        const transaction = pool.transaction();
        await transaction.begin();

        try {
          // Check if the patient ID exists
          const checkPatientQuery = `
            SELECT COUNT(*) AS count FROM T_Patient WHERE Id_Patient = @id
          `;
          const checkResult = await transaction
            .request()
            .input('id', sql.Int, id)
            .query(checkPatientQuery);

          if (checkResult.recordset[0].count === 0) {
            throw new Error(`Patient with Id_Patient = ${id} does not exist.`);
          }

          // Update patient details in the T_Patient table
          const updatePatientQuery = `
            UPDATE T_Patient
            SET
              Nom = @Nom,
              Prenom = @Prenom,
              DateNaissance = @DateNaissance,
              CNIE = @CNIE,
              Sexe = @Sexe,
              Telephone = @Telephone,
              Adresse = @Adresse,
              Id_Couverture = @Id_Couverture,
              Id_Provenance = @Id_Provenance,
              Id_NiveauScolarite = @Id_NiveauScolarite,
              id_Etablissement = @id_Etablissement
            WHERE Id_Patient = @id
          `;

          const updateRequest = transaction.request();
          await updateRequest
            .input('Nom', sql.NVarChar, Nom)
            .input('Prenom', sql.NVarChar, Prenom)
            .input('DateNaissance', sql.Date, DateNaissance)
            .input('CNIE', sql.NVarChar, CIN_Uppercase)
            .input('Sexe', sql.NVarChar, Sexe)
            .input('Telephone', sql.NVarChar, Telephone)
            .input('Adresse', sql.NVarChar, Adresse)
            .input('Id_Couverture', sql.Int, Id_Couverture)
            .input('Id_Provenance', sql.Int, Id_Provenance)
            .input('Id_NiveauScolarite', sql.Int, Id_NiveauScolarite)
            .input('id_Etablissement', sql.Int, id_Etablissement)
            .input('id', sql.Int, id)
            .query(updatePatientQuery);

          // Fetch the existing antecedents
          const getExistingAntecedentsQuery = `
            SELECT Id_Antecedent FROM Patient_Antecedents WHERE Id_Patient = @id
          `;
          const existingAntecedentsResult = await transaction
            .request()
            .input('id', sql.Int, id)
            .query(getExistingAntecedentsQuery);

          const existingAntecedents = existingAntecedentsResult.recordset.map((record) => record.Id_Antecedent);

          // Convert provided Id_Antecedent to an array
          const newAntecedents = Id_Antecedent
            ? (Array.isArray(Id_Antecedent)
              ? Id_Antecedent
              : Id_Antecedent.split(',').map(id => parseInt(id.trim(), 10)).filter(id => !isNaN(id)))
            : [];


          // Determine antecedents to add and remove
          const antecedentsToAdd = newAntecedents.filter((id) => !existingAntecedents.includes(id));
          const antecedentsToRemove = existingAntecedents.filter((id) => !newAntecedents.includes(id));

          // Remove antecedents that are no longer needed
          if (antecedentsToRemove.length > 0) {
            const removeRequest = transaction.request();
            const removeAntecedentsQuery = `
              DELETE FROM Patient_Antecedents WHERE Id_Patient = @id AND Id_Antecedent IN (${antecedentsToRemove.join(', ')})
            `;
            await removeRequest.input('id', sql.Int, id).query(removeAntecedentsQuery);
          }

          // Insert new antecedents
          for (const antecedentId of antecedentsToAdd) {
            const insertJoinTableQuery = `
              INSERT INTO Patient_Antecedents (Id_Antecedent, Id_Patient)
              VALUES (@Id_Antecedent, @Id_Patient)
            `;

            const insertRequest = transaction.request();
            await insertRequest
              .input('Id_Antecedent', sql.Int, antecedentId)
              .input('Id_Patient', sql.Int, id)
              .query(insertJoinTableQuery);
          }

          // Commit the transaction
          await transaction.commit();

          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ message: 'Patient updated successfully' }));
        } catch (error) {
          // Rollback the transaction in case of error
          await transaction.rollback();
          console.error('Error Details:', error);
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Error updating patient', details: error.message }));
        }
      } catch (error) {
        console.error('Error Details:', error);
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Error parsing request body', details: error.message }));
      }
    });
  } catch (error) {
    console.error('Error Details:', error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Error handling request', details: error.message }));
  }
};









const deletePatient = async (req, res, id) => {
  if (!id) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Patient ID is required' }));
    return;
  }

  let transaction;

  try {
    // Wait for the poolPromise to resolve
    const pool = await poolPromise;

    // Start a transaction
    transaction = new sql.Transaction(pool);

    await transaction.begin();

    // Delete related records from T_Consultation first
    await transaction.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM T_Consultation WHERE Id_Patient = @id');

    // Delete related records from Patient_Antecedents
    await transaction.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM Patient_Antecedents WHERE Id_Patient = @id');

    // Delete the patient record from T_Patient
    await transaction.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM T_Patient WHERE Id_Patient = @id');

    // Commit the transaction
    await transaction.commit();

    // Send success response
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Patient deleted successfully' }));
  } catch (error) {
    if (transaction) {
      try {
        await transaction.rollback();
      } catch (rollbackError) {
        console.error('Error rolling back transaction:', rollbackError);
      }
    }

    // Send error response
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Error deleting patient', details: error.message }));
  }
};




const getPatientById = async (req, res, id) => {
  try {
    // Wait for the poolPromise to resolve
    const pool = await poolPromise;

    // Prepare the SQL query to get a patient by id along with their antecedents
    const query = `
      SELECT
        P.*,
        PA.Id_Antecedent,
        A.Nom AS AntecedentNom,
        E.Nom_Etablissement AS EtablissementNom
      FROM
        T_Patient P
          LEFT JOIN Patient_Antecedents PA ON P.Id_Patient = PA.Id_Patient
          LEFT JOIN P_Antecedent A ON PA.Id_Antecedent = A.Id_Antecedent
          LEFT JOIN P_Etablissement E ON P.Id_Etablissement = E.Id_Etablissement
      WHERE
        P.Id_Patient = @id
    `;

    // Use parameterized query to avoid SQL injection
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query(query);

    const rows = result.recordset;

    if (rows.length === 0) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Patient not found' }));
      return;
    }

    // Group antecedents by patient
    const patientData = {
      Id_Patient: rows[0].Id_Patient,
      Nom: rows[0].Nom,
      Prenom: rows[0].Prenom,
      DateNaissance: rows[0].DateNaissance,
      CNIE: rows[0].CNIE,
      Sexe: rows[0].Sexe,
      Telephone: rows[0].Telephone,
      Adresse: rows[0].Adresse,
      Id_Couverture: rows[0].Id_Couverture,
      Id_Provenance: rows[0].Id_Provenance,
      Id_NiveauScolarite: rows[0].Id_NiveauScolarite,
      id_Etablissement: rows[0].id_Etablissement,
      Nom_Etablissement: rows[0].EtablissementNom,  // Add the establishment name
      Antecedents: rows
        .map(row => ({
          Id_Antecedent: row.Id_Antecedent,
          Nom: row.AntecedentNom
        }))
        .filter(a => a.Id_Antecedent !== null) // Remove null antecedents
    };

    console.log(patientData)

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(patientData));
  } catch (error) {
    console.error('Error Details:', error);
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
    // Wait for the poolPromise to resolve
    const pool = await poolPromise;

    // Execute the query
    const result = await pool.request().query('SELECT * FROM P_Antecedent');

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(result.recordset));
  } catch (error) {
    console.error('Error fetching antecedents:', error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Error fetching antecedents', details: error.message }));
  }
};

const getCouvertures = async (req, res) => {
  try {
    // Wait for the poolPromise to resolve
    const pool = await poolPromise;

    // Execute the query
    const result = await pool.request().query('SELECT * FROM P_Couverture');

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(result.recordset));
  } catch (error) {
    console.error('Error fetching couvertures:', error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Error fetching couvertures', details: error.message }));
  }
};

const getProvenances = async (req, res) => {
  try {
    // Wait for the poolPromise to resolve
    const pool = await poolPromise;

    // Execute the query
    const result = await pool.request().query('SELECT * FROM P_Provenance');

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(result.recordset));
  } catch (error) {
    console.error('Error fetching provenances:', error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Error fetching provenances', details: error.message }));
  }
};

const getEtablissements = async (req, res) => {
  try {
    // Wait for the poolPromise to resolve
    const pool = await poolPromise;

    // Execute the query
    const result = await pool.request().query('SELECT * FROM P_Etablissement');

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(result.recordset));
  } catch (error) {
    console.error('Error fetching Etablissements:', error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Error fetching Etablissement', details: error.message }));
  }
};

const getNiveauxScolaires = async (req, res) => {
  try {
    // Wait for the poolPromise to resolve
    const pool = await poolPromise;

    // Execute the query
    const result = await pool.request().query('SELECT * FROM P_NiveauScolarite');

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(result.recordset));
  } catch (error) {
    console.error('Error fetching niveauscolaire:', error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Error fetching niveauscolaire', details: error.message }));
  }
};

const getPrestataire = async (req, res) => {
  try {
    // Wait for the poolPromise to resolve
    const pool = await poolPromise;

    // Execute the query
    const result = await pool.request().query('SELECT * FROM P_Prestataire');

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(result.recordset));
  } catch (error) {
    console.error('Error fetching prestataire:', error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Error fetching prestataire', details: error.message }));
  }
};

const getSoufle = async (req, res) => {
  try {
    // Wait for the poolPromise to resolve
    const pool = await poolPromise;

    // Execute the query
    const result = await pool.request().query('SELECT * FROM P_Soufle');

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(result.recordset));
  } catch (error) {
    console.error('Error fetching soufle:', error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Error fetching soufle', details: error.message }));
  }
};

const getComplication = async (req, res) => {
  try {
    // Wait for the poolPromise to resolve
    const pool = await poolPromise;

    // Execute the query
    const result = await pool.request().query('SELECT * FROM P_Complication');

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(result.recordset));
  } catch (error) {
    console.error('Error fetching complication:', error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Error fetching complication', details: error.message }));
  }
};

const getBU = async (req, res) => {
  try {
    // Wait for the poolPromise to resolve
    const pool = await poolPromise;

    // Execute the query
    const result = await pool.request().query('SELECT * FROM P_BandeletteUrinaire');

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(result.recordset));
  } catch (error) {
    console.error('Error fetching BandeletteUrinaire:', error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Error fetching BandeletteUrinaire', details: error.message }));
  }
};

const getTroubles = async (req, res) => {
  try {
    // Wait for the poolPromise to resolve
    const pool = await poolPromise;

    // Execute the query
    const result = await pool.request().query('SELECT * FROM P_Trouble');

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(result.recordset));
  } catch (error) {
    console.error('Error fetching trouble:', error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Error fetching trouble', details: error.message }));
  }
};

const getmesure = async (req, res) => {
  try {
    // Wait for the poolPromise to resolve
    const pool = await poolPromise;

    // Execute the query
    const result = await pool.request().query('SELECT * FROM P_MesureHygienoDiabetique');

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(result.recordset));
  } catch (error) {
    console.error('Error fetching P_MesureHygienoDiabetique:', error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Error fetching P_MesureHygienoDiabetique', details: error.message }));
  }
};

const getTP = async (req, res) => {
  try {
    // Wait for the poolPromise to resolve
    const pool = await poolPromise;

    // Execute the query
    const result = await pool.request().query('SELECT * FROM P_TraitementPreventif');

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(result.recordset));
  } catch (error) {
    console.error('Error fetching P_TraitementPreventif:', error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Error fetching P_TraitementPreventif', details: error.message }));
  }
};

const getantihta = async (req, res) => {
  try {
    // Wait for the poolPromise to resolve
    const pool = await poolPromise;

    // Execute the query
    const result = await pool.request().query('SELECT * FROM P_AntiHTA');

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(result.recordset));
  } catch (error) {
    console.error('Error fetching P_AntiHTA:', error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Error fetching P_AntiHTA', details: error.message }));
  }
};

const getantiD = async (req, res) => {
  try {
    // Wait for the poolPromise to resolve
    const pool = await poolPromise;

    // Execute the query
    const result = await pool.request().query('SELECT * FROM P_AntiDiabetique');

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(result.recordset));
  } catch (error) {
    console.error('Error fetching P_AntiDiabetique:', error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Error fetching P_AntiDiabetique', details: error.message }));
  }
};



const addConsultation = async (req, res) => {
  try {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', async () => {
      try {
        const {
          dateConsultation,
          Id_Presetataire,
          diabete,
          tabagisme,
          poids,
          taille,
          tourDeTaille,
          frequenceCardiaque,
          pas,
          pad,
          Id_Soufle,
          Id_Complication,
          glycemie,
          hemoglobineGlyquee,
          cholesterolTotal,
          hdlCholesterol,
          ldlCholesterol,
          triglycerides,
          creatinineMg,
          ureeGl,
          Albuminurie,
          Proteinurie,
          DebitFiltrationGlomerulaire,
          id_Band,
          ASAT,
          ALAT,
          TSH,
          Kaliemie,
          VitamineD,
          AcideUrique,
          ECG,
          id_trouble,
          FO,
          Id_Mesure,
          Id_AntiDiabetique,
          Id_AntiHTA,
          Id_Tp,
          patientId
        } = JSON.parse(body);

        const pool = await poolPromise;

        // Step 1: Insert into the relevant tables for the clinical exam (T_ExamenClinique)
        const insertExamenCliniqueQuery =`
          INSERT INTO T_ExamenClinique (Poids, Taille, TourDeTaille, FrequenceCardiaque, Pas, Pad)
        OUTPUT INSERTED.Id_Eclinique
        VALUES (@poids, @taille, @tourDeTaille, @frequenceCardiaque, @pas, @pad)
        `;

        const examenCliniqueResult = await pool.request()
          .input('poids', sql.Decimal(5, 2), poids)
          .input('taille', sql.Decimal(5, 2), taille)
          .input('tourDeTaille', sql.Decimal(5, 2), tourDeTaille)
          .input('frequenceCardiaque', sql.Decimal(5, 2), frequenceCardiaque)
          .input('pas', sql.Decimal(5, 2), pas)
          .input('pad', sql.Decimal(5, 2), pad)
          .query(insertExamenCliniqueQuery);

        const Id_Eclinique = examenCliniqueResult.recordset[0].Id_Eclinique;

        // Check if Id_Antecedent is a string and split it, otherwise use it directly as an array
        const Souflesids = Id_Soufle ? (Array.isArray(Id_Soufle) ? Id_Soufle : Id_Soufle.split(',').map(id => id.trim())) : [];


        for (let Souflesid of Souflesids) {
          Souflesid = parseInt(Souflesid, 10);  // Ensure it's an integer
          if (!isNaN(Souflesid)) {
            const insertJoinTableQuery =`
              INSERT INTO ExamenClinique_Soufle (Id_Eclinique, Id_Soufle)
            VALUES (@Id_Eclinique, @Id_Soufle)
            `;


            await pool.request()
              .input('Id_Eclinique', sql.Int, Id_Eclinique)
              .input('Id_Soufle', sql.Int, Souflesid)
              .query(insertJoinTableQuery);
          } else {
            console.error(`Invalid Id soufle: ${Souflesid}`);
          }
        }

        // Check if Id_Antecedent is a string and split it, otherwise use it directly as an array
        const Complicationids = Id_Complication ? (Array.isArray(Id_Complication) ? Id_Complication : Id_Complication.split(',').map(id => id.trim())) : [];


        for (let Complicationid of Complicationids) {
          Complicationid = parseInt(Complicationid, 10);  // Ensure it's an integer
          if (!isNaN(Complicationid)) {
            const insertJoinTableQuery =`
              INSERT INTO ExamenClinique_Complication (Id_Eclinique, Id_Complication)
            VALUES (@Id_Eclinique, @Id_Complication)
            `;


            await pool.request()
              .input('Id_Eclinique', sql.Int, Id_Eclinique)
              .input('Id_Complication', sql.Int, Complicationid)
              .query(insertJoinTableQuery);
          } else {
            console.error(`Invalid Id Complication: ${Complicationid}`);
          }
        }


        // Step 3: Insert into the paraclinical exam tables (T_BillanGlycemique, T_BillanLipidique, etc.)
        const insertBillanGlycemiqueQuery =`
          INSERT INTO T_BillanGlycemique (GlycemieAjeun, Hemoglobine_glyquee)
        OUTPUT INSERTED.Id_BillanG
        VALUES (@glycemie, @hemoglobineGlyquee)
        `;

        const billanGlycemiqueResult = await pool.request()
          .input('glycemie', sql.Decimal(5, 2), glycemie)
          .input('hemoglobineGlyquee', sql.Decimal(5, 2), hemoglobineGlyquee)
          .query(insertBillanGlycemiqueQuery);

        const Id_BillanG = billanGlycemiqueResult.recordset[0].Id_BillanG;

        const insertBillanLipidiqueQuery =`
          INSERT INTO T_BillanLipidique (CholesterolTotal, HDL_Cholesterol, LDL_Cholesterol, Triglyceride)
        OUTPUT INSERTED.Id_BillanL
        VALUES (@cholesterolTotal, @hdlCholesterol, @ldlCholesterol, @triglycerides)
        `;

        const billanLipidiqueResult = await pool.request()
          .input('cholesterolTotal', sql.Decimal(5, 2), cholesterolTotal)
          .input('hdlCholesterol', sql.Decimal(5, 2), hdlCholesterol)
          .input('ldlCholesterol', sql.Decimal(5, 2), ldlCholesterol)
          .input('triglycerides', sql.Decimal(5, 2), triglycerides)
          .query(insertBillanLipidiqueQuery);

        const Id_BillanL = billanLipidiqueResult.recordset[0].Id_BillanL;

        const insertBillanRenalQuery =`
          INSERT INTO T_BillanRenal (Creatine, Uree, Albuminurie, Proteinurie24H, DebitFG)
        OUTPUT INSERTED.Id_BillanR
        VALUES (@creatinineMg, @ureeGl, @Albuminurie, @Proteinurie, @DebitFiltrationGlomerulaire)
        `;

        const billanRenalResult = await pool.request()
          .input('creatinineMg', sql.Decimal(5, 2), creatinineMg)
          .input('ureeGl', sql.Decimal(5, 2), ureeGl)
          .input('Albuminurie', sql.Decimal(5, 2), Albuminurie)
          .input('Proteinurie', sql.Decimal(5, 2), Proteinurie)
          .input('DebitFiltrationGlomerulaire', sql.Decimal(5, 2), DebitFiltrationGlomerulaire)
          .query(insertBillanRenalQuery);

        const Id_BillanR = billanRenalResult.recordset[0].Id_BillanR;

        // Check if Id_Antecedent is a string and split it, otherwise use it directly as an array
        const bandeletteids = id_Band ? (Array.isArray(id_Band) ? id_Band : id_Band.split(',').map(id => id.trim())) : [];


        for (let bandeletteid of bandeletteids) {
          bandeletteid = parseInt(bandeletteid, 10);  // Ensure it's an integer
          if (!isNaN(bandeletteid)) {
            const insertJoinTableQuery =`
              INSERT INTO BillanR_Bandelette (Id_BillanR, id_Band)
            VALUES (@Id_BillanR, @id_Band)
            `;


            await pool.request()
              .input('Id_BillanR', sql.Int, Id_BillanR)
              .input('id_Band', sql.Int, bandeletteid)
              .query(insertJoinTableQuery);
          } else {
            console.error(`Invalid Id bandelette: ${bandeletteid}`);
          }
        }

        const insertBillanHepatiqueQuery =`
          INSERT INTO T_BillanHepatique (ASAT, ALAT)
        OUTPUT INSERTED.Id_BillanH
        VALUES (@ASAT, @ALAT)
        `;

        const billanHepatiqueResult = await pool.request()
          .input('ASAT', sql.Decimal(5, 2), ASAT)
          .input('ALAT', sql.Decimal(5, 2), ALAT)
          .query(insertBillanHepatiqueQuery);

        const Id_BillanH = billanHepatiqueResult.recordset[0].Id_BillanH;

        const insertBillanThyroidienQuery =`
          INSERT INTO T_BillanThyroidien (TSH)
        OUTPUT INSERTED.Id_BillanT
        VALUES (@TSH)
        `;

        const billanThyroidienResult = await pool.request()
          .input('TSH', sql.Decimal(5, 2), TSH)
          .query(insertBillanThyroidienQuery);

        const Id_BillanT = billanThyroidienResult.recordset[0].Id_BillanT;

        // Step 4: Insert into T_EcgFo
        const insertEcgFoQuery =`
          INSERT INTO T_EcgFo (ECG, FO , id_trouble)
        OUTPUT INSERTED.Id_EcgFo
        VALUES (@ECG, @FO , @id_trouble)
        `;

        const ecgFoResult = await pool.request()
          .input('ECG', sql.NVarChar, ECG)
          .input('FO', sql.NVarChar, FO)
          .input('id_trouble', sql.Int, id_trouble)
          .query(insertEcgFoQuery);

        const Id_EcgFo = ecgFoResult.recordset[0].Id_EcgFo;


        // Step 5: Insert into T_ExamenParaClinique
        const insertExamenParaCliniqueQuery =`
          INSERT INTO T_ExamenParaClinique (Id_BillanG, Id_BillanH, Id_BillanT, Id_BillanR, Id_BillanL, Kaliemie, VitamineD, AcideUrique, Id_EcgFo)
        OUTPUT INSERTED.Id_Eparaclinique
        VALUES (@Id_BillanG, @Id_BillanH, @Id_BillanT, @Id_BillanR, @Id_BillanL, @Kaliemie, @VitamineD, @AcideUrique, @Id_EcgFo)
        `;

        const examenParaCliniqueResult = await pool.request()
          .input('Id_BillanG', sql.Int, Id_BillanG)
          .input('Id_BillanH', sql.Int, Id_BillanH)
          .input('Id_BillanT', sql.Int, Id_BillanT)
          .input('Id_BillanR', sql.Int, Id_BillanR)
          .input('Id_BillanL', sql.Int, Id_BillanL)
          .input('Kaliemie', sql.Decimal(5, 2), Kaliemie)
          .input('VitamineD', sql.Decimal(5, 2), VitamineD)
          .input('AcideUrique', sql.Decimal(5, 2), AcideUrique)
          .input('Id_EcgFo', sql.Int, Id_EcgFo)
          .query(insertExamenParaCliniqueQuery);

        const Id_Eparaclinique = examenParaCliniqueResult.recordset[0].Id_Eparaclinique;

        // Step 6: Insert into the treatment table (T_Traitement)
        const insertTraitementQuery =`
          INSERT INTO T_Traitement (Id_Mesure)
        OUTPUT INSERTED.Id_Traitement
        VALUES (@Id_Mesure)
        `;

        const traitementResult = await pool.request()
          .input('Id_Mesure', sql.Int, Id_Mesure)
          .query(insertTraitementQuery);

        const Id_Traitement = traitementResult.recordset[0].Id_Traitement;

        // Check if Id_Antecedent is a string and split it, otherwise use it directly as an array
        const antidiabetiqueIds = Id_AntiDiabetique ? (Array.isArray(Id_AntiDiabetique) ? Id_AntiDiabetique : Id_AntiDiabetique.split(',').map(id => id.trim())) : [];


        for (let antidiabetiqueId of antidiabetiqueIds) {
          antidiabetiqueId = parseInt(antidiabetiqueId, 10);  // Ensure it's an integer
          if (!isNaN(antidiabetiqueId)) {
            const insertJoinTableQuery =`
              INSERT INTO Traitement_AntiDiabetique (Id_Traitement, Id_AntiDiabetique)
            VALUES (@Id_Traitement, @Id_AntiDiabetique)
            `;

            await pool.request()
              .input('Id_Traitement', sql.Int, Id_Traitement)
              .input('Id_AntiDiabetique', sql.Int, antidiabetiqueId)
              .query(insertJoinTableQuery);
          } else {
            console.error(`Invalid Id antidiabetique: ${antidiabetiqueId}`);
          }
        }


        // Check if Id_Antecedent is a string and split it, otherwise use it directly as an array
        const Antihtaids = Id_AntiHTA ? (Array.isArray(Id_AntiHTA) ? Id_AntiHTA : Id_AntiHTA.split(',').map(id => id.trim())) : [];


        for (let Antihtaid of Antihtaids) {
          Antihtaid = parseInt(Antihtaid, 10);  // Ensure it's an integer
          if (!isNaN(Antihtaid)) {
            const insertJoinTableQuery =`
              INSERT INTO Traitement_AntiHTA (Id_Traitement, Id_AntiHTA)
            VALUES (@Id_Traitement, @Id_AntiHTA)
            `;


            await pool.request()
              .input('Id_Traitement', sql.Int, Id_Traitement)
              .input('Id_AntiHTA', sql.Int, Antihtaid)
              .query(insertJoinTableQuery);
          } else {
            console.error(`Invalid Id anti hta: ${Antihtaid}`);
          }
        }

        // Check if Id_Antecedent is a string and split it, otherwise use it directly as an array
        const tpids = Id_Tp ? (Array.isArray(Id_Tp) ? Id_Tp : Id_Tp.split(',').map(id => id.trim())) : [];


        for (let tpid of tpids) {
          tpid = parseInt(tpid, 10);  // Ensure it's an integer
          if (!isNaN(tpid)) {
            const insertJoinTableQuery =`
              INSERT INTO Traitement_TraitementP (Id_Traitement, Id_Tp)
            VALUES (@Id_Traitement, @Id_Tp)
            `;


            await pool.request()
              .input('Id_Traitement', sql.Int, Id_Traitement)
              .input('Id_Tp', sql.Int, tpid)
              .query(insertJoinTableQuery);
          } else {
            console.error(`d tp: ${tpid}`);
          }
        }



        // Step 7: Finally, insert into the T_Consultation table
        const insertConsultationQuery =`
          INSERT INTO T_Consultation (DateCreation, Diabete, Tabagisme, Id_Presetataire, Id_Eclinique, Id_Eparaclinique, Id_Traitement, Id_Patient)
        VALUES (@dateConsultation, @diabete, @tabagisme, @Id_Presetataire, @Id_Eclinique, @Id_Eparaclinique, @Id_Traitement, @patientId)
        `;

        await pool.request()
          .input('dateConsultation', sql.Date, dateConsultation)
          .input('diabete', sql.NVarChar, diabete)
          .input('tabagisme', sql.NVarChar, tabagisme)
          .input('Id_Presetataire', sql.Int, Id_Presetataire)
          .input('Id_Eclinique', sql.Int, Id_Eclinique)
          .input('Id_Eparaclinique', sql.Int, Id_Eparaclinique)
          .input('Id_Traitement', sql.Int, Id_Traitement)
          .input('patientId', sql.Int, patientId)
          .query(insertConsultationQuery);

        res.statusCode = 201;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ message: 'Consultation added successfully' }));
        console.log(
          dateConsultation,
          Id_Presetataire,
          diabete,
          tabagisme,
          poids,
          taille,
          tourDeTaille,
          frequenceCardiaque,
          pas,
          pad,
          Id_Soufle,
          Id_Complication,
          glycemie,
          hemoglobineGlyquee,
          cholesterolTotal,
          hdlCholesterol,
          ldlCholesterol,
          triglycerides,
          creatinineMg,
          ureeGl,
          Albuminurie,
          Proteinurie,
          DebitFiltrationGlomerulaire,
          id_Band,
          ASAT,
          ALAT,
          TSH,
          Kaliemie,
          VitamineD,
          AcideUrique,
          ECG,
          id_trouble,
          FO,
          Id_Mesure,
          Id_AntiDiabetique,
          Id_AntiHTA,
          Id_Tp,
          patientId
        )
      } catch (error) {
        console.error('Error Details:', error);
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Error adding consultation', details: error.message }));
      }
    });
  } catch (error) {
    console.error('Error Details:', error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Error handling request', details: error.message }));
  }
};
const getConsultationsById = async (req, res, id) => {
  try {
    // Wait for the poolPromise to resolve
    const pool = await poolPromise;

    // Prepare the SQL query with parameters
    const query = `
      SELECT * FROM GetConsultationDetailsByPatient(@id); -- Replace 1 with the desired patient ID


    `;

    // Use parameterized query to avoid SQL injection
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query(query);

    const rows = result.recordset; // Adjust based on actual result structure

    if (rows.length === 0) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'No consultations found for this patient' }));
      return;
    }

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(rows));
  } catch (error) {
    console.error('Error Details:', error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Error fetching consultations', details: error.message }));
  }
};


// Assuming 'pool' is your SQL Server connection pool
const getConsultationByProvenance = async (req, res, provenanceId) => {
  try {
    const query = `
      SELECT
        c.DateCreation AS date_consultation,
        p.Nom AS nom,
        p.Prenom AS prenom,
        p.CNIE AS cin,
        p.Sexe AS sexe,
        p.Telephone AS telephone,
        e.Nom_Etablissement AS establishment_name,
        pr.Prov AS province_name
      FROM
        T_Consultation c
      JOIN
        T_Patient p ON c.Id_Patient = p.Id_Patient
      JOIN
        P_Provenance prov ON p.Id_Provenance = prov.Id_Provenance
      JOIN
        P_Etablissement e ON p.id_Etablissement = e.Id_Etablissement
      JOIN
        P_Province pr ON e.Id_Province = pr.id_Prov
      WHERE
        pr.id_Prov = @provenanceId;
    `;

    // Use pool.request() to execute the query
    const pool = await poolPromise;
    const result = await pool.request()
      .input('provenanceId', sql.Int, provenanceId)
      .query(query);

    if (result.recordset.length === 0) {
      res.writeHead(404, {'Content-Type': 'application/json'});
      res.end(JSON.stringify({ error: 'Consultations not found' }));
      return;
    }

    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify(result.recordset));
  } catch (error) {
    res.writeHead(500, {'Content-Type': 'application/json'});
    res.end(JSON.stringify({ error: 'Error fetching consultations', details: error.message }));
}
}

const getProvenanceNameById = async (req, res, id) => {
  try {
    const pool = await poolPromise;
    const query = 'SELECT Prov FROM P_Province WHERE id_Prov = @id;';

    // Use pool.request() to execute the query
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query(query);

    if (result.recordset.length === 0) {
      res.writeHead(404, {'Content-Type': 'application/json'});
      res.end(JSON.stringify({ error: 'Provenance not found' }));
      return;
    }

    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify(result.recordset[0]));
  } catch (error) {
    console.error('Error fetching provenance:', error);
    res.writeHead(500, {'Content-Type': 'application/json'});
    res.end(JSON.stringify({ error: 'Error fetching provenance', details: error.message }));
  }
};

const getStat = async (req, res) => {
  try {
    const pool = await poolPromise;
    const query = `
      SELECT prov.Prov AS province_name, etab.Nom_Etablissement AS establishment_name, COUNT(*) AS count
      FROM T_Patient p
        JOIN P_Etablissement etab ON p.Id_Etablissement = etab.Id_Etablissement
        JOIN P_Province prov ON etab.Id_Province = prov.id_Prov
      GROUP BY prov.Prov, etab.Nom_Etablissement
    `;

    const result = await pool.request().query(query);

    if (result.recordset.length === 0) {
      res.writeHead(404, {'Content-Type': 'application/json'});
      res.end(JSON.stringify({ error: 'No data found' }));
      return;
    }

    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify(result.recordset));
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.writeHead(500, {'Content-Type': 'application/json'});
    res.end(JSON.stringify({ error: 'Error fetching statistics', details: error.message }));
  }
};
const sendHelp = (req, res) => {
  let body = '';

  req.on('data', chunk => {
    body += chunk.toString();
  });

  req.on('end', () => {
    const { email, message } = JSON.parse(body);

    const mailOptions = {
      from: email,
      to: 'youness.meriaf@uit.ac.ma',
      subject: 'Contact',
      text: message
    };
    console.log(email);
    transporter.sendMail(mailOptions)
      .then(info => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ message: 'Help request sent successfully', info }));
      })
      .catch(error => {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ message: 'Failed to send help request', error }));
      });
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
  }else if (pathname === '/api/etablissements' && method === 'GET') {
    verifyToken(req, res, () => getEtablissements(req, res));
  }else if (pathname === '/api/niveaux-scolaires' && method === 'GET') {
      verifyToken(req, res, () => getNiveauxScolaires(req, res));
  }else if (pathname === '/api/prestataire' && method === 'GET') {
    verifyToken(req, res, () => getPrestataire(req, res));
  }else if (pathname === '/api/soufle' && method === 'GET') {
    verifyToken(req, res, () => getSoufle(req, res));
  }else if (pathname === '/api/complication' && method === 'GET') {
    verifyToken(req, res, () => getComplication(req , res));
  }else if (pathname === '/api/trouble' && method === 'GET') {
    verifyToken(req, res, () => getTroubles(req , res));
  }else if (pathname === '/api/BU' && method === 'GET') {
    verifyToken(req, res, () => getBU(req , res));
  }else if (pathname === '/api/antid' && method === 'GET') {
    verifyToken(req, res, () => getantiD(req , res));
  }else if (pathname === '/api/antihta' && method === 'GET') {
    verifyToken(req, res, () => getantihta(req , res));
  }else if (pathname === '/api/mesure' && method === 'GET') {
    verifyToken(req, res, () => getmesure(req , res));
  }else if (pathname === '/api/tp' && method === 'GET') {
    verifyToken(req, res, () => getTP(req , res));
  }else if (pathname === '/api/consultations' && method === 'POST') {
    verifyToken(req, res, () => addConsultation(req, res));
  } else if (pathname.startsWith('/api/registre/') && method === 'GET') {
    const provenanceId = pathname.split('/')[3];
    verifyToken(req, res, () => getConsultationByProvenance(req, res, provenanceId));
  }else if (pathname.startsWith('/api/provenanceName/') && method === 'GET') {
      const provenanceId = pathname.split('/')[3];
      verifyToken(req, res, () => getProvenanceNameById(req, res, provenanceId));
  } else if (pathname.startsWith('/api/consultations/') && method === 'PUT') {
    const id = pathname.split('/')[3];
    verifyToken(req, res, () => updateConsultation(req, res, id));
  }else if (pathname.startsWith('/api/consultations/') && method === 'GET') {
    const id = pathname.split('/')[3];
    verifyToken(req, res, () => getConsultationsById(req, res, id));
  }else if (pathname === '/api/stat' && method === 'GET') {
      verifyToken(req, res, () => getStat(req, res));
  }else if (pathname === '/api/send-help' && method === 'POST') {
      verifyToken(req, res, () => sendHelp(req, res));
  }else {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Not Found');
  }
});

server.listen(port, hostname, async () => {
  console.log(`Server running at http://${hostname}:${port}/`);
  //await addDefaultUser('Karam Yassine', 'karamyassine1210@gmail.com', 'admin');
  //await addDefaultPatient(1, 1, '2000-01-01', 1, '123 Main St', 'Doe', 'John', 'CD6100', 'M', '555-1234');
});
