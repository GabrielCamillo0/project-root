const db = require('../config/database');
const ErrorResponse = require('../utils/ErrorResponse');

// Gera um relatório do dashboard com métricas essenciais para todos os usuários
exports.getDashboardReport = async (req, res, next) => {
  try {
    const contactsResult = await db.query('SELECT COUNT(*) FROM contacts');
    const opportunitiesResult = await db.query('SELECT COUNT(*) FROM opportunities');
    const tasksResult = await db.query('SELECT COUNT(*) FROM tasks');
    const communicationsResult = await db.query('SELECT COUNT(*) FROM communications');

    res.json({
      contactsCount: contactsResult.rows[0].count,
      opportunitiesCount: opportunitiesResult.rows[0].count,
      tasksCount: tasksResult.rows[0].count,
      communicationsCount: communicationsResult.rows[0].count
    });
  } catch (error) {
    next(new ErrorResponse('Error generating dashboard report', 500));
  }
};

exports.getSalesSummary = async (req, res, next) => {
  try {
    // Agrupa por usuário e mês (formata o mês como 'YYYY-MM')
    const result = await db.query(`
      SELECT 
        user_id, 
        to_char(DATE_TRUNC('month', finalized_at), 'YYYY-MM') as month,
        SUM(value) as total_value,
        COUNT(*) as opportunities_count
      FROM opportunities
      WHERE finalized = true
      GROUP BY user_id, month
      ORDER BY month DESC;
    `);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    next(new ErrorResponse('Error fetching sales summary', 500));
  }
};
