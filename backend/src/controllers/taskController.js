// backend/src/controllers/taskController.js
const db = require('../config/database');
const ErrorResponse = require('../utils/ErrorResponse');

// Cria uma nova tarefa (não follow-up)
exports.createTask = async (req, res, next) => {
  const { title, description, due_date, status } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO tasks (title, description, due_date, status, user_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [title, description, due_date, status || 'pending', req.user.id]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(new ErrorResponse('Error creating task', 500));
  }
};

// Atualiza uma tarefa – permite que gestores atualizem qualquer tarefa
exports.updateTask = async (req, res, next) => {
  const { id } = req.params;
  const { title, description, due_date, status } = req.body;
  try {
    let query;
    let params;
    if (req.user.role === 'gestor') {
      query = 'UPDATE tasks SET title = $1, description = $2, due_date = $3, status = $4 WHERE id = $5 RETURNING *';
      params = [title, description, due_date, status, id];
    } else {
      query = 'UPDATE tasks SET title = $1, description = $2, due_date = $3, status = $4 WHERE id = $5 AND user_id = $6 RETURNING *';
      params = [title, description, due_date, status, id, req.user.id];
    }
    const result = await db.query(query, params);
    if (result.rows.length === 0) {
      return next(new ErrorResponse('Task not found or not authorized', 404));
    }
    res.json(result.rows[0]);
  } catch (error) {
    next(new ErrorResponse('Error updating task', 500));
  }
};

// Deleta uma tarefa – permite que gestores deletem qualquer tarefa
exports.deleteTask = async (req, res, next) => {
  const { id } = req.params;
  try {
    let query;
    let params;
    if (req.user.role === 'gestor') {
      query = 'DELETE FROM tasks WHERE id = $1 RETURNING *';
      params = [id];
    } else {
      query = 'DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING *';
      params = [id, req.user.id];
    }
    const result = await db.query(query, params);
    if (result.rows.length === 0) {
      return next(new ErrorResponse('Task not found or not authorized', 404));
    }
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    next(new ErrorResponse('Error deleting task', 500));
  }
};

// Cria uma tarefa de follow-up automaticamente
exports.createFollowUpTask = async (req, res, next) => {
  const { contact_id, description } = req.body;
  try {
    const title = 'Follow-up Task';
    const due_date = new Date();
    due_date.setDate(due_date.getDate() + 1); // define para amanhã
    const result = await db.query(
      'INSERT INTO tasks (title, description, due_date, status, user_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [title, description, due_date, 'pending', req.user.id]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(new ErrorResponse('Error creating follow-up task', 500));
  }
};

// Lista todas as tarefas – gestores veem todas, outros apenas as próprias
exports.getTasks = async (req, res, next) => {
  try {
    let query = 'SELECT * FROM tasks WHERE user_id = $1';
    let params = [req.user.id];
    if (req.user.role === 'gestor') {
      query = 'SELECT * FROM tasks';
      params = [];
    }
    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    next(new ErrorResponse('Error fetching tasks', 500));
  }
};
