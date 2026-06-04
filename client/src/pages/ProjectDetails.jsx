import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, User, ArrowLeft, Plus, X, ListTodo, Clock, CheckCircle, AlertTriangle, Mail, Shield, Trash2, Edit } from 'lucide-react';
import toast from 'react-hot-toast';
import Sidebar from '../components/Sidebar'; 
import ProjectMembers from './ProjectMembers';

export default function ProjectDetails({ projectId, onBack, setActiveTab }) {

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modals
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // Gestion de l'onglet interne
  const [activeSubTab, setActiveSubTab] = useState('tasks');

  // États du formulaire de création de tâche
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskPriority, setTaskPriority] = useState('medium');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskAssignedEmail, setTaskAssignedEmail] = useState('');

  // États pour la MODIFICATION de tâche
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPriority, setEditPriority] = useState('medium');
  const [editDueDate, setEditDueDate] = useState('');
  const [editAssignedEmail, setEditAssignedEmail] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      try {
        const projectRes = await axios.get(`http://localhost:5000/api/projects/${projectId}`, { headers });
        if (projectRes.data.success) {
          setProject(projectRes.data.project);
        }
      } catch (projectError) {
        console.error("Erreur projet:", projectError);
        toast.error("Impossible de récupérer les détails du projet.");
      }

      try {
        const tasksRes = await axios.get(`http://localhost:5000/api/tasks/project/${projectId}`, { headers });
        if (tasksRes.data.success) {
          setTasks(tasksRes.data.tasks);
        }
      } catch (tasksError) {
        console.warn("Aucune tâche trouvée.", tasksError);
        setTasks([]); 
      }

    } catch (globalError) {
      console.error("Erreur générale de récupération :", globalError);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchData();
    }
  }, [projectId]);

  const handleNavigation = (tabId) => {
    if (setActiveTab) {
      setActiveTab(tabId);
    }
    if (onBack && tabId !== 'projects') {
      onBack(); 
    }
  };

  // ➕ CRÉATION DE TÂCHE
 const handleCreateTask = async (e) => {
  e.preventDefault();
  if (!taskTitle.trim()) {
    toast.error("Le titre de la tâche est obligatoire");
    return;
  }

  // 1. Récupérer l'utilisateur connecté depuis le localStorage
  const storedUser = JSON.parse(localStorage.getItem('user'));
  
  // 2. Déterminer l'email à assigner (Solution 1)
  // Si taskAssignedEmail est vide (rien choisi), on prend l'email de l'user connecté
  const emailToAssign = taskAssignedEmail || storedUser?.email;

  try {
    const token = localStorage.getItem('token');
    const response = await axios.post('http://localhost:5000/api/tasks/create', {
      title: taskTitle,
      description: taskDescription,
      priority: taskPriority,
      dueDate: taskDueDate,
      projectId: projectId, // Utilise projectId qui vient des props ou du state
      assignedToEmail: emailToAssign // 🔥 Envoyé proprement au backend !
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (response.data.success) {
      toast.success("Tâche ajoutée au tableau !");
      setIsTaskModalOpen(false);
      
      // Réinitialisation des champs du formulaire
      setTaskTitle('');
      setTaskDescription('');
      setTaskPriority('medium');
      setTaskDueDate('');
      setTaskAssignedEmail('');
      
      // Rafraîchir les données de la page
      if (typeof fetchData === 'function') {
        fetchData();
      } else if (typeof fetchProjectDetails === 'function') {
        fetchProjectDetails();
      }
    }
  } catch (error) {
    console.error("Erreur création tâche:", error);
    toast.error(error.response?.data?.message || "Échec de l'ajout de la tâche");
  }
};

  // 🔄 MODIFICATION DU STATUT (SÉLECTEUR RAPIDE KANBAN)
  const handleUpdateStatus = async (taskId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.patch(`http://localhost:5000/api/tasks/${taskId}/status`, {
        status: newStatus
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        toast.success("Statut mis à jour !");
        fetchData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Impossible de modifier le statut");
    }
  };

  // 📝 OUVRIR LE MODAL DE MODIFICATION ET PRÉ-REMPLIR LES CHAMPS
  const openEditModal = (task) => {
    setEditingTaskId(task._id);
    setEditTitle(task.title);
    setEditDescription(task.description || '');
    setEditPriority(task.priority || 'medium');
    setEditDueDate(task.dueDate ? task.dueDate.substring(0, 10) : '');
    setEditAssignedEmail(task.assignedTo?.email || '');
    setIsEditModalOpen(true);
  };

  // 💾 ENREGISTRER LA MODIFICATION GLOBALE DE LA TÂCHE
  const handleUpdateTask = async (e) => {
    e.preventDefault();
    if (!editTitle.trim()) {
      toast.error("Le titre de la tâche est obligatoire");
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`http://localhost:5000/api/tasks/${editingTaskId}`, {
        title: editTitle,
        description: editDescription,
        priority: editPriority,
        dueDate: editDueDate || null,
        assignedToEmail: editAssignedEmail || null
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        toast.success("Tâche modifiée avec succès !");
        setIsEditModalOpen(false);
        fetchData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Échec de la modification");
    }
  };

  // 🗑️ SUPPRESSION D'UNE TÂCHE
  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Es-tu sûr de vouloir supprimer définitivement cette tâche ?")) return;

    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`http://localhost:5000/api/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        toast.success("Tâche supprimée !");
        fetchData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Impossible de supprimer la tâche");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Non définie';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar activeTab="projects" setActiveTab={handleNavigation} /> 
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center p-12 bg-white rounded-2xl border border-gray-100 max-w-md w-full shadow-sm">
            <AlertTriangle className="mx-auto text-amber-500 mb-4" size={40} />
            <p className="text-gray-600 font-medium">Projet introuvable.</p>
            <button onClick={onBack} className="mt-4 text-sm bg-gray-900 text-white px-4 py-2 rounded-xl font-bold">
              Retour au tableau de bord
            </button>
          </div>
        </div>
      </div>
    );
  }

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'Done').length;
  const calculatedProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const todoTasks = tasks.filter(t => t.status === 'To Do');
  const inProgressTasks = tasks.filter(t => t.status === 'In Progress');
  const doneTasks = tasks.filter(t => t.status === 'Done');

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-50 text-red-600 border-red-100';
      case 'medium': return 'bg-amber-50 text-amber-600 border-amber-100';
      default: return 'bg-blue-50 text-blue-600 border-blue-100';
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar activeTab="projects" setActiveTab={handleNavigation} />

      <main className="flex-1 p-8 space-y-6 overflow-y-auto max-h-screen">
        
        {/* Barre supérieure */}
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2.5 bg-white border border-gray-100 hover:bg-gray-50 rounded-xl shadow-sm text-gray-600">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-gray-900">{project.name}</h2>
            <p className="text-sm text-gray-500 font-medium">Espace de travail et de suivi académique</p>
          </div>
        </div>

        {/* Barre d'onglets */}
        <div className="flex p-1 bg-gray-200/60 rounded-xl w-fit shrink-0">
          <button onClick={() => setActiveSubTab('tasks')} className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${activeSubTab === 'tasks' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}>Tâches</button>
          <button onClick={() => setActiveSubTab('members')} className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${activeSubTab === 'members' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}>Membres ({project.members?.length || 0})</button>
        </div>

        {/* CONTENU : ONGLET TÂCHES */}
        {activeSubTab === 'tasks' && (
          <div className="space-y-6">
            {/* Infos projet et progression */}
            <div className="grid grid-cols-1 grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Objectifs et livrables</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">{project.description || "Aucune description."}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100 text-xs font-semibold text-gray-600">
                  <div className="flex items-center gap-2"><Calendar size={16} className="text-purple-500" /><span>Début : {formatDate(project.startDate)}</span></div>
                  <div className="flex items-center gap-2"><Calendar size={16} className="text-purple-500" /><span>Fin : {formatDate(project.endDate)}</span></div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Avancement réel</h4>
                    <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2.5 py-0.5 rounded-full">{project.status}</span>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold text-gray-600">
                      <span>Progression ({completedTasks}/{totalTasks} tâches)</span>
                      <span>{calculatedProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-purple-600 h-full rounded-full transition-all" style={{ width: `${calculatedProgress}%` }}></div>
                    </div>
                  </div>
                </div>
                <div className="space-y-2 pt-3 border-t border-gray-100 text-xs text-gray-600">
                  <div className="flex items-center gap-2"><User size={14} className="text-purple-500" /><span className="truncate font-medium">Encadrant : <strong className="text-gray-900">{project.supervisor?.fullName || 'Non assigné'}</strong></span></div>
                </div>
              </div>
            </div>

            {/* Tableau Kanban */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">Tableau Kanban des livrables</h3>
                <button onClick={() => setIsTaskModalOpen(true)} className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-3.5 py-2 rounded-xl font-bold text-xs shadow-sm shadow-purple-200 transition-all">
                  <Plus size={16} /> Ajouter une tâche
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Colonne À Faire */}
                <div className="bg-gray-50/70 p-4 rounded-2xl border border-gray-100 flex flex-col gap-3 min-h-[350px]">
                  <div className="flex items-center justify-between text-xs font-bold text-gray-400 uppercase tracking-wider px-1 mb-1">
                    <span className="flex items-center gap-1.5"><ListTodo size={14} /> À Faire</span>
                    <span className="bg-gray-200/80 text-gray-600 px-2 py-0.5 rounded-lg text-[10px]">{todoTasks.length}</span>
                  </div>
                  {todoTasks.length === 0 ? <p className="text-center text-xs text-gray-400 italic py-8 bg-white/40 rounded-xl border border-dashed border-gray-200">Aucune tâche</p> : 
                    todoTasks.map(task => <TaskCard key={task._id} task={task} getPriorityColor={getPriorityColor} formatDate={formatDate} onStatusChange={handleUpdateStatus} onDelete={handleDeleteTask} onEdit={openEditModal} />)}
                </div>

                {/* Colonne En Cours */}
                <div className="bg-gray-50/70 p-4 rounded-2xl border border-gray-100 flex flex-col gap-3 min-h-[350px]">
                  <div className="flex items-center justify-between text-xs font-bold text-purple-600 uppercase tracking-wider px-1 mb-1">
                    <span className="flex items-center gap-1.5"><Clock size={14} /> En Cours</span>
                    <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-lg text-[10px]">{inProgressTasks.length}</span>
                  </div>
                  {inProgressTasks.length === 0 ? <p className="text-center text-xs text-gray-400 italic py-8 bg-white/40 rounded-xl border border-dashed border-gray-200">Aucune tâche</p> : 
                    inProgressTasks.map(task => <TaskCard key={task._id} task={task} getPriorityColor={getPriorityColor} formatDate={formatDate} onStatusChange={handleUpdateStatus} onDelete={handleDeleteTask} onEdit={openEditModal} />)}
                </div>

                {/* Colonne Terminé */}
                <div className="bg-gray-50/70 p-4 rounded-2xl border border-gray-100 flex flex-col gap-3 min-h-[350px]">
                  <div className="flex items-center justify-between text-xs font-bold text-green-600 uppercase tracking-wider px-1 mb-1">
                    <span className="flex items-center gap-1.5"><CheckCircle size={14} /> Terminé</span>
                    <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-lg text-[10px]">{doneTasks.length}</span>
                  </div>
                  {doneTasks.length === 0 ? <p className="text-center text-xs text-gray-400 italic py-8 bg-white/40 rounded-xl border border-dashed border-gray-200">Aucune tâche</p> : 
                    doneTasks.map(task => <TaskCard key={task._id} task={task} getPriorityColor={getPriorityColor} formatDate={formatDate} onStatusChange={handleUpdateStatus} onDelete={handleDeleteTask} onEdit={openEditModal} />)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB MEMBRES */}
        {activeSubTab === 'members' && (
          <ProjectMembers
            projectId={projectId}
            currentUserId={JSON.parse(localStorage.getItem('user'))?._id || JSON.parse(localStorage.getItem('user'))?.id}
            userRole={JSON.parse(localStorage.getItem('user'))?.role}
          />
        )}


        {/* 🟥 MODAL : NOUVELLE TÂCHE */}
        {isTaskModalOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-gray-100 overflow-hidden flex flex-col">
              <div className="flex items-center justify-between p-6 border-b border-gray-50">
                <h3 className="text-lg font-bold text-gray-900">Ajouter une nouvelle tâche</h3>
                <button onClick={() => setIsTaskModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1"><X size={20} /></button>
              </div>
              <form onSubmit={handleCreateTask} className="p-6 space-y-4 overflow-y-auto">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Titre de la tâche</label>
                  <input required type="text" value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none" placeholder="Ex: Corriger l'interface UI" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Description</label>
                  <textarea rows="2" value={taskDescription} onChange={(e) => setTaskDescription(e.target.value)} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none" placeholder="Consignes..." />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Priorité</label>
                    <select value={taskPriority} onChange={(e) => setTaskPriority(e.target.value)} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 font-medium">
                      <option value="low">Basse</option>
                      <option value="medium">Moyenne</option>
                      <option value="high">Haute</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Date d'échéance</label>
                    <input type="date" value={taskDueDate} onChange={(e) => setTaskDueDate(e.target.value)} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Assigner à</label>
                  <select value={taskAssignedEmail} onChange={(e) => setTaskAssignedEmail(e.target.value)} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 font-medium">
                    <option value="">-- Laisser non assignée --</option>
                    {project.members?.map(member => (<option key={member._id} value={member.email}>{member.fullName}</option>))}
                  </select>
                </div>
                <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2.5 rounded-xl text-sm transition-all shadow-sm">Ajouter la tâche</button>
              </form>
            </div>
          </div>
        )}

        {/* 🟩 MODAL : MODIFIER UNE TÂCHE EXISTANTE */}
        {isEditModalOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-gray-100 overflow-hidden flex flex-col">
              <div className="flex items-center justify-between p-6 border-b border-gray-50">
                <h3 className="text-lg font-bold text-gray-900">Modifier la tâche</h3>
                <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1"><X size={20} /></button>
              </div>
              <form onSubmit={handleUpdateTask} className="p-6 space-y-4 overflow-y-auto">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Titre de la tâche</label>
                  <input required type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Description</label>
                  <textarea rows="2" value={editDescription} onChange={(e) => setEditDescription(e.target.value)} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Priorité</label>
                    <select value={editPriority} onChange={(e) => setEditPriority(e.target.value)} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 font-medium">
                      <option value="low">Basse</option>
                      <option value="medium">Moyenne</option>
                      <option value="high">Haute</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Date d'échéance</label>
                    <input type="date" value={editDueDate} onChange={(e) => setEditDueDate(e.target.value)} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Assigner à</label>
                  <select value={editAssignedEmail} onChange={(e) => setEditAssignedEmail(e.target.value)} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 font-medium">
                    <option value="">-- Laisser non assignée --</option>
                    {project.members?.map(member => (<option key={member._id} value={member.email}>{member.fullName}</option>))}
                  </select>
                </div>
                <button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-2.5 rounded-xl text-sm transition-all shadow-sm">Enregistrer les modifications</button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// 📦 CARTE DE TÂCHE AVEC SÉLECTEUR DE STATUT + BOUTONS ÉDITER ET SUPPRIMER
function TaskCard({ task, getPriorityColor, formatDate, onStatusChange, onDelete, onEdit }) {
  return (
    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-3 hover:border-purple-200 transition-all relative group">
      
      {/* Boutons d'actions rapides (Apparaissent discrètement au survol de la carte) */}
      <div className="absolute top-3 right-3 flex items-center gap-1.5 opacity-40 group-hover:opacity-100 transition-opacity">
        <button onClick={() => onEdit(task)} className="p-1 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded transition-colors" title="Modifier la tâche">
          <Edit size={13} />
        </button>
        <button onClick={() => onDelete(task._id)} className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors" title="Supprimer la tâche">
          <Trash2 size={13} />
        </button>
      </div>

      <div className="space-y-1 pr-12"> {/* pr-12 pour laisser de la place aux boutons en haut à droite */}
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getPriorityColor(task.priority)}`}>
            {task.priority === 'high' ? 'Haute' : task.priority === 'medium' ? 'Moyenne' : 'Basse'}
          </span>
          {task.dueDate && <span className="text-[10px] text-gray-400 font-medium">{formatDate(task.dueDate)}</span>}
        </div>
        <h4 className="text-sm font-bold text-gray-900 leading-snug">{task.title}</h4>
        {task.description && <p className="text-xs text-gray-500 line-clamp-2">{task.description}</p>}
      </div>

      {/* Action rapide de statut */}
      <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-2">
        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Statut :</label>
        <select 
          value={task.status} 
          onChange={(e) => onStatusChange(task._id, e.target.value)}
          className="text-xs bg-slate-50 border border-gray-200 rounded-lg px-2 py-1 text-gray-700 font-medium focus:outline-none cursor-pointer"
        >
          <option value="To Do">À Faire</option>
          <option value="In Progress">En Cours</option>
          <option value="Done">Terminé</option>
        </select>
      </div>

      {task.assignedTo && (
        <div className="pt-2 border-t border-gray-50 flex items-center gap-1.5 text-[11px] text-gray-600 font-medium">
          <div className="w-4 h-4 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-[9px] font-bold">
            {task.assignedTo.fullName?.charAt(0).toUpperCase()}
          </div>
          <span className="truncate">{task.assignedTo.fullName}</span>
        </div>
      )}
    </div>
  );
}