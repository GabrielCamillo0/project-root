const db = require('../config/database');
const ErrorResponse = require('../utils/ErrorResponse');

// Cria uma nova oportunidade
exports.createOpportunity = async (req, res, next) => {
  const { title, value, stage, contact_id, description } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO opportunities (title, value, stage, contact_id, description, user_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [title, value, stage || 'new', contact_id, description, req.user.id]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(new ErrorResponse('Error creating opportunity', 500));
  }
};

// Lista oportunidades do usuário ou de todos (para gestor)
// Atualização do endpoint GET de oportunidades para não retornar as finalizadas
exports.getOpportunities = async (req, res, next) => {
  try {
    let query;
    let params;
    if (req.user.role === 'gestor') {
      // Gestores veem todas as oportunidades não finalizadas
      query = 'SELECT * FROM opportunities WHERE finalized != true';
      params = [];
    } else {
      // Vendedores veem apenas suas próprias oportunidades não finalizadas
      query = 'SELECT * FROM opportunities WHERE user_id = $1 AND finalized != true';
      params = [req.user.id];
    }
    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    next(new ErrorResponse('Error fetching opportunities', 500));
  }
};

exports.updateOpportunityStage = async (req, res, next) => {
  const { id } = req.params;
  const { stage } = req.body;
  try {
    let query, params;
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
    console.error('Error updating opportunity stage:', error);
    next(new ErrorResponse('Error updating opportunity stage', 500));
  }
};

// Novo Endpoint: Atualiza os parâmetros completos da oportunidade
// Esse endpoint será chamado pelo botão "Edit" no frontend
exports.updateOpportunityParameters = async (req, res, next) => {
  const { id } = req.params;
  const { title, value, stage, contact_id, description } = req.body;
  try {
    let query, params;
    if (req.user.role === 'gestor') {
      query = 'UPDATE opportunities SET title=$1, value=$2, stage=$3, contact_id=$4, description=$5 WHERE id=$6 RETURNING *';
      params = [title, value, stage.toLowerCase(), contact_id, description, id];
    } else {
      query = 'UPDATE opportunities SET title=$1, value=$2, stage=$3, contact_id=$4, description=$5 WHERE id=$6 AND user_id=$7 RETURNING *';
      params = [title, value, stage.toLowerCase(), contact_id, description, id, req.user.id];
    }
    const result = await db.query(query, params);
    if (result.rows.length === 0) {
      return next(new ErrorResponse('Opportunity not found or not authorized', 404));
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating opportunity parameters:', error);
    next(new ErrorResponse('Error updating opportunity parameters', 500));
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

// Novo Endpoint: Finaliza uma oportunidade e registra a receita
exports.finalizeOpportunity = async (req, res, next) => {
  const { id } = req.params;
  try {
    // Recupera a oportunidade pelo ID
    const opportunityRes = await db.query(
      "SELECT * FROM opportunities WHERE id = $1",
      [id]
    );
    if (opportunityRes.rows.length === 0) {
      return next(new ErrorResponse("Opportunity not found", 404));
    }
    const opportunity = opportunityRes.rows[0];

    // Verifica se o estágio é "closed"
    if (opportunity.stage.toLowerCase() !== "closed") {
      return next(new ErrorResponse("Opportunity must be closed before finalizing", 400));
    }

    // Verifica se já foi finalizada
    if (opportunity.finalized) {
      return next(new ErrorResponse("Opportunity already finalized", 400));
    }

    // Atualiza a oportunidade para finalizada e define o timestamp
    const updateRes = await db.query(
      "UPDATE opportunities SET finalized = true, finalized_at = NOW() WHERE id = $1 RETURNING *",
      [id]
    );
    const finalizedOpportunity = updateRes.rows[0];

    const insertRes = await db.query(
      "INSERT INTO receita (opportunity_id, vendedor_id, opportunity_title, opportunity_description, opportunity_value, finalized_at) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [
        finalizedOpportunity.id,
        finalizedOpportunity.user_id,
        finalizedOpportunity.title,
        finalizedOpportunity.description || '',
        finalizedOpportunity.value,
        finalizedOpportunity.finalized_at
      ]
    );

    res.json({ opportunity: finalizedOpportunity, receita: insertRes.rows[0] });
  } catch (error) {
    console.error("Error finalizing opportunity:", error);
    next(new ErrorResponse("Error finalizing opportunity", 500));
  }
};
