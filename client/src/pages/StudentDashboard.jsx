import React, { useState, useEffect } from 'react';
import axios from 'axios';

import { Search, FolderGit2, CheckSquare, Clock, AlertCircle, Calendar } from 'lucide-react';

import toast from 'react-hot-toast';
import Sidebar from '../components/Sidebar'; 
import ProjectsList from './ProjectsList';
import MyTasksPage from './MyTasksPage'; // 🚀 AJOUT : Importation de ton nouveau composant
import Team from './Team'; // Importez votre composant Team
import StudentParametres from './StudentParametres';
import { Bell } from 'lucide-react';


export default function StudentDashboard({ user, setIsAuthenticated, onSelectProject }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [tasksList, setTasksList] = useState([]); // 🚀 AJOUT : État pour stocker la liste brute des tâches pour MyTasksPage

  // --- Notifications ---
  const [openNotifications, setOpenNotifications] = useState(false);
  const [notificationsList, setNotificationsList] = useState([]);
  const [notificationsUnreadCount, setNotificationsUnreadCount] = useState(0);


  // --- ÉTATS POUR LES DONNÉES DYNAMIQUES DU BACKEND ---
  const [stats, setStats] = useState({
    activeProjects: 0,
    totalTasks: 0,
    inProgressTasks: 0,
    pendingReview: 0 
  });

  const [upcomingDeadlines, setUpcomingDeadlines] = useState([]);

  // Profil utilisateur extrait de l'objet user
  const userProfile = {
    fullName: user?.fullName || 'Étudiant Acadify',
    role: user?.role === 'supervisor' ? 'Encadrant' : 'Étudiant'
  };
const handleViewTask = async (taskId) => {
  try {
    const response = await axios.get(`http://localhost:5000/api/tasks/${taskId}`);
    if (response.data.success) {
      const taskDetails = response.data.task;
      // Ouvre ta modal de consultation et injecte les données (Ex: setSelectedTask(taskDetails))
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des détails :", error);
  }
};
const handleUpdateTask = async (taskId, updatedData) => {
  try {
    // updatedData contient { title, description, priority, dueDate, assignedToEmail }
    const response = await axios.put(`http://localhost:5000/api/tasks/${taskId}`, updatedData);
    if (response.data.success) {
      // Rafraîchis ta liste locale ou ton Kanban pour voir le changement immédiatement
      fetchTasks(); 
    }
  } catch (error) {
    console.error("Erreur lors de la modification :", error);
  }
};
  // 🔄 Chargement des données depuis le Backend (Dashboard ET Liste des tâches globales)
  useEffect(() => {
    const fetchDashboardAndTasksData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        // 1. Récupération des statistiques du Dashboard
        const statsResponse = await axios.get('http://localhost:5000/api/dashboard/stats', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (statsResponse.data.success) {
          const data = statsResponse.data.stats;
          setStats({
            activeProjects: data.totalProjects,
            totalTasks: data.totalTasks,
            inProgressTasks: data.inProgressCount,
            pendingReview: data.todoCount 
          });
          setUpcomingDeadlines(data.upcomingDeadlines || []);
        }

        // 2. 🚀 AJOUT : Récupération de la liste complète des tâches pour l'onglet global "tasks"
        const tasksResponse = await axios.get('http://localhost:5000/api/tasks/my-tasks', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (tasksResponse.data.success) {
          setTasksList(tasksResponse.data.tasks || []);
        }

      } catch (error) {
        console.error("Erreur lors de la récupération des données de l'utilisateur:", error);
        toast.error("Impossible de charger les données réelles.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardAndTasksData();
  }, [activeTab]); // Recharge intelligemment les données si l'utilisateur navigue entre les onglets

  // --- Notifications: chargement ---
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const resNotif = await axios.get('http://localhost:5000/api/notifications/my', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (resNotif.data?.success) {
          setNotificationsList(resNotif.data.notifications || []);
          setNotificationsUnreadCount(resNotif.data.unreadCount || 0);
        }
      } catch (e) {
        console.error('Erreur chargement notifications:', e);
      }
    };

    if (openNotifications || activeTab === 'dashboard') {
      fetchNotifications();
    }
  }, [openNotifications, activeTab]);

  const markNotificationAsRead = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`http://localhost:5000/api/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Refetch simple
      const resNotif = await axios.get('http://localhost:5000/api/notifications/my', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });

      if (resNotif.data?.success) {
        setNotificationsList(resNotif.data.notifications || []);
        setNotificationsUnreadCount(resNotif.data.unreadCount || 0);
      }
    } catch (e) {
      console.error('Erreur mark as read:', e);
    }
  };

  const getInitials = (name) => {
    if (!name || typeof name !== 'string') return '??';
    return name
      .trim()
      .split(/\s+/)
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const statsCards = [
    { id: 1, label: 'Projets Actifs', value: stats.activeProjects, icon: FolderGit2, color: 'bg-purple-100 text-purple-600' },
    { id: 2, label: 'Total Tâches Assignées', value: stats.totalTasks, icon: CheckSquare, color: 'bg-emerald-100 text-emerald-600' },
    { id: 3, label: 'En Cours', value: stats.inProgressTasks, icon: Clock, color: 'bg-orange-100 text-orange-600' },
    { id: 4, label: 'À Faire / En Attente', value: stats.pendingReview, icon: AlertCircle, color: 'bg-red-100 text-red-600' },
  ];

  if (loading && activeTab === 'dashboard') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-gray-900">
      
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        setIsAuthenticated={setIsAuthenticated} 
      />

      {/* ZONE DE CONTENU */}
      <main className="flex-1 p-8 overflow-y-auto h-screen space-y-8">
        
        {/* EN-TÊTE CHERCHER / PROFIL */}
        <header className="flex items-center justify-between">
          <div className="relative w-80">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400 pointer-events-none">
              <Search size={18} />
            </span>
            <input 
              type="text" 
              placeholder="Rechercher des projets, tâches, membres..." 
              className="w-full pl-11 pr-4 py-2 bg-gray-100/80 border border-transparent rounded-xl text-sm focus:outline-none focus:bg-white focus:border-gray-200 transition-all"
            />
          </div>

          <div className="flex items-center gap-5">
            <button
              className="relative p-2 text-gray-400 hover:text-gray-600 bg-white border border-gray-100 rounded-xl shadow-sm transition-all"
              onClick={() => setOpenNotifications((v) => !v)}
            >
              <Bell size={18} />
              {notificationsUnreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </button>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center text-purple-700 font-bold text-sm shadow-sm border border-purple-200">
                {getInitials(userProfile.fullName)}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-bold text-gray-900 leading-tight">{userProfile.fullName}</p>
                <p className="text-xs text-gray-400 font-medium">{userProfile.role}</p>
              </div>
            </div>
          </div>
        </header>

        {/* --- Notifications dropdown --- */}
        {openNotifications && (
          <div className="absolute right-6 top-16 w-[420px] bg-white border border-gray-100 shadow-xl rounded-2xl overflow-hidden z-50">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-gray-900">Notifications</p>
                <p className="text-xs text-gray-500">{notificationsUnreadCount} non lue(s)</p>
              </div>
              <button
                className="text-xs font-bold text-gray-500 hover:text-gray-900"
                onClick={() => setOpenNotifications(false)}
              >
                Fermer
              </button>
            </div>
            <div className="max-h-[360px] overflow-y-auto p-2">
              {notificationsList.length === 0 ? (
                <div className="p-6 text-center text-xs text-gray-400">Aucune notification.</div>
              ) : (
                notificationsList.map((n) => (
                  <button
                    key={n._id}
                    onClick={() => markNotificationAsRead(n._id)}
                    className={`w-full text-left px-3 py-3 rounded-xl transition-all mb-1 border ${
                      n.isRead ? 'bg-white border-transparent hover:bg-gray-50' : 'bg-red-50/40 border-red-200 hover:bg-red-50/60'
                    }`}
                  >
                    <p className={`text-sm font-bold ${n.isRead ? 'text-gray-800' : 'text-red-700'}`}>{n.message}</p>
                    <p className="text-[10px] mt-1 text-gray-500">
                      {n.createdAt ? new Date(n.createdAt).toLocaleString('fr-FR') : ''}
                    </p>
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        {/* 📋 CONTENU DU TABLEAU DE BORD (DASHBOARD) */}
        {activeTab === 'dashboard' && (
          <>
            <div className="space-y-1">
              <h2 className="text-2xl font-extrabold tracking-tight">Tableau de bord</h2>
              <p className="text-sm text-gray-500 font-medium">Ravi de vous revoir ! Voici un aperçu dynamique de vos activités.</p>
            </div>

            {/* Grille des cartes KPIs réels */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {statsCards.map((stat) => {
                const IconComponent = stat.icon;
                return (
                  <div key={stat.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{stat.label}</p>
                      <p className="text-3xl font-extrabold text-gray-900">{stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-xl ${stat.color} shadow-sm`}>
                      <IconComponent size={22} />
                    </div>
                  </div>
                );
              })}
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Liste complète des Échéances urgentes réelles */}
              <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-gray-900">📅 Échéances urgentes imminentes</h3>
                  <p className="text-xs text-gray-400 font-medium">Vos livrables les plus proches triés par criticité</p>
                </div>
                
                <div className="flex flex-col gap-3">
                  {upcomingDeadlines.length > 0 ? (
                    upcomingDeadlines.map((task) => (
                      <div key={task._id} className="p-4 border border-gray-100 rounded-xl bg-gray-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-purple-200 transition-all">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide ${
                              task.priority === 'high' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
                            }`}>
                              {task.priority === 'high' ? 'Haute' : task.priority === 'medium' ? 'Moyenne' : 'Basse'}
                            </span>
                            <h4 className="text-sm font-bold text-gray-900">{task.title}</h4>
                          </div>
                          <p className="text-xs text-gray-400 font-semibold">Projet : {task.project?.name || 'Projet Académique'}</p>
                        </div>
                        <div className="text-left sm:text-right flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-gray-100 text-xs font-bold text-gray-700 shadow-sm shrink-0">
                          <Calendar size={14} className="text-purple-500" />
                          <span>{formatDate(task.dueDate)}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-10 bg-slate-50/50 rounded-xl border border-dashed border-gray-200 text-xs text-gray-400">
                      Aucune deadline urgente pour le moment.
                    </div>
                  )}
                </div>
              </div>

              {/* Raccourci d'action rapide à côté */}
              <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between space-y-4">
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-gray-900">Efficacité de travail</h3>
                  <p className="text-xs text-gray-400 font-medium">Gérez vos avancements d'équipe</p>
                </div>
                <div className="py-6 flex justify-center">
                  <div className="w-24 h-24 bg-purple-50 rounded-full border-4 border-purple-600 flex items-center justify-center font-black text-xl text-purple-700 shadow-inner">
                    {stats.totalTasks > 0 ? Math.round((stats.inProgressTasks / stats.totalTasks) * 100) : 0}%
                  </div>
                </div>
                <button 
                  onClick={() => setActiveTab('projects')} 
                  className="w-full text-center bg-gray-900 hover:bg-gray-800 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-sm"
                >
                  Ouvrir mes espaces projets
                </button>
              </div>

            </div>
          </>
        )}

        {/* 🚀 ONGLET LISTE DES PROJETS */}
        {activeTab === 'projects' && (
          <ProjectsList onSelectProject={onSelectProject} />
        )}

        {/* 🚀 NEW : ONGLET CENTRALISÉ DES TÂCHES GLOBALES */}
        {activeTab === 'tasks' && (
          <MyTasksPage 
            currentUserId={user?._id || user?.id} 
            userRole={user?.role} 
            initialTasks={tasksList} 
          />
        )}

        {/* 🚀 ONGLET ÉQUIPE */}
        {activeTab === 'team' && <Team />}

        {/* 🚀 ONGLET PARAMÈTRES */}
        {activeTab === 'settings' && (
          <StudentParametres user={user} />
        )}

        {/* ONGLETS EN COURS DE DÉVELOPPEMENT (Pour les autres onglets restants de ta sidebar) */}
        {!['dashboard', 'projects', 'tasks', 'team', 'settings'].includes(activeTab) && (
          <div className="flex flex-col items-center justify-center h-[60vh] text-gray-400">
            <p className="text-lg font-semibold">La page "{activeTab}" est en cours de développement...</p>
          </div>
        )}


      </main>
    </div>
  );
}