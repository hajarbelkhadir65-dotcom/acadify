import React from "react";
import {
  LayoutDashboard,
  FolderGit2,
  CheckSquare,
  Users,
  MessageSquare,
  LogOut,
} from "lucide-react";

export default function Sidebar({
  activeTab,
  setActiveTab,
  setIsAuthenticated,
  onNavigateToTeam,   // 👈 Prop ajoutée pour le chaînage
  onNavigateToTasks,  // 👈 Prop ajoutée pour le chaînage
}) {
  const menuItems = [
    { id: "dashboard", label: "Tableau de bord", icon: LayoutDashboard },
    { id: "projects", label: "Projets", icon: FolderGit2 },
    { id: "tasks", label: "Tâches", icon: CheckSquare },
    { id: "team", label: "Équipe", icon: Users },
    { id: "settings", label: "Paramètres", icon: MessageSquare },
  ];

  const handleMenuClick = (item) => {
    setActiveTab(item.id); // Met à jour l'état visuel actif

    // Gestion de la navigation selon l'élément cliqué
    if (item.id === "team" && onNavigateToTeam) {
      onNavigateToTeam();
    } else if (item.id === "tasks" && onNavigateToTasks) {
      onNavigateToTasks();
    }
    // Pour "dashboard" et "projects", ils restent gérés par setActiveTab 
    // ou la logique interne du StudentDashboard.
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    if (typeof setIsAuthenticated === "function") {
      setIsAuthenticated(false);
    }
    window.location.href = "/";
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-100 flex flex-col justify-between p-6 h-screen sticky top-0">
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-purple-600">Acadify</h1>
          <p className="text-xs text-gray-400 font-medium">Projets Académiques</p>
        </div>

        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleMenuClick(item)} // 👈 Utilisation du gestionnaire de clic
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${
                  isActive
                    ? "bg-purple-50 text-purple-600 font-bold"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <button
        onClick={handleLogout}
        className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all"
      >
        <LogOut size={18} />
        <span>Déconnexion</span>
      </button>
    </aside>
  );
}