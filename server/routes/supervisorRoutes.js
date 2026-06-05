const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const supervisorController = require('../controllers/supervisorController');

// Route des stats globales
router.get('/dashboard', authMiddleware, supervisorController.getSupervisorDashboardStats);

// Liste dynamique des projets de l'encadrant
router.get('/projects', authMiddleware, supervisorController.getSupervisorProjects);
// Mise à jour du profil de l'encadrant
router.put('/profile', authMiddleware, supervisorController.updateSupervisorProfile);
// Liste dynamique des étudiants par projet
router.get('/students', authMiddleware, supervisorController.getSupervisorStudents);
// 🚀 NOUVELLE ROUTE : Récupérer les tâches d'un projet spécifique pour l'inspecter
router.get('/projects/:projectId/tasks', authMiddleware, supervisorController.getProjectTasksForSupervisor);

module.exports = router;
