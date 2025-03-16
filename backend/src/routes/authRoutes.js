const express = require('express');
const { check } = require('express-validator');
const router = express.Router();
const authController = require('../controllers/authController');
const validateRequest = require('../middlewares/validate');
const authMiddleware = require('../middlewares/auth');

router.post(
  '/register',
  [
    check('username', 'Username is required').not().isEmpty(),
    check('password', 'Password must be at least 6 characters').isLength({ min: 6 })
  ],
  validateRequest,
  authController.register
);

router.post(
  '/login',
  [
    check('username', 'Username is required').not().isEmpty(),
    check('password', 'Password is required').not().isEmpty()
  ],
  validateRequest,
  authController.login
);

router.get('/users', authMiddleware, authController.getUsers);

module.exports = router;
