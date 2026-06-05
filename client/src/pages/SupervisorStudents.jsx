import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Mail, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SupervisorStudents({ supervisorId }) {
  const [projectGroups, setProjectGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/supervisor/students');
        if (response.data.success) {
          setProjectGroups(response.data.projects);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des étudiants :", error);
        toast.error("Impossible de charger les membres des équipes.");
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [supervisorId]);

  // Fonction pour générer une initiale propre
  const getInitials = (name) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] space-y-3">
        <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
        <p className="text-sm text-gray-500 font-medium">Chargement de vos effectifs étudiants...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-gray-900">Membres des Projets</h3>
        <p className="text-xs text-gray-400 font-medium">Consultez la liste complète des étudiants regroupés par projet.</p>
      </div>

      {projectGroups.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500 font-medium">Aucun étudiant ne vous est actuellement rattaché.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {projectGroups.map((group) => (
            <div key={group._id} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
              
              {/* En-tête du groupe de projet */}
              <div className="flex items-center justify-between border-b border-gray-50 pb-3">
                <h4 className="text-base font-bold text-gray-900">{group.name}</h4>
                <span className="bg-purple-50 text-purple-700 text-[11px] font-bold px-2.5 py-1 rounded-full">
                  {group.members?.length || 0} membre(s)
                </span>
              </div>

              {/* Grille des étudiants du projet */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {group.members && group.members.map((student) => (
                  <div 
                    key={student._id} 
                    className="flex items-center gap-4 p-4 bg-gray-50/60 border border-gray-100 rounded-xl hover:bg-gray-50 transition-all"
                  >
                    {/* Avatar avec initiales */}
                    <div className="w-10 h-10 bg-purple-100 text-purple-700 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 border border-purple-200">
                      {getInitials(student.fullName)}
                    </div>
                    
                    {/* Coordonnées de l'étudiant */}
                    <div className="space-y-0.5 min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">{student.fullName}</p>
                      <p className="text-xs text-gray-400 font-medium flex items-center gap-1.5 truncate">
                        <Mail size={12} className="shrink-0 text-gray-400" />
                        {student.email}
                      </p>
                    </div>
                  </div>
                ))}

                {(!group.members || group.members.length === 0) && (
                  <p className="text-xs text-gray-400 font-medium italic col-span-2 py-2">
                    Aucun étudiant n'a encore rejoint ce groupe de projet.
                  </p>
                )}
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}