const express = require('express');
const { check } = require('express-validator');
const router = express.Router();
const opportunityController = require('../controllers/opportunityController');
const protect = require('../middlewares/auth'); // Desestruturando para obter a função protect
const validateRequest = require('../middlewares/validate');

router.use(protect);

router.post(
  '/',
  [
    check('title', 'Title is required').not().isEmpty(),
    check('value', 'Value is required and must be a number').isNumeric(),
    check('stage', 'Stage is required').not().isEmpty(),
    check('contact_id', 'Contact ID is required').not().isEmpty(),
    // description é opcional
  ],
  validateRequest,
  opportunityController.createOpportunity
);

router.get('/', opportunityController.getOpportunities);

// Endpoint que atualiza apenas o stage (usado pelo drag & drop)
router.route('/:id')
  .put(opportunityController.updateOpportunityStage)
  .delete(opportunityController.deleteOpportunity);

// Endpoint que atualiza os demais parâmetros (usado pelo botão "Edit")
router.route('/:id/parameters')
  .put(opportunityController.updateOpportunityParameters);

// Endpoint para finalizar a oportunidade
router.put('/:id/finalize', opportunityController.finalizeOpportunity);

module.exports = router;
