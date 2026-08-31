const mysql = require("mysql2");

require("dotenv").config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 10164,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: {
    rejectUnauthorized: false, // Required by Aiven for secure SSL connections
  },
});

pool.getConnection((error, connection) => {
  if (error) {
    console.error("Database connection failed.", error.message);
    return;
  }
  console.log("MYSQL database connected sucessfully.");
  connection.release();
});

module.exports = pool.promise();
