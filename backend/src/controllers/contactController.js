// backend/src/controllers/contactController.js
const db = require('../config/database');
const ErrorResponse = require('../utils/ErrorResponse');

// Cria um contato (cliente/lead)
exports.createContact = async (req, res, next) => {
  const { name, email, phone, status, lead_score } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO contacts (name, email, phone, status, lead_score, user_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [name, email, phone, status || 'lead', lead_score || 0, req.user.id]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(new ErrorResponse('Error creating contact', 500));
  }
};

// Lista contatos: para gestor retorna todos com o nome do criador; para vendedores, filtra por seu user_id
exports.getContacts = async (req, res, next) => {
  try {
    let query;
    let params;
    if (req.user.role === 'gestor') {
      query = `
        SELECT contacts.*, users.username AS creator_name 
        FROM contacts 
        LEFT JOIN users ON contacts.user_id = users.id
      `;
      params = [];
    } else {
      query = `
        SELECT contacts.*, users.username AS creator_name 
        FROM contacts 
        LEFT JOIN users ON contacts.user_id = users.id
        WHERE contacts.user_id = $1
      `;
      params = [req.user.id];
    }
    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    next(new ErrorResponse('Error fetching contacts', 500));
  }
};

// Atualiza um contato – (mantém a lógica atual)
exports.updateContact = async (req, res, next) => {
  const { id } = req.params;
  const { name, email, phone, status, lead_score } = req.body;
  try {
    const result = await db.query(
      'UPDATE contacts SET name = $1, email = $2, phone = $3, status = $4, lead_score = $5 WHERE id = $6 AND user_id = $7 RETURNING *',
      [name, email, phone, status, lead_score, id, req.user.id]
    );
    if (result.rows.length === 0) {
      return next(new ErrorResponse('Contact not found or not authorized', 404));
    }
    res.json(result.rows[0]);
  } catch (error) {
    next(new ErrorResponse('Error updating contact', 500));
  }
};

// Atualiza a pontuação de lead de um contato
exports.updateLeadScore = async (req, res, next) => {
  const { id } = req.params;
  const { lead_score } = req.body;
  try {
    let query;
    let params;
    if (req.user.role === 'gestor') {
      query = 'UPDATE contacts SET lead_score = $1 WHERE id = $2 RETURNING *';
      params = [lead_score, id];
    } else {
      query = 'UPDATE contacts SET lead_score = $1 WHERE id = $2 AND user_id = $3 RETURNING *';
      params = [lead_score, id, req.user.id];
    }
    const result = await db.query(query, params);
    if (result.rows.length === 0) {
      return next(new ErrorResponse('Contact not found or not authorized', 404));
    }
    res.json(result.rows[0]);
  } catch (error) {
    next(new ErrorResponse('Error updating lead score', 500));
  }
};

// Deleta um contato
exports.deleteContact = async (req, res, next) => {
  const { id } = req.params;
  try {
    let query;
    let params;
    if (req.user.role === 'gestor') {
      query = 'DELETE FROM contacts WHERE id = $1 RETURNING *';
      params = [id];
    } else {
      query = 'DELETE FROM contacts WHERE id = $1 AND user_id = $2 RETURNING *';
      params = [id, req.user.id];
    }
    const result = await db.query(query, params);
    if (result.rows.length === 0) {
      return next(new ErrorResponse('Contact not found or not authorized', 404));
    }
    res.json({ message: 'Contact deleted successfully' });
  } catch (error) {
    next(new ErrorResponse('Error deleting contact', 500));
  }
};
