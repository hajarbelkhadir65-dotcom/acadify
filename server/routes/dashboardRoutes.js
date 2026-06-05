const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const authMiddleware = require('../middlewares/authMiddleware');

// Route d'accès aux statistiques du dashboard
router.get('/stats', authMiddleware, dashboardController.getDashboardStats);

module.exports = router;