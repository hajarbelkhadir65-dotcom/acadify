import React, { useState, useEffect } from 'react';
import SupervisorSidebar from '../components/SupervisorSidebar';
import axios from 'axios';

// Composant pour les cartes statistiques
const StatCard = ({ title, value, colorClass }) => (
  <div className={`p-6 rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow`}>
    <p className="text-sm font-medium text-gray-500">{title}</p>
    <h3 className={`text-3xl font-bold mt-2 ${colorClass}`}>{value}</h3>
  </div>
);

const SupervisorDashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/supervisor/my-projects', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProjects(res.data.projects);
      } catch (err) { console.error(err); }
    };
    fetchProjects();
  }, []);

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <SupervisorSidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={onLogout} />
      
      <main className="flex-1 p-8 overflow-y-auto">
        {/* En-tête professionnel */}
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Bienvenue, {user?.fullName}</h1>
            <p className="text-slate-500 text-sm">Gérez vos projets et suivez vos étudiants.</p>
          </div>
          <div className="flex items-center gap-4">
            <button className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-indigo-700 transition-colors">
              + Créer un projet
            </button>
          </div>
        </header>

        {/* Grille de stats */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <StatCard title="Total Projets" value={projects.length} colorClass="text-indigo-600" />
          <StatCard title="En cours" value={projects.filter(p => p.status === 'En cours').length} colorClass="text-emerald-600" />
          <StatCard title="Total Étudiants" value={18} colorClass="text-blue-600" />
          <StatCard title="À réviser" value={2} colorClass="text-amber-600" />
        </section>

        {/* Contenu principal */}
        <section className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-slate-900">Activités Récentes</h2>
            <button className="text-indigo-600 font-semibold text-sm">Voir tout</button>
          </div>
          
          <div className="space-y-4">
            {projects.map((p) => (
              <div key={p._id} className="grid grid-cols-4 items-center p-4 rounded-xl border border-gray-50 hover:bg-slate-50 transition-colors">
                <div className="col-span-2 font-medium text-slate-800">{p.name}</div>
                <div className="text-sm text-slate-500">Superviseur</div>
                <div className="text-right">
                  <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold uppercase">{p.status}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default SupervisorDashboard;