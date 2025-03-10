// backend/src/routes/accountRoutes.js
const express = require('express');
const { check } = require('express-validator');
const router = express.Router();
const accountController = require('../controllers/accountController');
const authMiddleware = require('../middlewares/auth');
const validateRequest = require('../middlewares/validate');

router.use(authMiddleware);

router.post(
  '/',
  [check('name', 'Account name is required').not().isEmpty()],
  validateRequest,
  accountController.createAccount
);

router.get('/', accountController.getAccounts);

router.put(
  '/:id',
  [
    check('name', 'Account name is required').optional().not().isEmpty(),
    // Industry e website podem ser opcionais
  ],
  validateRequest,
  accountController.updateAccount
);

router.delete('/:id', accountController.deleteAccount);

module.exports = router;
