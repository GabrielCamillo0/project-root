const db = require('../config/database');
const ErrorResponse = require('../utils/ErrorResponse');

// Cria uma nova oportunidade
exports.createOpportunity = async (req, res, next) => {
  const { title, value, stage, contact_id } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO opportunities (title, value, stage, contact_id, user_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [title, value, stage || 'new', contact_id, req.user.id]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(new ErrorResponse('Error creating opportunity', 500));
  }
};

// Lista oportunidades do usuário ou de todos (para gestor)
exports.getOpportunities = async (req, res, next) => {
  try {
    let query = 'SELECT * FROM opportunities WHERE user_id = $1';
    let params = [req.user.id];
    if (req.user.role === 'gestor') {
      query = 'SELECT * FROM opportunities';
      params = [];
    }
    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    next(new ErrorResponse('Error fetching opportunities', 500));
  }
};

// Atualiza o estágio de uma oportunidade
exports.updateOpportunity = async (req, res, next) => {
  const { id } = req.params;
  const { stage } = req.body;
  try {
    let query, params;
    // Se o usuário for gestor, atualize sem restrição; caso contrário, verifique se o registro pertence ao usuário
    if (req.user.role === 'gestor') {
      query = 'UPDATE opportunities SET stage=$1 WHERE id=$2 RETURNING *';
      params = [stage.toLowerCase(), id];
    } else {
      query = 'UPDATE opportunities SET stage=$1 WHERE id=$2 AND user_id=$3 RETURNING *';
      params = [stage.toLowerCase(), id, req.user.id];
    }
    const result = await db.query(query, params);
    if (result.rows.length === 0) {
      return next(new ErrorResponse('Opportunity not found or not authorized', 404));
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating opportunity:', error);
    next(new ErrorResponse('Error updating opportunity', 500));
  }
};

// Deleta uma oportunidade - somente gestores podem deletar
exports.deleteOpportunity = async (req, res, next) => {
  const { id } = req.params;
  
  // Verifica se o usuário tem papel de gestor
  if (req.user.role !== 'gestor') {
    return next(new ErrorResponse('Not authorized to delete opportunity', 403));
  }

  try {
    const result = await db.query(
      'DELETE FROM opportunities WHERE id = $1 RETURNING *',
      [id]
    );
    if (result.rows.length === 0) {
      return next(new ErrorResponse('Opportunity not found', 404));
    }
    res.json({ message: 'Opportunity deleted successfully' });
  } catch (error) {
    next(new ErrorResponse('Error deleting opportunity', 500));
  }
};
