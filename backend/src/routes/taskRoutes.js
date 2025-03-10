// backend/src/routes/taskRoutes.js
const express = require('express');
const { check } = require('express-validator');
const router = express.Router();
const taskController = require('../controllers/taskController');
const authMiddleware = require('../middlewares/auth');
const validateRequest = require('../middlewares/validate');

router.use(authMiddleware);

router.post(
  '/',
  [
    check('title', 'Title is required').not().isEmpty(),
    check('due_date', 'Due date must be a valid date').optional().isISO8601()
  ],
  validateRequest,
  taskController.createTask
);

router.put(
  '/:id',
  [
    check('title', 'Title is required').optional().not().isEmpty(),
    check('due_date', 'Due date must be a valid date').optional().isISO8601()
  ],
  validateRequest,
  taskController.updateTask
);

router.delete('/:id', taskController.deleteTask);

router.get('/', taskController.getTasks);

router.post(
  '/follow-up',
  [
    check('contact_id', 'Contact ID is required').not().isEmpty(),
    check('description', 'Description is required').not().isEmpty()
  ],
  validateRequest,
  taskController.createFollowUpTask
);

module.exports = router;
