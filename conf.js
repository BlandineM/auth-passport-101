const mysql = require("mysql");
require("dotenv").config();

const db = mysql.createPool({
  connectionLimit: 10,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_SCHEMA
});
const jwtOptions = {
  secret: process.env.JWT_SECRET,
  saltRounds: parseInt(process.env.JWT_SALTROUNDS)
};
const backPort = process.env.BACKEND_PORT;

module.exports = {
  db,
  jwtOptions,
  backPort
};
