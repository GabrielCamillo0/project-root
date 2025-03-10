const express = require('express');
const router = express.Router();
const reportsController = require('../controllers/reportsController');
const authMiddleware = require('../middlewares/auth');

router.use(authMiddleware);

router.get('/dashboard', reportsController.getDashboardReport);

module.exports = router;
