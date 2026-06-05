const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const studentController = require('../controllers/studentController');

// Mise à jour du profil étudiant
router.put('/profile', authMiddleware, studentController.updateStudentProfile);

module.exports = router;

