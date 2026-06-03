import React, { useState } from 'react';
import { Trash2, Edit3, Eye, X } from 'lucide-react';
import axios from 'axios'; // Assure-toi qu'axios est installé

const MyTasksPage = ({ currentUserId, userRole, initialTasks = [] }) => {
  const [tasks, setTasks] = useState(initialTasks);
  const [filterStatus, setFilterStatus] = useState('All');

  // --- ÉTATS POUR LES FENÊTRES MODALES ---
  const [selectedTask, setSelectedTask] = useState(null); // Tâche active pour Voir/Modifier
  const [isEditing, setIsEditing] = useState(false);       // Formulaire de modification ouvert ?
  const [isViewing, setIsViewing] = useState(false);       // Fenêtre de détails ouverte ?

  // États du formulaire de modification
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPriority, setEditPriority] = useState('medium');
  const [editDueDate, setEditDueDate] = useState('');
  const [editStatus, setEditStatus] = useState('To Do');

  // 1. Gestion des filtres par Statut
  const filteredTasks = tasks.filter(task => {
    if (filterStatus === 'All') return true;
    if (filterStatus === 'To Do') return task.status?.trim() === 'To Do' || task.status?.trim() === 'À Faire';
    if (filterStatus === 'In Progress') return task.status?.trim() === 'In Progress' || task.status?.trim() === 'En Cours';
    if (filterStatus === 'Done') return task.status?.trim() === 'Done' || task.status?.trim() === 'Terminé';
    return true;
  });

  // Action : Ouvrir le formulaire de modification (Pré-remplissage)
  const openEditModal = (task) => {
    setSelectedTask(task);
    setEditTitle(task.title || '');
    setEditDescription(task.description || '');
    setEditPriority(task.priority || 'medium');
    setEditStatus(task.status || 'To Do');
    setEditDueDate(task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '');
    setIsEditing(true);
  };

  // Action : Ouvrir la vue détails (Œil)
  const openViewModal = (task) => {
    setSelectedTask(task);
    setIsViewing(true);
  };

  // 2. Action Rapide / Soumission : Enregistrer les modifications du formulaire
  // Dans MyTasksPage.jsx
const handleUpdateTaskSubmit = async (e) => {
  e.preventDefault();
  try {
    const updatedData = {
      title: editTitle,
      description: editDescription,
      priority: editPriority,
      status: editStatus,
      dueDate: editDueDate || null
    };

    // 1. Récupérer le token d'authentification stocké localement
    const token = localStorage.getItem('token'); // 👈 Modifie la clé si tu utilises un autre nom (ex: 'userToken')

    // 2. Configurer les en-têtes avec le format Bearer Token
    const config = {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };

    // 3. Appel API avec l'URL, les Données ET la Configuration
    const response = await axios.put(
      `http://localhost:5000/api/tasks/${selectedTask._id}`, 
      updatedData, 
      config // 👈 TRÈS IMPORTANT : Le token est transmis ici au backend
    );
    
    if (response.data.success) {
      setTasks(tasks.map(t => t._id === selectedTask._id ? response.data.task : t));
      setIsEditing(false);
      setSelectedTask(null);
      console.log("Tâche modifiée avec succès !");
    }
  } catch (err) {
    console.error("Erreur lors de la modification de la tâche", err);
  }
};

  // Action Rapide : Modifier le statut directement via le sélecteur du tableau
  const handleStatusChange = async (taskId, newStatus) => {
    try {
     const token = localStorage.getItem('token');
const response = await axios.patch(
  `http://localhost:5000/api/tasks/${taskId}/status`, 
  { status: newStatus }, 
  { headers: { Authorization: `Bearer ${token}` } }
);
      if (response.data.success) {
        setTasks(tasks.map(t => t._id === taskId ? { ...t, status: newStatus } : t));
      }
    } catch (err) {
      console.error("Erreur lors de la mise à jour du statut", err);
    }
  };

  // 3. Action : Supprimer la tâche
  const handleDeleteTask = async (taskId) => {
    if (window.confirm("Voulez-vous vraiment supprimer cette tâche ?")) {
      try {
        const token = localStorage.getItem('token');
const response = await axios.delete(
  `http://localhost:5000/api/tasks/${taskId}`, 
  { headers: { Authorization: `Bearer ${token}` } }
);
        if (response.data.success) {
          setTasks(tasks.filter(t => t._id !== taskId));
        }
      } catch (err) {
        console.error("Erreur lors de la suppression", err);
      }
    }
  };

  // 4. Badges de couleur pour la Priorité
  const getPriorityBadgeStyles = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high':
      case 'haute':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'medium':
      case 'moyenne':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'low':
      case 'basse':
        return 'bg-green-50 text-green-700 border-green-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-6 p-4">
      {/* En-tête de la page */}
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight text-gray-900">Mes Tâches</h2>
        <p className="text-sm text-gray-500 font-medium">Gestion globale de vos tâches et livrables.</p>
      </div>

      {/* --- FILTRES RAPIDES (ONGLETS) --- */}
      <div className="flex border-b border-gray-200 overflow-x-auto seamless-scrollbar">
        {['All', 'To Do', 'In Progress', 'Done'].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`pb-3 px-4 text-sm font-medium transition-all border-b-2 whitespace-nowrap ${
              filterStatus === status
                ? 'border-indigo-600 text-indigo-600 font-semibold'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {status === 'All' && 'Toutes'}
            {status === 'To Do' && 'À Faire'}
            {status === 'In Progress' && 'En Cours'}
            {status === 'Done' && 'Terminé'}
          </button>
        ))}
      </div>

      {/* --- TABLEAU DES TÂCHES --- */}
      {filteredTasks.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 shadow-sm text-gray-400">
          Aucune tâche trouvée pour ce statut.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/75 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                  <th className="px-6 py-4">Tâche / Projet</th>
                  <th className="px-6 py-4">Priorité</th>
                  <th className="px-6 py-4">Échéance</th>
                  <th className="px-6 py-4">Statut Rapide</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm text-gray-600">
                {filteredTasks.map((task) => {
                  const isCreator = task.createdBy === currentUserId || task.createdBy?._id === currentUserId;
                  const isAssigned = task.assignedTo === currentUserId || task.assignedTo?._id === currentUserId;
                  const isEncadrant = userRole === 'supervisor' || userRole === 'Encadrant';

                  const canModify = isCreator || isAssigned || isEncadrant;
                  const canDelete = isCreator || isEncadrant || isAssigned;

                  return (
                    <tr key={task._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900">{task.title}</div>
                        <div className="text-xs text-gray-400 mt-0.5">
                          Projet : <span className="text-indigo-600 font-medium">{task.project?.name || 'Acadify'}</span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getPriorityBadgeStyles(task.priority)}`}>
                          {task.priority || 'Moyenne'}
                        </span>
                      </td>

                      <td className="px-6 py-4 font-medium text-gray-700">
                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString('fr-FR') : 'Aucune date'}
                      </td>

                      <td className="px-6 py-4">
                        <select
                          value={task.status || 'To Do'}
                          disabled={!canModify}
                          onChange={(e) => handleStatusChange(task._id, e.target.value)}
                          className="text-xs font-medium rounded-lg p-1.5 border border-gray-200 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer disabled:bg-gray-50 disabled:cursor-not-allowed text-gray-700"
                        >
                          <option value="To Do">À Faire</option>
                          <option value="In Progress">En Cours</option>
                          <option value="Done">Terminé</option>
                        </select>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openViewModal(task)}
                            title="Voir les détails"
                            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
                          >
                            <Eye size={16} />
                          </button>

                          {canModify && (
                            <button
                              onClick={() => openEditModal(task)} // 👈 APPEL DU FORMULAIRE DE MODIFICATION
                              title="Modifier la tâche"
                              className="p-1.5 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all"
                            >
                              <Edit3 size={16} />
                            </button>
                          )}

                          {canDelete && (
                            <button
                              onClick={() => handleDeleteTask(task._id)}
                              title="Supprimer la tâche"
                              className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* 📝 FENÊTRE MODALE : FORMULAIRE DE MODIFICATION      */}
      {/* ==================================================== */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <h3 className="font-bold text-gray-900 text-lg">Modifier la tâche</h3>
              <button 
                onClick={() => setIsEditing(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdateTaskSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Titre de la tâche</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full text-sm rounded-xl border border-gray-200 p-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-gray-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Description</label>
                <textarea
                  rows="3"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full text-sm rounded-xl border border-gray-200 p-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-gray-800"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Priorité</label>
                  <select
                    value={editPriority}
                    onChange={(e) => setEditPriority(e.target.value)}
                    className="w-full text-sm rounded-xl border border-gray-200 p-2.5 bg-white focus:outline-none text-gray-800"
                  >
                    <option value="low">Basse</option>
                    <option value="medium">Moyenne</option>
                    <option value="high">Haute</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Statut</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full text-sm rounded-xl border border-gray-200 p-2.5 bg-white focus:outline-none text-gray-800"
                  >
                    <option value="To Do">À Faire</option>
                    <option value="In Progress">En Cours</option>
                    <option value="Done">Terminé</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Date d'échéance</label>
                <input
                  type="date"
                  value={editDueDate}
                  onChange={(e) => setEditDueDate(e.target.value)}
                  className="w-full text-sm rounded-xl border border-gray-200 p-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-gray-800"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-sm shadow-indigo-100"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* 👁️ FENÊTRE MODALE : VOIR LES DÉTAILS                */}
      {/* ==================================================== */}
      {isViewing && selectedTask && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-xl border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <h3 className="font-bold text-gray-900 text-lg">Détails de la tâche</h3>
              <button onClick={() => setIsViewing(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Titre</span>
                <p className="text-base font-bold text-gray-900">{selectedTask.title}</p>
              </div>
              <div>
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Description</span>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-100 mt-1">
                  {selectedTask.description || "Aucune description fournie."}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Priorité</span>
                  <div className="mt-1">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getPriorityBadgeStyles(selectedTask.priority)}`}>
                      {selectedTask.priority}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Statut</span>
                  <p className="text-sm font-semibold text-gray-700 mt-1">{selectedTask.status}</p>
                </div>
              </div>
              <div>
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Date d'échéance</span>
                <p className="text-sm text-gray-700 font-medium mt-0.5">
                  {selectedTask.dueDate ? new Date(selectedTask.dueDate).toLocaleDateString('fr-FR') : 'Non définie'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyTasksPage;