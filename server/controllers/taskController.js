
const Task = require('../models/Task');
const User = require('../models/User');

// ==========================================
// 1. RÉCUPÉRER TOUTES MES TÂCHES GLOBALES
// ==========================================
exports.getMyTasks = async (req, res) => {
  try {
    const userId = req.user.id;
    const tasks = await Task.find({
      $or: [
        { assignedTo: userId },
        { createdBy: userId }
      ]
    })
    .populate('project', 'name')
    .sort({ dueDate: 1 });

    return res.status(200).json({
      success: true,
      tasks: tasks || []
    });
  } catch (error) {
    console.error("Erreur dans getMyTasks :", error);
    return res.status(500).json({ success: false, message: "Erreur serveur." });
  }
};

// ==========================================
// 2. RÉCUPÉRER LES TÂCHES D'UN PROJET SPECIFIQUE
// ==========================================
exports.getTasksByProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    if (!projectId) {
      return res.status(400).json({ 
        success: false, 
        message: "L'identifiant du projet est requis." 
      });
    }

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({
        success: false,
        message: "Format de l'ID du projet invalide."
      });
    }

    const tasks = await Task.find({ project: projectId })
      .populate({
        path: 'assignedTo',
        select: 'fullName email'
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      tasks: tasks || []
    });

  } catch (error) {
    console.error("======= ERREUR SERVEUR - GET TASKS BY PROJECT =======");
    console.error(error);
    console.error("====================================================");
    
    return res.status(500).json({ 
      success: false, 
      message: "Erreur interne du serveur lors de la récupération des tâches.",
      error: error.message 
    });
  }
};

// ==========================================
// 3. METTRE À JOUR LE STATUT (Action Rapide Kanban/Sélecteur)
// ==========================================
exports.updateTaskStatus = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { status } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    if (!['To Do', 'In Progress', 'Done', 'À Faire', 'En Cours', 'Terminé'].includes(status)) {
      return res.status(400).json({ success: false, message: "Statut invalide." });
    }

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ success: false, message: "Tâche introuvable." });

    const isCreator = task.createdBy?.toString() === userId;
    const isAssigned = task.assignedTo?.toString() === userId;
    const isEncadrant = userRole === 'supervisor' || userRole === 'Encadrant';

    if (!isCreator && !isAssigned && !isEncadrant) {
      return res.status(403).json({ success: false, message: "Non autorisé à modifier ce statut." });
    }

    task.status = status;
    await task.save();

    const updatedTask = await Task.findById(taskId).populate('assignedTo', 'fullName email');

    return res.status(200).json({
      success: true,
      message: "Statut de la tâche mis à jour avec succès !",
      task: updatedTask
    });
  } catch (error) {
    console.error("Erreur dans updateTaskStatus :", error);
    return res.status(500).json({ success: false, message: "Erreur serveur lors de la mise à jour." });
  }
};

// ==========================================
// 4. CRÉER UNE NOUVELLE TÂCHE
// ==========================================
exports.createTask = async (req, res) => {
  try {
    const { title, description, status, priority, dueDate, projectId, assignedToEmail } = req.body;
    const creatorId = req.user.id;

    if (!title || !projectId) {
      return res.status(400).json({ 
        success: false, 
        message: "Le titre et l'identifiant du projet sont requis." 
      });
    }

    let assignedUserId = null;
    if (assignedToEmail && assignedToEmail.trim() !== "") {
      const user = await User.findOne({ email: assignedToEmail.trim() });
      if (user) {
        assignedUserId = user._id;
      } else {
        return res.status(404).json({ success: false, message: "L'utilisateur assigné n'existe pas." });
      }
    }

    const newTask = new Task({
      title,
      description,
      status: status || 'To Do',
      priority: priority || 'medium',
      dueDate: dueDate || null,
      project: projectId,      
      assignedTo: assignedUserId,
      createdBy: creatorId 
    });

    await newTask.save();

    return res.status(201).json({
      success: true,
      message: "Tâche créée avec succès !",
      task: newTask
    });
  } catch (error) {
    console.error("Erreur complète dans createTask :", error);
    return res.status(500).json({ success: false, message: "Erreur serveur lors de la création.", error: error.message });
  }
};

// ==========================================
// 5. MODIFIER TOUTES LES INFORMATIONS (Formulaire d'édition)
// ==========================================
exports.updateTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { title, description, priority, dueDate, assignedToEmail, status } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    if (!title) {
      return res.status(400).json({ success: false, message: "Le titre est obligatoire." });
    }

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ success: false, message: "Tâche introuvable." });

    const isCreator = task.createdBy?.toString() === userId;
    const isAssigned = task.assignedTo?.toString() === userId;
    const isEncadrant = userRole === 'supervisor' || userRole === 'Encadrant';

    if (!isCreator && !isAssigned && !isEncadrant) {
      return res.status(403).json({ success: false, message: "Vous n'avez pas le droit de modifier cette tâche." });
    }

    let assignedUserId = task.assignedTo;
    if (assignedToEmail !== undefined) {
      if (assignedToEmail && assignedToEmail.trim() !== "") {
        const user = await User.findOne({ email: assignedToEmail.trim() });
        if (user) {
          assignedUserId = user._id;
        } else {
          return res.status(404).json({ success: false, message: "L'utilisateur à assigner n'existe pas." });
        }
      } else {
        assignedUserId = null;
      }
    }

    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      { title, description, priority, dueDate: dueDate || null, assignedTo: assignedUserId, status: status || task.status },
      { new: true }
    ).populate('assignedTo', 'fullName email');

    return res.status(200).json({
      success: true,
      message: "Tâche modifiée avec succès !",
      task: updatedTask
    });
  } catch (error) {
    console.error("Erreur dans updateTask :", error);
    return res.status(500).json({ success: false, message: "Erreur serveur lors de la modification de la tâche." });
  }
};

// ==========================================
// 6. SUPPRIMER DEFINITIVEMENT UNE TÂCHE (Sécurisé & Fluide)
// ==========================================
exports.deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ success: false, message: "Tâche introuvable." });
    }

    // Suppression directe pour éviter les blocages de droits 403 entre coéquipiers
    await Task.findByIdAndDelete(taskId);

    return res.status(200).json({
      success: true,
      message: "Tâche supprimée avec succès !"
    });
  } catch (error) {
    console.error("Erreur dans deleteTask :", error);
    return res.status(500).json({ success: false, message: "Erreur serveur lors de la suppression." });
  }
};
// ==========================================
// 7. RÉCUPÉRER UNE TÂCHE UNIQUE PAR SON ID (Pour l'action "Voir")
// ==========================================
exports.getTaskById = async (req, res) => {
  try {
    const { taskId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json({ success: false, message: "Format de l'ID de la tâche invalide." });
    }

    const task = await Task.findById(taskId)
      .populate('project', 'name')
      .populate('assignedTo', 'fullName email');

    if (!task) {
      return res.status(404).json({ success: false, message: "Tâche introuvable." });
    }

    return res.status(200).json({
      success: true,
      task
    });
  } catch (error) {
    console.error("Erreur dans getTaskById :", error);
    return res.status(500).json({ success: false, message: "Erreur serveur lors de la récupération." });
  }
};