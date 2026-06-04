import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function Team() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/projects/my-projects/teams', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProjects(res.data.projects);
      } catch (err) {
        console.error("Erreur chargement équipe:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTeams();
  }, []);

  if (loading) return <div className="p-8 text-center text-gray-500">Chargement de vos équipes...</div>;

  return (
    <div className="p-6 space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-extrabold text-gray-900">Gestion des équipes</h1>
        <p className="text-sm text-gray-500 font-medium">Découvrez les membres de vos projets académiques.</p>
      </div>
      
      {projects.length === 0 ? (
        <div className="text-center py-10 text-gray-400">Aucune équipe trouvée.</div>
      ) : (
        projects.map((project) => (
          <div key={project._id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h2 className="text-lg font-bold text-purple-700 mb-6 border-b pb-2">
              Projet : {project.name}
            </h2>

            {/* Section Superviseur */}
            <div className="mb-8">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Superviseur (Encadrant)</h3>
              <div className="bg-purple-50 p-4 rounded-xl border border-purple-100 w-full md:w-64">
                <p className="font-bold text-gray-900">{project.supervisor?.fullName || 'Non défini'}</p>
                <p className="text-sm text-purple-600">{project.supervisor?.email}</p>
              </div>
            </div>

            {/* Section Étudiants */}
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Étudiants / Coéquipiers</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {project.members.map((member) => (
                  <div key={member._id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:border-purple-200 transition-all">
                    <p className="font-bold text-gray-900">{member.fullName}</p>
                    <p className="text-sm text-gray-500">{member.email}</p>
                    <div className="mt-2">
                      <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-[10px] font-bold uppercase rounded-lg">
                        {member.role || 'Étudiant'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}