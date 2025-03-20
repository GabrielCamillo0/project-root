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

    // Insere um registro na tabela "receita"
    // Note que estamos utilizando:
    // - opportunity_id: o ID da oportunidade finalizada
    // - vendedor_id: o ID do usuário (vendedor) que criou a oportunidade
    // - opportunity_title: o título da oportunidade
    // - opportunity_description: a descrição (ou string vazia, se não existir)
    // - opportunity_value: o valor da oportunidade
    // - finalized_at: o timestamp de finalização
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

