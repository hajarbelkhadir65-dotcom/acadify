import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/SupervisorSidebar';
import SupervisorProjectList from '../pages/SupervisorProjectList';
import SupervisorStudents from '../pages/SupervisorStudents';
import SupervisorParametres from '../pages/SupervisorParametres';
import { 
  Search, 
  Bell, 
  FolderGit2, 
  CheckCircle2, 
  Clock, 
  TrendingUp,
  Loader2 
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function SupervisorDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // --- Notifications ---
  const [openNotifications, setOpenNotifications] = useState(false);
  const [notificationsList, setNotificationsList] = useState([]);
  const [notificationsUnreadCount, setNotificationsUnreadCount] = useState(0);

  // notifications: chargement
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const resNotif = await axios.get('/api/notifications/my', {
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
      await axios.patch(`/api/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const resNotif = await axios.get('/api/notifications/my', {
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





  // Récupération dynamique des KPI globaux pour la vue d'ensemble
  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoadingStats(true);
        const response = await axios.get('/api/supervisor/dashboard');
        if (response.data.success) {
          setStats(response.data.stats);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des statistiques globales :", error);
        toast.error("Impossible de charger les compteurs de statistiques.");
      } finally {
        setLoadingStats(false);
      }
    };

    if (activeTab === 'dashboard') {
      fetchDashboardStats();
    }
  }, [activeTab]);

  const getInitials = (name) => {
    if (!name) return 'PR';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-gray-900">
      
      {/* 1. Sidebar Violette Professionnelle */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        setIsAuthenticated={onLogout} 
      />

      {/* ZONE DE CONTENU PRINCIPALE */}
      <main className="flex-1 p-8 overflow-y-auto h-screen space-y-8">
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
                      n.isRead
                        ? 'bg-white border-transparent hover:bg-gray-50'
                        : 'bg-purple-50/60 border-purple-200 hover:bg-purple-50/60'
                    }`}
                  >
                    <p className={`text-sm font-bold ${n.isRead ? 'text-gray-800' : 'text-purple-700'}`}>{n.message}</p>
                    <p className="text-[10px] mt-1 text-gray-500">
                      {n.createdAt ? new Date(n.createdAt).toLocaleString('fr-FR') : ''}
                    </p>
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        {/* EN-TÊTE CHERCHER / PROFIL */}
        <header className="flex items-center justify-between">
          <div className="relative w-80">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400 pointer-events-none">
              <Search size={18} />
            </span>
            <input 
              type="text" 
              placeholder="Rechercher un projet, un étudiant..." 
              className="w-full pl-11 pr-4 py-2 bg-gray-100/80 border border-transparent rounded-xl text-sm focus:outline-none focus:bg-white focus:border-gray-200 transition-all"
            />
          </div>

          <div className="flex items-center gap-5">
            <button
              className="relative p-2 text-gray-400 hover:text-purple-600 bg-white border border-gray-100 rounded-xl shadow-sm transition-colors"
              onClick={() => setOpenNotifications((v) => !v)}
            >
              <Bell size={18} />
              {notificationsUnreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-purple-500 rounded-full"></span>
              )}
            </button>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center text-purple-700 font-bold text-sm border border-purple-200">
                {getInitials(user?.fullName)}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-bold text-gray-900 leading-tight">{user?.fullName || 'Professeur'}</p>
                <p className="text-xs text-gray-400 font-medium">Encadrant Acadify</p>
              </div>
            </div>
          </div>
        </header>

        {/* 2. AFFICHAGE CONDITIONNEL ET DYNAMIQUE DES COMPOSANTS */}
        
        {/* ONGLET 1 : DASHBOARD (VUE D'ENSEMBLE PROFESSIONNELLE) */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-fadeIn">
            <div className="space-y-1">
              <h2 className="text-2xl font-extrabold tracking-tight text-gray-900">Espace d'Encadrement</h2>
              <p className="text-sm text-gray-500 font-medium">Suivi en temps réel et performances de vos équipes.</p>
            </div>

            {loadingStats ? (
              <div className="flex flex-col items-center justify-center h-[30vh] space-y-2">
                <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
                <p className="text-xs text-gray-400 font-semibold">Calcul des indicateurs de performance...</p>
              </div>
            ) : (
              /* Grille de Cartes KPI */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                
                {/* Carte 1 : Total Projets */}
                <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Projets Supervisés</p>
                    <h3 className="text-3xl font-black text-gray-900">{stats?.totalProjects || 0}</h3>
                  </div>
                  <div className="p-3.5 bg-purple-50 text-purple-600 rounded-2xl">
                    <FolderGit2 size={24} />
                  </div>
                </div>

                {/* Carte 2 : Tâches Termines */}
                <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Tâches Finies</p>
                    <h3 className="text-3xl font-black text-emerald-600">{stats?.doneCount || 0}</h3>
                  </div>
                  <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-2xl">
                    <CheckCircle2 size={24} />
                  </div>
                </div>

                {/* Carte 3 : Tâches En cours */}
                <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">En cours (Équipes)</p>
                    <h3 className="text-3xl font-black text-amber-600">{stats?.inProgressCount || 0}</h3>
                  </div>
                  <div className="p-3.5 bg-amber-50 text-amber-600 rounded-2xl">
                    <Clock size={24} />
                  </div>
                </div>

                {/* Carte 4 : Taux de Réussite/Progression Global */}
                <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Avancement Global</p>
                    <h3 className="text-3xl font-black text-blue-600">
                      {stats?.totalTasks > 0 ? Math.round((stats.doneCount / stats.totalTasks) * 100) : 0}%
                    </h3>
                  </div>
                  <div className="p-3.5 bg-blue-50 text-blue-600 rounded-2xl">
                    <TrendingUp size={24} />
                  </div>
                </div>

              </div>
            )}

            {/* Section Informations Supplémentaires sous la grille */}
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-100/50 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <h4 className="text-sm font-bold text-purple-950">Prêt pour les évaluations ?</h4>
                <p className="text-xs text-purple-700/80 font-medium">Naviguez dans l'onglet "Mes Projets" pour inspecter en profondeur l'état des livrables de chaque groupe.</p>
              </div>
              <button 
                onClick={() => setActiveTab('projects')}
                className="px-4 py-2.5 bg-white border border-purple-200 text-purple-700 font-bold text-xs rounded-xl shadow-sm hover:bg-purple-50 transition-all shrink-0"
              >
                Voir mes projets
              </button>
            </div>
          </div>
        )}

        {/* ONGLET 2 : LISTE DES PROJETS */}
        {activeTab === 'projects' && (
          <SupervisorProjectList supervisorId={user?._id || user?.id} />
        )}

        {/* ONGLET 3 : LISTE DES ÉTUDIANTS */}
        {activeTab === 'students' && (
          <SupervisorStudents supervisorId={user?._id || user?.id} />
        )}

        {/* ONGLET 4 : PARAMÈTRES */}
        {activeTab === 'settings' && (
          <SupervisorParametres user={user} />
        )}

      </main>
    </div>
  );
}