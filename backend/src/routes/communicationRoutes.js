// backend/src/routes/communicationRoutes.js
const express = require('express');
const router = express.Router();
const communicationController = require('../controllers/communicationController');
const authMiddleware = require('../middlewares/auth');

// Aplica o middleware de autenticação a todas as rotas
router.use(authMiddleware);

// Rotas de comunicações para todos os usuários
router.get('/', communicationController.getCommunications);
router.post('/', communicationController.createCommunication);
router.put('/:id', communicationController.updateCommunication);
router.delete('/:id', communicationController.deleteCommunication);

module.exports = router;
