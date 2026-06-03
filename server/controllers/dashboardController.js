const Project = require('../models/Project');
const Task = require('../models/Task');

exports.getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id; // Injecté par authMiddleware

    // 1. Récupérer TOUTES les tâches assignées à cet utilisateur
    const userTasks = await Task.find({ assignedTo: userId });

    // 2. Extraire proprement les IDs uniques des projets liés à tes tâches
    const projectIdsWithMyTasks = userTasks
      .map(t => t.project ? t.project.toString() : (t.projectId ? t.projectId.toString() : null))
      .filter(Boolean);

    // 3. Trouver et compter les projets (Superviseur, Membre OU contenant une de tes tâches)
    const totalProjects = await Project.countDocuments({
      $or: [
        { supervisor: userId },
        { members: userId },
        { _id: { $in: projectIdsWithMyTasks } } // 🔥 Inclus le projet même si tu n'es pas encore officiellement dans l'onglet Membres !
      ]
    });

    // 4. Calcul des compteurs précis (Insensible aux casses ou espaces)
    const todoCount = userTasks.filter(t => t.status?.trim() === 'To Do' || t.status?.trim() === 'À Faire').length;
    const inProgressCount = userTasks.filter(t => t.status?.trim() === 'In Progress' || t.status?.trim() === 'En Cours').length;
    const doneCount = userTasks.filter(t => t.status?.trim() === 'Done' || t.status?.trim() === 'Terminé').length;
    const totalTasks = userTasks.length;

    // 5. Récupérer les 3 prochaines deadlines (Non terminées)
    const upcomingDeadlines = await Task.find({
      assignedTo: userId,
      status: { $nin: ['Done', 'Terminé'] },
      dueDate: { $ne: null }
    })
    .sort({ dueDate: 1 })
    .limit(3)
    .populate('project', 'name');

    // 🔍 Log de contrôle pour ton terminal Node
    console.log(`[Dashboard] ${totalProjects} projet(s) actif(s) et ${totalTasks} tâche(s) pour l'utilisateur ${userId}`);

    return res.status(200).json({
      success: true,
      stats: {
        totalProjects,
        totalTasks,
        todoCount,
        inProgressCount,
        doneCount,
        upcomingDeadlines
      }
    });

  } catch (error) {
    console.error("Erreur dans getDashboardStats :", error);
    return res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la récupération des statistiques."
    });
  }
};