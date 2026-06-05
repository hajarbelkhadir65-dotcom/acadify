import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Auth from './pages/Auth';
import StudentDashboard from './pages/StudentDashboard';
import SupervisorDashboard from './pages/SupervisorDashboard';
import ProjectDetails from './pages/ProjectDetails';
import MyTasksPage from './pages/MyTasksPage';
import Team from './pages/Team';

// 🌐 Configuration globale de l'API Axios
axios.defaults.baseURL = 'http://localhost:5000';

axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true); 
  const [currentProjectId, setCurrentProjectId] = useState(null);
  const [showGlobalTasks, setShowGlobalTasks] = useState(false);
  const [showTeam, setShowTeam] = useState(false);

  // 🔄 Charger l'utilisateur et synchroniser Axios au démarrage
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const handleLoginSuccess = (userData, token) => {
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', token);
    setCurrentUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setCurrentProjectId(null);
    setShowGlobalTasks(false);
    setShowTeam(false);
    setCurrentUser(null);
  };

  // Écran de chargement initial
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Chargement d'Acadify...</p>
        </div>
      </div>
    );
  }

  // 1. UTILISATEUR NON CONNECTÉ
  if (!currentUser) {
    return <Auth onLoginSuccess={handleLoginSuccess} />;
  }

  // 2. VÉRIFICATION DU RÔLE
  const isSupervisor = currentUser.role === 'supervisor' || currentUser.role === 'Encadrant';

  // 3. AFFICHAGE DES ÉCRANS ÉTUDIANTS (Si un ID ou état est actif)
  if (!isSupervisor) {
    if (currentProjectId) {
      return <ProjectDetails projectId={currentProjectId} onBack={() => setCurrentProjectId(null)} />;
    }

    if (showGlobalTasks) {
      return (
        <div className="bg-gray-50 min-h-screen">
          <button onClick={() => setShowGlobalTasks(false)} className="p-4 text-indigo-600 font-medium hover:underline">
            ← Retour au Dashboard
          </button>
          <MyTasksPage currentUserId={currentUser.id || currentUser._id} userRole={currentUser.role} />
        </div>
      );
    }

    if (showTeam) {
      return (
        <div className="bg-gray-50 min-h-screen">
          <button onClick={() => setShowTeam(false)} className="p-4 text-indigo-600 font-medium hover:underline">
            ← Retour au Dashboard
          </button>
          <Team />
        </div>
      );
    }
  }

  // 4. RENDU DES DASHBOARDS PRINCIPAUX
  return isSupervisor ? (
    <SupervisorDashboard user={currentUser} onLogout={handleLogout} />
  ) : (
    <StudentDashboard 
      user={currentUser} 
      setIsAuthenticated={handleLogout} // Conserve ta fonction de déconnexion
      onSelectProject={setCurrentProjectId}
      onNavigateToTasks={() => setShowGlobalTasks(true)}
      onNavigateToTeam={() => setShowTeam(true)}
    />
  );
}