import React, { useState, useEffect } from 'react';
import Auth from './pages/Auth';
import StudentDashboard from './pages/StudentDashboard';
import SupervisorDashboard from './pages/SupervisorDashboard'; // Importez votre nouveau dashboard
import ProjectDetails from './pages/ProjectDetails';
import MyTasksPage from './pages/MyTasksPage';
import Team from './pages/Team';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true); // État de chargement pour éviter les erreurs "undefined"
  const [currentProjectId, setCurrentProjectId] = useState(null);
  const [showGlobalTasks, setShowGlobalTasks] = useState(false);
  const [showTeam, setShowTeam] = useState(false);

  // 🔄 Charger l'utilisateur au démarrage
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

  // Tant qu'on vérifie le localStorage, on affiche un écran de chargement
  if (loading) return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;

  // 1. NON CONNECTÉ
  if (!currentUser) {
    return <Auth onLoginSuccess={handleLoginSuccess} />;
  }

  // 2. ÉCRAN DÉTAILS PROJET
  if (currentProjectId) {
    return <ProjectDetails projectId={currentProjectId} onBack={() => setCurrentProjectId(null)} />;
  }

  // 3. ÉCRAN TÂCHES GLOBALES
  if (showGlobalTasks) {
    return (
      <div className="flex bg-gray-50 min-h-screen">
        <div className="flex-1">
          <button onClick={() => setShowGlobalTasks(false)} className="p-4 text-indigo-600">← Retour</button>
          <MyTasksPage currentUserId={currentUser._id} userRole={currentUser.role} />
        </div>
      </div>
    );
  }

  // 4. ÉCRAN ÉQUIPE
  if (showTeam) {
    return (
      <div className="flex bg-gray-50 min-h-screen">
        <div className="flex-1">
          <button onClick={() => setShowTeam(false)} className="p-4 text-indigo-600">← Retour</button>
          <Team />
        </div>
      </div>
    );
  }

  // 5. DASHBOARD CONDITIONNEL (Superviseur vs Étudiant)
  const isSupervisor = currentUser.role === 'supervisor' || currentUser.role === 'Encadrant';

  return isSupervisor ? (
    <SupervisorDashboard user={currentUser} onLogout={handleLogout} />
  ) : (
    <StudentDashboard 
      user={currentUser} 
      setIsAuthenticated={handleLogout} 
      onSelectProject={setCurrentProjectId}
      onNavigateToTasks={() => setShowGlobalTasks(true)}
      onNavigateToTeam={() => setShowTeam(true)}
    />
  );
}