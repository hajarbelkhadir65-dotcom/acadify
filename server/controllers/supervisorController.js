const Project = require('../models/Project');

exports.getMySupervisedProjects = async (req, res) => {
  try {
    const projects = await Project.find({ supervisor: req.user.id })
      .populate('members', 'fullName email');
    res.json({ success: true, projects });
  } catch (error) {
    console.error("Erreur serveur (Supervisor) :", error);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};