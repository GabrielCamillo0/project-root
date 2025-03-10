// backend/src/controllers/accountController.js
const db = require('../config/database');
const ErrorResponse = require('../utils/ErrorResponse');

// Cria uma nova Account (empresa)
exports.createAccount = async (req, res, next) => {
  const { name, industry, website } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO accounts (name, industry, website, user_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, industry, website, req.user.id]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(new ErrorResponse('Error creating account', 500));
  }
};

// Lista as Accounts (para gestor, todas; caso contrário, apenas as do usuário)
exports.getAccounts = async (req, res, next) => {
  try {
    let query = 'SELECT * FROM accounts WHERE user_id = $1';
    let params = [req.user.id];
    if (req.user.role === 'gestor') {
      query = 'SELECT * FROM accounts';
      params = [];
    }
    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    next(new ErrorResponse('Error fetching accounts', 500));
  }
};

// Atualiza uma Account
exports.updateAccount = async (req, res, next) => {
  const { id } = req.params;
  const { name, industry, website } = req.body;
  try {
    let query, params;
    if (req.user.role === 'gestor') {
      query = 'UPDATE accounts SET name = $1, industry = $2, website = $3 WHERE id = $4 RETURNING *';
      params = [name, industry, website, id];
    } else {
      query = 'UPDATE accounts SET name = $1, industry = $2, website = $3 WHERE id = $4 AND user_id = $5 RETURNING *';
      params = [name, industry, website, id, req.user.id];
    }
    const result = await db.query(query, params);
    if (result.rows.length === 0) {
      return next(new ErrorResponse('Account not found or not authorized', 404));
    }
    res.json(result.rows[0]);
  } catch (error) {
    next(new ErrorResponse('Error updating account', 500));
  }
};

// Deleta uma Account
exports.deleteAccount = async (req, res, next) => {
  const { id } = req.params;
  try {
    let query, params;
    if (req.user.role === 'gestor') {
      query = 'DELETE FROM accounts WHERE id = $1 RETURNING *';
      params = [id];
    } else {
      query = 'DELETE FROM accounts WHERE id = $1 AND user_id = $2 RETURNING *';
      params = [id, req.user.id];
    }
    const result = await db.query(query, params);
    if (result.rows.length === 0) {
      return next(new ErrorResponse('Account not found or not authorized', 404));
    }
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    next(new ErrorResponse('Error deleting account', 500));
  }
};
