const User = require('../models/User');
const Project = require('../models/Project');
const Task = require('../models/Task');
const bcrypt = require('bcryptjs');

exports.getSupervisorDashboardStats = async (req, res) => {
  try {
    const supervisorId = req.user.id;

    const projects = await Project.find({ supervisor: supervisorId }).select('_id');
    const projectIds = projects.map(p => p._id);

    // Calcul réel des compteurs à partir des tâches des projets du superviseur
    // (Fix: status enum dans ton modèle Task => To Do | In Progress | Done)
    // Mais on garde une normalisation plus robuste côté affichage.
    const userTasks = await Task.find({ project: { $in: projectIds } }).select('status project assignedTo').populate('assignedTo', 'fullName email');

    const normalizeStatus = (s) => (s || '').toString().trim().toLowerCase();

    const todoCount = userTasks.filter(t => {
      const st = normalizeStatus(t.status);
      return st === 'to do' || st === 'à faire' || st === 'todo';
    }).length;

    const inProgressCount = userTasks.filter(t => {
      const st = normalizeStatus(t.status);
      return st === 'in progress' || st === 'en cours' || st === 'in_progress';
    }).length;

    const doneCount = userTasks.filter(t => {
      const st = normalizeStatus(t.status);
      return st === 'done' || st === 'terminé' || st === 'termine' || st === 'done';
    }).length;

    const totalTasks = userTasks.length;


    const upcomingDeadlines = await Task.find({
      project: { $in: projectIds },
      status: { $nin: ['Done', 'Terminé', 'done'] },
      dueDate: { $ne: null }
    })
      .sort({ dueDate: 1 })
      .limit(3)
      .populate('project', 'name');

    return res.status(200).json({
      success: true,
      stats: {
        totalProjects: projectIds.length,
        totalTasks,
        todoCount,
        inProgressCount,
        doneCount,
        upcomingDeadlines
      }
    });

  } catch (error) {
    console.error('Erreur dans getSupervisorDashboardStats:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des statistiques encadrant.'
    });
  }
};


exports.updateSupervisorProfile = async (req, res) => {
  try {
    const supervisorId = req.user.id; // Extrait par l'authMiddleware
    const { fullName, email, currentPassword, newPassword } = req.body;


    // 1. Trouver l'utilisateur dans la base de données
    const user = await User.findById(supervisorId);
    if (!user) {
      return res.status(404).json({ success: false, message: "Utilisateur non trouvé." });
    }

    // 2. Si l'utilisateur souhaite changer de mot de passe
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ 
          success: false, 
          message: "Veuillez fournir votre mot de passe actuel pour le modifier." 
        });
      }

      // Vérification de l'ancien mot de passe
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: "Mot de passe actuel incorrect." });
      }

      // Hachage du nouveau mot de passe
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    // 3. Mise à jour des autres champs optionnels
    if (fullName) user.fullName = fullName;
    if (email) user.email = email;

    // Sauvegarde dans MongoDB
    await user.save();

    // Retourner l'utilisateur mis à jour (sans le mot de passe pour des raisons de sécurité)
    const updatedUser = {
      _id: user._id,
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role
    };

    return res.status(200).json({
      success: true,
      message: "Profil mis à jour avec succès !",
      user: updatedUser
    });

  } catch (error) {
    console.error("Erreur dans updateSupervisorProfile:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur lors de la mise à jour du profil.",
      error: error.message
    });
  }
};
exports.getSupervisorStudents = async (req, res) => {
  try {
    const supervisorId = req.user.id;

    const projects = await Project.find({ supervisor: supervisorId })
      .select('name members')
      .populate('members', 'fullName email')
      .lean();

    return res.status(200).json({
      success: true,
      projects
    });
  } catch (error) {
    console.error('Erreur dans getSupervisorStudents:', error);
    return res.status(500).json({
      success: false,
      message: 'Impossible de récupérer la liste des étudiants.',
      error: error.message
    });
  }
};

exports.getSupervisorProjects = async (req, res) => {
  try {
    const supervisorId = req.user.id;

    // On renvoie les projets dont l'encadrant est bien cet utilisateur.
    // Le front a besoin de: _id, name, description, progress, members, doneTasks, totalTasks, progressPercentage (selon vos composants).
    // Ici on renvoie un shape minimal cohérent.
    const projects = await Project.find({ supervisor: supervisorId })
      .select('_id name description members progressPercentage status')
      .populate('members', 'fullName email')
      .lean();

    const projectIds = (projects || []).map(p => p._id);

    // Calcul réel de totalTasks et doneTasks pour chaque projet
    const allProjectTasks = await Task.find({ project: { $in: projectIds } }).select('project status');
    const normalizeStatus = (s) => (s || '').toString().trim().toLowerCase();

    const statsByProjectId = allProjectTasks.reduce((acc, t) => {
      const pid = t.project?.toString();
      if (!pid) return acc;

      if (!acc[pid]) {
        acc[pid] = { doneTasks: 0, totalTasks: 0 };
      }

      acc[pid].totalTasks += 1;

      const st = normalizeStatus(t.status);
      if (st === 'done' || st === 'terminé' || st === 'termine') {
        acc[pid].doneTasks += 1;
      }

      return acc;
    }, {});

    const normalized = (projects || []).map(p => {
      const pid = p._id?.toString();
      const st = statsByProjectId[pid] || { doneTasks: 0, totalTasks: 0 };

      const progressPercentage = st.totalTasks > 0
        ? Math.round((st.doneTasks / st.totalTasks) * 100)
        : 0;

      return {
        _id: p._id,
        name: p.name,
        description: p.description,
        members: p.members || [],
        progress: progressPercentage,
        doneTasks: st.doneTasks,
        totalTasks: st.totalTasks
      };
    });



    console.log('[getSupervisorProjects] normalized (doneTasks/totalTasks):', normalized);

    return res.status(200).json({
      success: true,
      projects: normalized
    });

  } catch (error) {
    console.error('Erreur dans getSupervisorProjects:', error);
    return res.status(500).json({
      success: false,
      message: "Impossible de récupérer les projets superviseur.",
      error: error.message
    });
  }
};
exports.getProjectTasksForSupervisor = async (req, res) => {
  try {
    const { projectId } = req.params;

    // Récupérer toutes les tâches du projet et "populate" l'étudiant assigné
    const tasks = await Task.find({ project: projectId })
      .populate('assignedTo', 'fullName email')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      tasks
    });
  } catch (error) {
    console.error("Erreur dans getProjectTasksForSupervisor:", error);
    return res.status(500).json({
      success: false,
      message: "Impossible de récupérer les tâches de ce projet.",
      error: error.message
    });
  }
};