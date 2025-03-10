const { Pool } = require('pg');
const env = require('./env');
const winston = require('winston');

// Configuração do pool de conexões com PostgreSQL
const pool = new Pool({
  host: env.DB_HOST,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_DATABASE,
  port: env.DB_PORT
});

pool.on('error', (err) => {
  winston.error('Unexpected error on idle client', err);
  process.exit(-1);
});

module.exports = {
  query: (text, params) => pool.query(text, params)
};
