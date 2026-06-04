const express = require('express');
const router = express.Router();
const supervisorController = require('../controllers/supervisorController');
const { authMiddleware } = require('../middlewares/authMiddleware');

// Toutes ces routes seront préfixées par /api/supervisor dans server.js
router.get('/my-projects', authMiddleware, supervisorController.getMySupervisedProjects);

module.exports = router;