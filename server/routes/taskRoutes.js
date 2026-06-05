const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const authMiddleware = require('../middlewares/authMiddleware'); // Ton middleware d'authentification

// Toutes les routes nécessitent d'être connecté
router.use(authMiddleware);


// Routes Globales et Projets
router.get('/my-tasks', taskController.getMyTasks);
router.get('/project/:projectId', taskController.getTasksByProject);
router.post('/create', taskController.createTask);

// Routes spécifiques à une tâche (Voir, Modifier, Statut, Supprimer)
router.get('/:taskId', taskController.getTaskById);          // 👁️ Pour l'action "Voir"
router.put('/:taskId', taskController.updateTask);          // 📝 Pour l'action "Modifier" (Formulaire complet)
router.patch('/:taskId/status', taskController.updateTaskStatus); // ⚡ Pour le changement de statut rapide
router.delete('/:taskId', taskController.deleteTask);       // 🗑️ Pour l'action "Supprimer"

module.exports = router;