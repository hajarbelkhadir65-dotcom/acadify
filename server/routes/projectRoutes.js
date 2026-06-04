const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const { authMiddleware } = require('../middlewares/authMiddleware');

// 1. Routes avec des chemins fixes
router.get('/my-projects/teams', authMiddleware, projectController.getMyProjectsTeams);

// 2. ROUTES SPÉCIFIQUES (Priorité absolue)
// Cette route doit être déclarée avant les routes avec /:id
console.log("Chargement de la route DELETE : /:projectId/members/:memberId");
router.delete('/:projectId/members/:memberId', authMiddleware, projectController.removeProjectMember);
router.get('/:projectId/members', authMiddleware, projectController.getProjectMembers);
router.post('/:projectId/members/add', authMiddleware, projectController.addProjectMember);

// 3. ROUTES GÉNÉRIQUES (Utilisant /:id)
router.get('/:id', projectController.getProjectById); 
router.put('/:id', projectController.updateProject); 
router.delete('/:id', projectController.deleteProject);

// 4. Routes de base
router.get('/', projectController.getProjects);
router.post('/', projectController.createProject);

module.exports = router;