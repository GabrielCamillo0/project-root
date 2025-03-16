// backend/src/controllers/authController.js
const db = require('../config/database');
const bcrypt = require('bcrypt');
const jwtHelper = require('../utils/jwtHelper');
const ErrorResponse = require('../utils/ErrorResponse');

// Registra um novo usuário
exports.register = async (req, res, next) => {
  const { username, password, role } = req.body;
  try {
    // Verifica se o usuário já existe
    const userExists = await db.query('SELECT id FROM users WHERE username = $1', [username]);
    if (userExists.rows.length > 0) {
      return next(new ErrorResponse('Username already exists', 400));
    }
    // Hash da senha com 12 rounds
    const hashedPassword = await bcrypt.hash(password, 12);
    const result = await db.query(
      'INSERT INTO users (username, password, role) VALUES ($1, $2, $3) RETURNING id, username, role',
      [username, hashedPassword, role || 'vendedor']
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

// Realiza o login e gera um token JWT
exports.login = async (req, res, next) => {
  const { username, password } = req.body;
  try {
    const result = await db.query('SELECT * FROM users WHERE username = $1', [username]);
    if (result.rows.length === 0) {
      return next(new ErrorResponse('Invalid credentials', 400));
    }
    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      console.log('Usuário encontrado:', user);
      return next(new ErrorResponse('Invalid credentials', 400));
    }
    const token = jwtHelper.generateToken({ id: user.id, username: user.username, role: user.role });
    res.json({ token });
  } catch (error) {
    next(error);
  }
};

// NOVO: Retorna os usuários criados (baseado nos usuários registrados via auth)
exports.getUsers = async (req, res, next) => {
  try {
    const result = await db.query('SELECT id, username, role FROM users');
    res.json(result.rows);
  } catch (error) {
    next(new ErrorResponse('Error fetching users', 500));
  }
};
