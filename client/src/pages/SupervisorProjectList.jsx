import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FolderGit2, Users, CheckCircle2, ArrowRight, ArrowLeft, Loader2, ClipboardList, Clock, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SupervisorProjectList({ supervisorId }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // États pour la gestion de l'inspection des tâches
  const [selectedProject, setSelectedProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(false);

  // 1. Charger les projets au démarrage
  useEffect(() => {
    fetchSupervisorProjects();
  }, [supervisorId]);

  const fetchSupervisorProjects = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/supervisor/projects');
      if (response.data.success) {
        setProjects(response.data.projects);
      }
    } catch (error) {
      console.error("Erreur chargement projets :", error);
      toast.error("Erreur lors de la récupération des projets.");
    } finally {
      setLoading(false);
    }
  };

  // 2. Action au clic sur "Inspecter les tâches"
  const handleInspectProject = async (project) => {
    setSelectedProject(project);
    try {
      setLoadingTasks(true);
      const response = await axios.get(`/api/supervisor/projects/${project._id}/tasks`);
      if (response.data.success) {
        setTasks(response.data.tasks);
      }
    } catch (error) {
      console.error("Erreur chargement tâches :", error);
      toast.error("Impossible de charger les tâches de ce projet.");
    } finally {
      setLoadingTasks(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] space-y-3">
        <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
        <p className="text-sm text-gray-500 font-medium">Chargement de vos projets affectés...</p>
      </div>
    );
  }

  // ==========================================
  // VUE ÉCRAN B : INSPECTION DES TÂCHES DU PROJET
  // ==========================================
  if (selectedProject) {
    // Filtrer les tâches localement pour l'affichage par colonne/statut
    // Backend utilise généralement: 'To Do' | 'In Progress' | 'Done'
    // (et certains composants peuvent stocker en minuscule: 'todo' | 'in_progress' | 'done')
    const todoTasks = tasks.filter(t => ['To Do', 'todo'].includes((t.status || '').trim()));
    const inProgressTasks = tasks.filter(t => ['In Progress', 'in_progress'].includes((t.status || '').trim()));
    const doneTasks = tasks.filter(t => ['Done', 'done'].includes((t.status || '').trim()));


    return (
      <div className="space-y-6 animate-fadeIn">
        {/* Bouton Retour et En-tête */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <button 
            onClick={() => { setSelectedProject(null); fetchSupervisorProjects(); }}
            className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-purple-600 transition-colors w-fit"
          >
            <ArrowLeft size={16} /> Retour aux projets
          </button>
          <span className="bg-purple-50 text-purple-700 text-xs font-bold px-3 py-1.5 rounded-xl border border-purple-100">
            Projet : {selectedProject.name}
          </span>
        </div>

        <div>
          <h3 className="text-xl font-bold text-gray-900">Suivi des Livrables & Tâches</h3>
          <p className="text-xs text-gray-400 font-medium">Visualisez l'état d'avancement des tâches assignées aux membres de l'équipe.</p>
        </div>

        {loadingTasks ? (
          <div className="flex flex-col items-center justify-center h-[30vh] space-y-2">
            <Loader2 className="w-6 h-6 text-purple-600 animate-spin" />
            <p className="text-xs text-gray-400 font-medium">Récupération du carnet de tâches...</p>
          </div>
        ) : (
          /* Grille à 3 colonnes : À faire, En cours, Terminé */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* COLONNE 1 : À FAIRE */}
            <div className="bg-gray-100/60 rounded-2xl p-4 border border-gray-200/50 space-y-4 h-fit">
              <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                <span className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1.5">
                  <ClipboardList size={14} /> À Faire
                </span>
                <span className="bg-gray-200 text-gray-700 text-xs font-bold px-2 py-0.5 rounded-md">{todoTasks.length}</span>
              </div>
              
              <div className="space-y-3">
                {todoTasks.map(task => <TaskCard key={task._id} task={task} getInitials={getInitials} />)}
                {todoTasks.length === 0 && <p className="text-xs text-gray-400 text-center py-4 italic">Aucune tâche</p>}
              </div>
            </div>

            {/* COLONNE 2 : EN COURS */}
            <div className="bg-amber-50/40 rounded-2xl p-4 border border-amber-100/50 space-y-4 h-fit">
              <div className="flex items-center justify-between border-b border-amber-200/60 pb-2">
                <span className="text-xs font-bold text-amber-700 uppercase flex items-center gap-1.5">
                  <Clock size={14} /> En Cours
                </span>
                <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-0.5 rounded-md">{inProgressTasks.length}</span>
              </div>

              <div className="space-y-3">
                {inProgressTasks.map(task => <TaskCard key={task._id} task={task} getInitials={getInitials} borderTheme="border-amber-100" />)}
                {inProgressTasks.length === 0 && <p className="text-xs text-gray-400 text-center py-4 italic">Aucune tâche en cours</p>}
              </div>
            </div>

            {/* COLONNE 3 : TERMINÉ */}
            <div className="bg-emerald-50/30 rounded-2xl p-4 border border-emerald-100/50 space-y-4 h-fit">
              <div className="flex items-center justify-between border-b border-emerald-200/60 pb-2">
                <span className="text-xs font-bold text-emerald-700 uppercase flex items-center gap-1.5">
                  <CheckCircle2 size={14} /> Terminées
                </span>
                <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-0.5 rounded-md">{doneTasks.length}</span>
              </div>

              <div className="space-y-3">
                {doneTasks.map(task => <TaskCard key={task._id} task={task} getInitials={getInitials} borderTheme="border-emerald-100" />)}
                {doneTasks.length === 0 && <p className="text-xs text-gray-400 text-center py-4 italic">Aucune tâche terminée</p>}
              </div>
            </div>

          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // VUE ÉCRAN A : LISTE GLOBALE DES PROJETS
  // ==========================================
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Projets sous votre direction</h3>
          <p className="text-xs text-gray-400 font-medium">Liste en temps réel des livrables et compositions d'équipes.</p>
        </div>
        <span className="bg-purple-50 text-purple-700 text-xs font-bold px-3 py-1.5 rounded-xl border border-purple-100">
          {projects.length} {projects.length > 1 ? 'Projets suivis' : 'Projet suivi'}
        </span>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
          <FolderGit2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500 font-medium">Aucun projet ne vous a encore été attribué.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((project) => (
            <div 
              key={project._id} 
              className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-6"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl">
                    <FolderGit2 size={20} />
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${
                    project.progress === 100 
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                      : 'bg-amber-50 text-amber-700 border border-amber-100'
                  }`}>
                    {project.progress === 100 ? 'Terminé' : 'En cours'}
                  </span>
                </div>
                
                <h4 className="text-base font-bold text-gray-900 line-clamp-1">{project.name}</h4>
                <p className="text-xs text-gray-400 font-medium line-clamp-2">{project.description || "Aucune description fournie pour ce projet."}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-gray-400 flex items-center gap-1">
                    <CheckCircle2 size={13} className="text-gray-400" />
                    Tâches complétées : {project.doneTasks}/{project.totalTasks}
                  </span>
                  <span className="text-purple-600 font-bold">{project.progress}%</span>
                </div>
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-purple-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
              </div>

              <div className="border-t border-gray-50 pt-4 flex items-center justify-between">
                <div className="flex items-center space-x-[-8px] overflow-hidden">
                  {project.members && project.members.map((member, index) => (
                    <div 
                      key={member._id || index}
                      title={member.fullName}
                      className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-600 cursor-pointer shadow-sm"
                    >
                      {getInitials(member.fullName)}
                    </div>
                  ))}
                </div>

                {/* Bouton d'action dynamique relié au clic d'inspection */}
                <button 
                  onClick={() => handleInspectProject(project)}
                  className="text-xs font-bold text-purple-600 flex items-center gap-1 hover:gap-2 transition-all"
                >
                  Inspecter les tâches <ArrowRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Sub-Composant Interne pour afficher une Carte de Tâche propre
function TaskCard({ task, getInitials, borderTheme = "border-gray-100" }) {
  return (
    <div className={`bg-white p-4 rounded-xl border ${borderTheme} shadow-sm space-y-3`}>
      <div className="space-y-1">
        <h5 className="text-sm font-bold text-gray-900 line-clamp-1">{task.title}</h5>
        <p className="text-xs text-gray-400 font-medium line-clamp-2">{task.description || "Aucune description"}</p>
      </div>

      {/* Étudiant assigné à la tâche */}
      <div className="flex items-center justify-between border-t border-gray-50 pt-2.5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-purple-100 text-purple-700 font-bold text-[9px] rounded-full flex items-center justify-center border border-purple-200">
            {getInitials(task.assignedTo?.fullName)}
          </div>
          <span className="text-[11px] font-bold text-gray-600 truncate max-w-[120px]">
            {task.assignedTo?.fullName || "Non assigné"}
          </span>
        </div>

        {/* Badge d'échéance basique */}
        {task.dueDate && (
          <span className="text-[10px] font-semibold text-gray-400 bg-gray-50 px-2 py-0.5 rounded">
            {new Date(task.dueDate).toLocaleDateString('fr-FR', {month: 'short', day: 'numeric'})}
          </span>
        )}
      </div>
    </div>
  );
}