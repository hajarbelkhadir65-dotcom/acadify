const Project = require('../models/Project');
const User = require('../models/User');
const mongoose = require('mongoose');

// ==========================================
// 🟢 1. RÉCUPÉRER TOUS LES PROJETS (GET)
// ==========================================
exports.getProjects = async (req, res) => {
  try {
    // Le .populate transforme les IDs stockés en objets contenant le fullName et l'email
    const projects = await Project.find()
      .populate('supervisor', 'fullName email role') 
      .populate('members', 'fullName email role')
      .populate('creator', 'fullName email')
      .sort({ createdAt: -1 }); // Les plus récents en premier

    res.json({ success: true, projects });
  } catch (error) {
    console.error("❌ Erreur dans GET /api/projects :", error);
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération des projets.' });
  }
};

// ==========================================
// 🟢 2. CRÉER UN NOUVEAU PROJET (POST)
// ==========================================
exports.createProject = async (req, res) => {
  try {
    const { name, description, startDate, endDate, supervisorEmail, members } = req.body;

    // 🧪 LOGS DE VÉRIFICATION TERMINAL
    console.log("=== 📥 NOUVELLE REQUÊTE DE CRÉATION DE PROJET ===");
    console.log("Nom du projet :", name);
    console.log("Email de l'encadrant reçu :", supervisorEmail);
    console.log("Tableau des emails membres reçu :", members);

    // Validation de sécurité de base
    if (!name || !description || !supervisorEmail) {
      return res.status(400).json({ 
        success: false, 
        message: "Le nom, la description et l'email de l'encadrant sont obligatoires." 
      });
    }

    // A. Recherche du professeur (Insensible aux majuscules/minuscules grâce à la RegExp)
    const teacher = await User.findOne({ email: new RegExp(`^${supervisorEmail.trim()}$`, 'i') });
    
    if (!teacher) {
      console.log(`❌ Échec : L'encadrant "${supervisorEmail}" n'existe pas en BDD.`);
      return res.status(400).json({ 
        success: false, 
        message: `L'email de l'encadrant (${supervisorEmail}) n'existe pas dans l'application. Veuillez créer son compte d'abord.` 
      });
    }
    console.log(`👨‍🏫 Encadrant trouvé en BDD : ${teacher.fullName} (ID: ${teacher._id})`);

    // B. Recherche des membres étudiants (Insensible à la casse également)
    let memberIds = [];
    if (members && members.length > 0) {
      // On crée une liste de RegExp pour ignorer les majuscules mal tapées ou stockées
      const emailRegexList = members.map(email => new RegExp(`^${email.trim()}$`, 'i'));
      
      const studentsFound = await User.find({ email: { $in: emailRegexList } });
      memberIds = studentsFound.map(student => student._id);
      
      console.log(`👥 Membres correspondants trouvés en BDD (${studentsFound.length}/${members.length}) :`, memberIds);
    }

    // C. Identification du créateur du projet
    // req.user.id provient de ton middleware d'authentification (si actif)
    let creatorId = req.user?.id;
    if (!creatorId) {
      console.log("⚠️ Code de secours : Aucun req.user.id trouvé (Vérifie ton Auth Middleware). Utilisation de l'ID de l'encadrant.");
      creatorId = teacher._id; 
    }

    // D. Construction et sauvegarde du projet
    const newProject = new Project({
      name,
      description,
      startDate,
      endDate,
      supervisor: teacher._id, // Insertion de l'ID valide trouvé
      members: memberIds,      // Insertion du tableau d'IDs valides trouvés
      creator: creatorId,
      status: 'En cours',
      progressPercentage: 0
    });

    await newProject.save();
    console.log("✅ Projet inséré avec succès dans MongoDB !");

    // E. POPULATE IMMEDIAT : On recharge le projet fraîchement créé pour y injecter les noms 
    // afin que le premier rendu sur React affiche directement les textes au lieu des IDs bruts.
    const populatedProject = await Project.findById(newProject._id)
      .populate('supervisor', 'fullName email')
      .populate('members', 'fullName email')
      .populate('creator', 'fullName email');

    // Réponse de succès envoyée au frontend
    res.status(201).json({ 
      success: true, 
      message: "Projet académique créé avec succès !", 
      project: populatedProject 
    });

  } catch (error) {
    console.error("💥 Erreur critique lors de la création :", error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur interne du serveur lors de la création du projet.',
      error: error.message 
    });
  }
};
// 🟢 3. RÉCUPÉRER UN SEUL PROJET (GET BY ID - Pour la page Détails)
exports.getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findById(id)
      .populate('supervisor', 'fullName email')
      .populate('members', 'fullName email')
      .populate('creator', 'fullName email');

    if (!project) {
      return res.status(404).json({ success: false, message: "Projet introuvable." });
    }

    res.json({ success: true, project });
  } catch (error) {
    console.error("Erreur GET project id:", error);
    res.status(500).json({ success: false, message: "Erreur serveur." });
  }
};
// 🟢 4. MODIFIER UN PROJET COMPLET (PUT)
exports.updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, startDate, endDate, status, supervisorEmail, members } = req.body;

    // 1. Re-vérifier l'encadrant via son email si fourni
    let supervisorId;
    if (supervisorEmail) {
      const teacher = await User.findOne({ email: new RegExp(`^${supervisorEmail.trim()}$`, 'i') });
      if (!teacher) {
        return res.status(400).json({ 
          success: false, 
          message: `L'email de l'encadrant (${supervisorEmail}) n'existe pas.` 
        });
      }
      supervisorId = teacher._id;
    }

    // 2. Re-vérifier les membres via leurs emails si fournis
    let memberIds;
    if (members && members.length > 0) {
      const emailRegexList = members.map(email => new RegExp(`^${email.trim()}$`, 'i'));
      const studentsFound = await User.find({ email: { $in: emailRegexList } });
      memberIds = studentsFound.map(student => student._id);
    }

    // 3. Préparer l'objet de mise à jour (sans toucher à progressPercentage qui sera auto)
    const updateData = {
      name,
      description,
      startDate,
      endDate,
      status
    };

    if (supervisorId) updateData.supervisor = supervisorId;
    if (memberIds) updateData.members = memberIds;

    const updatedProject = await Project.findByIdAndUpdate(id, updateData, { new: true })
      .populate('supervisor', 'fullName email')
      .populate('members', 'fullName email');

    if (!updatedProject) {
      return res.status(404).json({ success: false, message: "Projet introuvable." });
    }

    res.json({ success: true, message: "Projet mis à jour avec succès !", project: updatedProject });
  } catch (error) {
    console.error("Erreur PUT project:", error);
    res.status(500).json({ success: false, message: "Erreur lors de la modification." });
  }
};

// 🟢 5. SUPPRIMER UN PROJET (DELETE)
exports.deleteProject = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedProject = await Project.findByIdAndDelete(id);

    if (!deletedProject) {
      return res.status(404).json({ success: false, message: "Projet introuvable." });
    }

    // [Optionnel] Si tu veux aussi supprimer toutes les tâches liées à ce projet :
    // const Task = require('../models/Task');
    // await Task.deleteMany({ project: id });

    res.json({ success: true, message: "Projet supprimé avec succès !" });
  } catch (error) {
    console.error("Erreur DELETE project:", error);
    res.status(500).json({ success: false, message: "Erreur lors de la suppression." });
  }
};
