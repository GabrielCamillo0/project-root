// backend/src/controllers/communicationController.js
const db = require('../config/database');
const ErrorResponse = require('../utils/ErrorResponse');

// Cria um registro de comunicação (e-mail, ligação, WhatsApp, etc.)
exports.createCommunication = async (req, res, next) => {
  const { type, content, contact_id } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO communications (type, content, contact_id, user_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [type, content, contact_id, req.user.id]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(new ErrorResponse('Error creating communication record', 500));
  }
};

// Lista comunicações
// Se o usuário for gestor, retorna todos os registros; se não, filtra pelo contact_id (passado via query)
exports.getCommunicationsByContact = async (req, res, next) => {
  const { contact_id } = req.query; // Usamos query parameter
  try {
    let query;
    let params;
    if (req.user.role === 'gestor') {
      // Gestor vê todos os comunicados, opcionalmente pode filtrar se contact_id for fornecido:
      if (contact_id) {
        query = 'SELECT * FROM communications WHERE contact_id = $1';
        params = [contact_id];
      } else {
        query = 'SELECT * FROM communications';
        params = [];
      }
    } else {
      // Usuário comum: exige que contact_id seja informado
      if (!contact_id) {
        return next(new ErrorResponse('Contact ID is required', 400));
      }
      query = 'SELECT * FROM communications WHERE contact_id = $1 AND user_id = $2';
      params = [contact_id, req.user.id];
    }
    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    next(new ErrorResponse('Error fetching communications', 500));
  }
};

// Atualiza um registro de comunicação
exports.updateCommunication = async (req, res, next) => {
  const { id } = req.params;
  const { type, content } = req.body;
  try {
    let query, params;
    if (req.user.role === 'gestor') {
      query = 'UPDATE communications SET type = $1, content = $2 WHERE id = $3 RETURNING *';
      params = [type, content, id];
    } else {
      query = 'UPDATE communications SET type = $1, content = $2 WHERE id = $3 AND user_id = $4 RETURNING *';
      params = [type, content, id, req.user.id];
    }
    const result = await db.query(query, params);
    if (result.rows.length === 0) {
      return next(new ErrorResponse('Communication not found or not authorized', 404));
    }
    res.json(result.rows[0]);
  } catch (error) {
    next(new ErrorResponse('Error updating communication', 500));
  }
};

// Deleta um registro de comunicação
exports.deleteCommunication = async (req, res, next) => {
  const { id } = req.params;
  try {
    let query, params;
    if (req.user.role === 'gestor') {
      query = 'DELETE FROM communications WHERE id = $1 RETURNING *';
      params = [id];
    } else {
      query = 'DELETE FROM communications WHERE id = $1 AND user_id = $2 RETURNING *';
      params = [id, req.user.id];
    }
    const result = await db.query(query, params);
    if (result.rows.length === 0) {
      return next(new ErrorResponse('Communication not found or not authorized', 404));
    }
    res.json({ message: 'Communication deleted successfully' });
  } catch (error) {
    next(new ErrorResponse('Error deleting communication', 500));
  }
};
