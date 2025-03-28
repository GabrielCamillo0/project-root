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

// Lista comunicações para todos os usuários
exports.getCommunications = async (req, res, next) => {
  try {
    const query = `
      SELECT communications.*, users.username AS creator_name
      FROM communications
      LEFT JOIN users ON communications.user_id = users.id
    `;
    const result = await db.query(query);
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
    const result = await db.query(
      'UPDATE communications SET type = $1, content = $2 WHERE id = $3 RETURNING *',
      [type, content, id]
    );
    if (result.rows.length === 0) {
      return next(new ErrorResponse('Communication not found', 404));
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
    const result = await db.query(
      'DELETE FROM communications WHERE id = $1 RETURNING *',
      [id]
    );
    if (result.rows.length === 0) {
      return next(new ErrorResponse('Communication not found', 404));
    }
    res.json({ message: 'Communication deleted successfully' });
  } catch (error) {
    next(new ErrorResponse('Error deleting communication', 500));
  }
};
