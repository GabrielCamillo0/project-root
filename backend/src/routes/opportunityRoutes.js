const express = require('express');
const { check } = require('express-validator');
const router = express.Router();
const opportunityController = require('../controllers/opportunityController');
const authMiddleware = require('../middlewares/auth');
const validateRequest = require('../middlewares/validate');

// Middleware para verificar se o usuário é gestor
const isGestor = (req, res, next) => {
  if (req.user.role !== 'gestor') {
    return res.status(403).json({ error: 'Not authorized to delete opportunity' });
  }
  next();
};

router.use(authMiddleware);

router.post(
  '/',
  [
    check('title', 'Title is required').not().isEmpty(),
    check('value', 'Value is required and must be a number').isNumeric(),
    check('contact_id', 'Contact ID is required').not().isEmpty()
  ],
  validateRequest,
  opportunityController.createOpportunity
);

router.get('/', opportunityController.getOpportunities);

router.put(
  '/:id',
  [
    check('stage', 'Stage is required').not().isEmpty()
  ],
  validateRequest,
  opportunityController.updateOpportunity
);

// Deletar oportunidade (apenas para gestores)
router.delete('/:id', isGestor, opportunityController.deleteOpportunity);

router.put('/:id/finalize', opportunityController.finalizeOpportunity);

module.exports = router;