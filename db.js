const sql = require('mssql');

// Configuration de la connexion à SQL Server
const config = {
  user: 'bob',             // Remplacez par votre nom d'utilisateur SQL Server
  password: 'bob',        // Remplacez par votre mot de passe SQL Server
  server: 'PC',      // Remplacez par le nom de l'hôte ou l'adresse IP de votre serveur SQL Server
  database: 'GestionPatient', // Nom de votre base de données
  port: 1433,               // Port par défaut pour SQL Server
  options: {
    encrypt: false,         // Utilisez 'true' pour une connexion sécurisée
    trustServerCertificate: true // Nécessaire pour ignorer les erreurs de certificat auto-signé
  },
  pool: {
    max: 10,                // Nombre maximum de connexions dans le pool
    min: 0,                 // Nombre minimum de connexions dans le pool
    idleTimeoutMillis: 30000 // Temps d'attente avant de fermer une connexion inactive
  }
};

// Création d'une promesse de pool
const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then(pool => {
    console.log('Connected to SQL Server');
    return pool;
  })
  .catch(err => {
    console.error('Database Connection Failed! Error: ', err);
    throw err;
  });

module.exports = {
  sql,         // Exporte l'objet SQL pour utiliser les fonctionnalités de mssql
  poolPromise  // Exporte la promesse de pool pour une connexion gérée
};
