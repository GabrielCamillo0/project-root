// backend/src/routes/communicationRoutes.js
const express = require('express');
const { check } = require('express-validator');
const router = express.Router();
const communicationController = require('../controllers/communicationController');
const authMiddleware = require('../middlewares/auth');
const validateRequest = require('../middlewares/validate');

router.use(authMiddleware);

router.post(
  '/',
  [
    check('type', 'Type is required').not().isEmpty(),
    check('content', 'Content is required').not().isEmpty(),
    check('contact_id', 'Contact ID is required').not().isEmpty()
  ],
  validateRequest,
  communicationController.createCommunication
);

// Rota GET sem parâmetro: se o usuário for gestor, retorna todos; se não, exige contact_id via query string
router.get('/', communicationController.getCommunicationsByContact);

router.put(
  '/:id',
  [
    check('type', 'Type is required').not().isEmpty(),
    check('content', 'Content is required').not().isEmpty()
  ],
  validateRequest,
  communicationController.updateCommunication
);

router.delete('/:id', communicationController.deleteCommunication);

module.exports = router;
