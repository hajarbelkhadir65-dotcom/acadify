import React from "react";
import {
  LayoutDashboard,
  FolderGit2,
  Users,
  Settings,
  LogOut,
} from "lucide-react";

export default function SupervisorSidebar({
  activeTab,
  setActiveTab,
  setIsAuthenticated, // Reçu de ton App.jsx pour la déconnexion
}) {
  // Liste complète et dynamique des menus pour l'encadrant
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "projects", label: "Projets Supervisés", icon: FolderGit2 },
    { id: "students", label: "Mes Étudiants", icon: Users },
    { id: "settings", label: "Paramètres", icon: Settings },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-100 flex flex-col justify-between p-6 h-screen sticky top-0 shrink-0">
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-purple-600">Acadify</h1>
          <p className="text-xs text-gray-400 font-medium">
            Espace Encadrant
          </p>
        </div>

        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
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
        onClick={setIsAuthenticated} // Appelle handleLogout du parent
        className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all"
      >
        <LogOut size={18} />
        <span>Déconnexion</span>
      </button>
    </aside>
  );
}