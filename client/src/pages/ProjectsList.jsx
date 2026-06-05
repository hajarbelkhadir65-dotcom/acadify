import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, X, FolderGit2, Calendar, User, Mail, Users, Trash2, Edit3, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProjectsList({ onSelectProject }) {
  const [projects, setProjects] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  
  // États du formulaire
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [supervisorEmail, setSupervisorEmail] = useState(''); 
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState('En cours');
  
  // Gestion des membres par email
  const [memberInput, setMemberInput] = useState('');
  const [membersList, setMembersList] = useState([]);

  // 🚀 Utilitaire pour formater les dates au format YYYY-MM-DD exigé par l'input HTML5
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    // Extrait uniquement la partie YYYY-MM-DD au cas où la BDD renvoie une date ISO complète
    return dateString.substring(0, 10);
  };

  // Charger les projets de l'utilisateur avec le Token JWT
  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem('token'); 
      const response = await axios.get('http://localhost:5000/api/projects', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setProjects(response.data.projects);
      }
    } catch (error) {
      console.error("Erreur de chargement des projets :", error);
      toast.error("Impossible de charger les projets");
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // Supprimer un projet académique
  const handleDeleteProject = async (id) => {
    if (window.confirm("Voulez-vous vraiment supprimer ce projet ? Tout l'historique sera effacé.")) {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.delete(`http://localhost:5000/api/projects/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data.success) {
          toast.success("Projet supprimé avec succès !");
          fetchProjects();
        }
      } catch (error) {
        toast.error(error.response?.data?.message || "Erreur lors de la suppression");
      }
    }
  };

  // Ouvrir le modal d'édition pré-rempli
  const openEditModal = (project) => {
    setSelectedProject(project);
    setName(project.name);
    setDescription(project.description);
    
    // 💡 Correction : Nettoyage et formatage des dates pour les afficher dans les inputs
    setStartDate(formatDateForInput(project.startDate));
    setEndDate(formatDateForInput(project.endDate));
    
    setStatus(project.status || 'En cours');
    setSupervisorEmail(project.supervisor?.email || typeof project.supervisor === 'string' ? project.supervisor : '');
    
    // Extraction des emails des membres
    const currentMembersEmails = project.members?.map(m => typeof m === 'object' ? m.email : m).filter(Boolean) || [];
    setMembersList(currentMembersEmails);
    
    setMemberInput('');
    setIsEditModalOpen(true);
  };

  // Soumettre les modifications au serveur (PUT)
  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    
    let finalMembersList = [...membersList];
    const emailInInput = memberInput.trim().toLowerCase();
    if (emailInInput && emailInInput.includes('@') && !finalMembersList.includes(emailInInput)) {
      finalMembersList.push(emailInInput);
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`http://localhost:5000/api/projects/${selectedProject._id}`, {
        name,
        description,
        startDate,
        endDate,
        status,
        supervisorEmail,
        members: finalMembersList
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        toast.success("Projet mis à jour !");
        setIsEditModalOpen(false);
        fetchProjects();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Échec de la modification");
    }
  };

  // Ajouter un email de membre à la liste locale
  const handleAddMember = (e) => {
    e.preventDefault();
    const email = memberInput.trim().toLowerCase();
    if (!email) return;
    
    if (!email.includes('@')) {
      toast.error("Veuillez saisir un email valide");
      return;
    }

    if (membersList.includes(email)) {
      toast.error("Cet email est déjà ajouté");
      return;
    }

    setMembersList([...membersList, email]);
    setMemberInput('');
  };

  const handleRemoveMember = (emailToRemove) => {
    setMembersList(membersList.filter(email => email !== emailToRemove));
  };

  // Soumettre le formulaire de création
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    let finalMembersList = [...membersList];
    const emailInInput = memberInput.trim().toLowerCase();

    if (emailInInput && emailInInput.includes('@') && !finalMembersList.includes(emailInInput)) {
      finalMembersList.push(emailInInput);
    }
    
    if (finalMembersList.length === 0) {
      toast.error("Veuillez ajouter au moins un membre à l'équipe");
      return;
    }

    try {
      const token = localStorage.getItem('token'); 
      const response = await axios.post('http://localhost:5000/api/projects', {
        name,
        description,
        supervisorEmail,
        startDate,
        endDate,
        members: finalMembersList
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        toast.success('Projet créé avec succès !');
        setIsModalOpen(false);
        
        // Réinitialiser les champs
        setName(''); 
        setDescription(''); 
        setSupervisorEmail(''); 
        setStartDate(''); 
        setEndDate('');
        setMembersList([]);
        setMemberInput('');
        
        fetchProjects();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Échec de la création du projet');
    }
  };

  const formatStatus = (status) => {
    if (!status) return 'En cours';
    switch (status.toLowerCase()) {
      case 'in progress': case 'en cours': return 'En cours';
      case 'completed': case 'terminé': return 'Terminé';
      case 'en attente': return 'En attente';
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* Entête */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-extrabold tracking-tight text-gray-900">Projets</h2>
          <p className="text-sm text-gray-500 font-medium">Gérez vos projets académiques et vos équipes</p>
        </div>
        <button 
          onClick={() => {
            setName(''); setDescription(''); setStartDate(''); setEndDate(''); setSupervisorEmail(''); setMembersList([]); setMemberInput('');
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-sm transition-all"
        >
          <Plus size={18} />
          Nouveau Projet
        </button>
      </div>

      {/* Liste des projets */}
      {projects.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center text-gray-400">
          <FolderGit2 className="mx-auto mb-4 text-gray-300" size={48} />
          <p className="text-lg font-medium">Aucun projet trouvé. Créez votre premier projet !</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((project) => (
            <div key={project._id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4 flex flex-col justify-between group relative hover:border-purple-100 transition-all">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-base font-bold text-gray-900 line-clamp-1">{project.name}</h3>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2.5 py-0.5 rounded-full">
                      {formatStatus(project.status)}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 line-clamp-2">{project.description}</p>
                
                <div className="space-y-2 pt-2 text-xs text-gray-600 font-medium border-t border-gray-50">
                  <div className="flex items-center gap-2">
                    <User size={14} className="text-purple-500" />
                    <span className="truncate">
                      Encadrant : {project.supervisor && typeof project.supervisor === 'object' ? project.supervisor.fullName : 'Non assigné'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users size={14} className="text-purple-500" />
                    <span>{project.members?.length || 0} membre(s) dans l'équipe</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-gray-400" />
                    <span>{formatDateForInput(project.startDate)} - {formatDateForInput(project.endDate)}</span>
                  </div>
                </div>
              </div>

              {/* Barre de Progression et Actions */}
              <div className="space-y-3 pt-2">
                  <div className="flex justify-between text-xs font-bold text-gray-500">
                  <span>Progression</span>
                  <span>{project.progressPercentage || project.progress || 0}%</span>
                </div>
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-purple-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${project.progressPercentage || project.progress || 0}%` }}
                  ></div>
                </div>


                {/* Barre d'outils Actions */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-50 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => onSelectProject(project._id)} 
                    title="Voir les tâches / détails"
                    className="p-1.5 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all"
                  >
                    <Eye size={16} />
                  </button>
                  <button 
                    onClick={() => openEditModal(project)}
                    title="Modifier le projet"
                    className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button 
                    onClick={() => handleDeleteProject(project._id)}
                    title="Supprimer le projet"
                    className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL FORMULAIRE NOUVEAU PROJET */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-gray-100 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-50 shrink-0">
              <h3 className="text-lg font-bold text-gray-900">Créer un nouveau projet</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Nom du projet</label>
                <input required type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 transition-all text-gray-900" placeholder="Ex: Application E-Learning" />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Description</label>
                <textarea required rows="2" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 transition-all text-gray-900" placeholder="Objectifs et livrables du projet..." />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Email de l'encadrant (Professeur)</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 text-gray-400" size={16} />
                  <input required type="email" value={supervisorEmail} onChange={(e) => setSupervisorEmail(e.target.value)} className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 transition-all text-gray-900" placeholder="prof@institution.com" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Membres de l'équipe (par Email)</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Mail className="absolute left-3 top-2.5 text-gray-400" size={16} />
                    <input type="text" value={memberInput} onChange={(e) => setMemberInput(e.target.value)} className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 transition-all text-gray-900" placeholder="etudiant@gmail.com" />
                  </div>
                  <button type="button" onClick={handleAddMember} className="bg-gray-900 hover:bg-gray-800 text-white px-3 rounded-xl font-bold text-xs transition-all">
                    Ajouter
                  </button>
                </div>

                {membersList.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2.5 p-2 bg-gray-50 rounded-xl border border-gray-100">
                    {membersList.map((email) => (
                      <span key={email} className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 text-xs font-semibold pl-2.5 pr-1.5 py-1 rounded-lg border border-purple-100">
                        {email}
                        <button type="button" onClick={() => handleRemoveMember(email)} className="text-purple-400 hover:text-purple-600 p-0.5 rounded">
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 pt-1">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Date de début</label>
                  <input required type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 transition-all text-gray-900" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Date de fin</label>
                  <input required type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 transition-all text-gray-900" />
                </div>
              </div>

              <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2.5 rounded-xl text-sm mt-3 transition-all shadow-sm shrink-0">
                Créer le projet académique
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL MODIFIER UN PROJET */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-gray-100 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-50 shrink-0">
              <h3 className="text-lg font-bold text-gray-900">Modifier le projet</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleUpdateSubmit} className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Nom du projet</label>
                <input required type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 transition-all text-gray-900" />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Description</label>
                <textarea required rows="2" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 transition-all text-gray-900" />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Statut actuel</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-600/20 text-gray-900 font-medium">
                  <option value="En cours">En cours</option>
                  <option value="En attente">En attente</option>
                  <option value="Terminé">Terminé</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Email de l'encadrant</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 text-gray-400" size={16} />
                  <input required type="email" value={supervisorEmail} onChange={(e) => setSupervisorEmail(e.target.value)} className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 transition-all text-gray-900" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Membres de l'équipe (par Email)</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Mail className="absolute left-3 top-2.5 text-gray-400" size={16} />
                    <input type="text" value={memberInput} onChange={(e) => setMemberInput(e.target.value)} className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 transition-all text-gray-900" placeholder="etudiant@gmail.com" />
                  </div>
                  <button type="button" onClick={handleAddMember} className="bg-gray-900 hover:bg-gray-800 text-white px-3 rounded-xl font-bold text-xs transition-all">
                    Ajouter
                  </button>
                </div>

                {membersList.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2.5 p-2 bg-gray-50 rounded-xl border border-gray-100">
                    {membersList.map((email) => (
                      <span key={email} className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 text-xs font-semibold pl-2.5 pr-1.5 py-1 rounded-lg border border-purple-100">
                        {email}
                        <button type="button" onClick={() => handleRemoveMember(email)} className="text-purple-400 hover:text-purple-600 p-0.5 rounded">
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Date de début</label>
                  <input required type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-600/20 text-gray-900" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Date de fin</label>
                  <input required type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-600/20 text-gray-900" />
                </div>
              </div>

              <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2.5 rounded-xl text-sm mt-3 transition-all shadow-sm shrink-0">
                Enregistrer les modifications
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}