const db = require('../config/database');
const ErrorResponse = require('../utils/ErrorResponse');

// Gera um relatório do dashboard com métricas essenciais
exports.getDashboardReport = async (req, res, next) => {
  try {
    // Se o usuário for gestor, agregamos de todos; caso contrário, apenas dados do usuário
    const userCondition = req.user.role === 'gestor' ? '' : 'WHERE user_id = $1';
    const params = req.user.role === 'gestor' ? [] : [req.user.id];

    const contactsResult = await db.query(
      `SELECT COUNT(*) FROM contacts ${userCondition}`,
      params
    );
    const opportunitiesResult = await db.query(
      `SELECT COUNT(*) FROM opportunities ${userCondition}`,
      params
    );
    const tasksResult = await db.query(
      `SELECT COUNT(*) FROM tasks ${userCondition}`,
      params
    );
    const communicationsResult = await db.query(
      `SELECT COUNT(*) FROM communications ${userCondition}`,
      params
    );

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
