import React, { useState } from 'react';
import Auth from './pages/Auth';
import StudentDashboard from './pages/StudentDashboard';
import ProjectDetails from './pages/ProjectDetails';
import MyTasksPage from './pages/MyTasksPage'; // 🚀 AJOUT : Import de ta page de tâches

export default function App() {
  // 🔄 INITIALISATION : Utilisateur stocké dans le localStorage
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // 📂 ÉTATS DE NAVIGATION
  const [currentProjectId, setCurrentProjectId] = useState(null);
  const [showGlobalTasks, setShowGlobalTasks] = useState(false); // 🚀 AJOUT : Savoir si on est sur l'onglet "Tâches" global

  // Fonction déclenchée après une connexion ou inscription réussie
  const handleLoginSuccess = (userData, token) => {
    console.log("Données utilisateur reçues du backend :", userData);
    
    localStorage.setItem('user', JSON.stringify(userData));
    if (token) localStorage.setItem('token', token);

    const cleanUser = {
      ...userData,
      stats: userData?.stats || { activeProjects: 5, totalTasks: 24, inProgressTasks: 12, pendingReview: 6 },
      deadline: userData?.deadline || { title: 'Research Paper - Final Draft', projectName: 'AI Research Project', priority: 'high', dueDate: 'Jan 22, 2026', daysLeft: 4 },
      project: userData?.project || { name: 'AI Research Project', membersCount: 4, status: 'In Progress', progressPercentage: 75 }
    };

    setCurrentUser(cleanUser);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setCurrentProjectId(null);
    setShowGlobalTasks(false); // Réinitialise la vue au logout
    setCurrentUser(null);
  };

  // 1. ÉCRAN D'AUTHENTIFICATION (Si non connecté)
  if (!currentUser) {
    return <Auth onLoginSuccess={(data, token) => handleLoginSuccess(data, token)} />;
  }

  // 2. ÉCRAN DÉTAILS PROJET (Si un projet est cliqué)
  if (currentProjectId) {
    return (
      <ProjectDetails 
        projectId={currentProjectId} 
        onBack={() => setCurrentProjectId(null)} 
      />
    );
  }

  // 3. 🚀 ÉCRAN DE TOUTES LES TÂCHES GLOBALES
  // Si l'étudiant clique sur "Tâches" dans la sidebar, on affiche cette page
  if (showGlobalTasks) {
    return (
      <div className="flex bg-gray-50 min-h-screen">
        {/* On peut wrapper MyTasksPage ici ou lui passer un bouton retour/sidebar */}
        <div className="flex-1">
          {/* Bouton temporaire ou barre de retour pour revenir au dashboard principal */}
          <div className="p-4 bg-white border-b border-gray-200 flex justify-between items-center">
            <button 
              onClick={() => setShowGlobalTasks(false)} 
              className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
            >
              ← Retour au Tableau de bord
            </button>
            <button onClick={handleLogout} className="text-sm text-red-500 font-medium">Déconnexion</button>
          </div>
          
          <MyTasksPage 
            currentUserId={currentUser._id || currentUser.id} 
            userRole={currentUser.role} 
          />
        </div>
      </div>
    );
  }

  // 4. ÉCRAN PAR DÉFAUT : Dashboard classique
  return (
    <StudentDashboard 
      user={currentUser} 
      setIsAuthenticated={handleLogout} 
      onSelectProject={(id) => setCurrentProjectId(id)}
      onNavigateToTasks={() => setShowGlobalTasks(true)} // 👈 🚀 Nouvelle prop envoyée à ton Dashboard pour capter le clic sur la Sidebar !
    />
  );
}