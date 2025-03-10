// backend/src/routes/contactRoutes.js
const express = require('express');
const { check } = require('express-validator');
const router = express.Router();
const contactController = require('../controllers/contactController');
const authMiddleware = require('../middlewares/auth');
const validateRequest = require('../middlewares/validate');

router.use(authMiddleware);

router.post(
  '/',
  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Valid email is required').isEmail()
  ],
  validateRequest,
  contactController.createContact
);

router.get('/', contactController.getContacts);

router.put(
  '/:id',
  [
    check('name', 'Name is required').optional().not().isEmpty(),
    check('email', 'Valid email is required').optional().isEmail()
  ],
  validateRequest,
  contactController.updateContact
);

router.put(
  '/:id/lead-score',
  [check('lead_score', 'Lead score must be an integer').isInt()],
  validateRequest,
  contactController.updateLeadScore
);

router.delete('/:id', contactController.deleteContact);

module.exports = router;
