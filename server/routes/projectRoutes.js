const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');

// Définition des routes (Le préfixe global sera géré dans index.js)
router.get('/', projectController.getProjects);
router.post('/', projectController.createProject);
router.get('/:id', projectController.getProjectById);   // 👈 Nouvelle route Détail
router.put('/:id', projectController.updateProject);     // 👈 Nouvelle route Modifier
router.delete('/:id', projectController.deleteProject);  // 👈 Nouvelle route Supprimer
module.exports = router;