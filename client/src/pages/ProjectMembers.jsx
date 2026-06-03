import React, { useState, useEffect } from 'react';
import { Mail, Shield, UserPlus, X, Loader2, CheckCircle } from 'lucide-react';
import axios from 'axios';

const ProjectMembers = ({ projectId, currentUserId, userRole }) => {
  const [supervisor, setSupervisor] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // États pour la Modal d'invitation
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [modalLoading, setModalLoading] = useState(false);
  const [modalSuccess, setModalSuccess] = useState('');
  const [modalError, setModalError] = useState('');

  // Charger les membres au montage du composant
  useEffect(() => {
    fetchMembers();
  }, [projectId]);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/projects/${projectId}/members`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setSupervisor(response.data.supervisor);
        setMembers(response.data.members || []);
      }
    } catch (err) {
      console.error("Erreur lors du chargement des membres", err);
      setError("Impossible de charger les membres du projet.");
    } finally {
      setLoading(false);
    }
  };

  // Soumission de l'invitation
  const handleInviteSubmit = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    setModalError('');
    setModalSuccess('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `http://localhost:5000/api/projects/${projectId}/members/add`,
        { email: inviteEmail },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setModalSuccess(response.data.message);
        setMembers([...members, response.data.newMember]); // Ajouter le membre à la liste locale
        setInviteEmail('');
        // Ferme la modal après 1.5 seconde automatiquement
        setTimeout(() => {
          setIsModalOpen(false);
          setModalSuccess('');
        }, 1500);
      }
    } catch (err) {
      setModalError(err.response?.data?.message || "Une erreur est survenue lors de l'invitation.");
    } finally {
      setModalLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-gray-400 gap-2">
        <Loader2 className="animate-spin" size={20} /> Chargement des membres...
      </div>
    );
  }

  // Vérification des droits : l'encadrant ne peut pas inviter d'étudiants
  const isEncadrant = userRole === 'supervisor' || userRole === 'Encadrant';

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* --- SECTION ENCADRANT --- */}
      {supervisor ? (
        <div>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Encadrant du projet
          </h3>
          <div className="bg-gradient-to-r from-amber-50/60 to-orange-50/20 border border-amber-100 rounded-2xl p-4 flex items-center justify-between shadow-sm max-w-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-700 font-bold uppercase">
                {supervisor.fullName?.charAt(0)}
              </div>
              <div>
                <h4 className="font-bold text-gray-900 capitalize">{supervisor.fullName}</h4>
                <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                  <Mail size={12} /> {supervisor.email}
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 flex items-center gap-1">
              <Shield size={12} /> Encadrant
            </span>
          </div>
        </div>
      ) : (
        <div className="text-sm text-amber-600 bg-amber-50 border border-amber-100 rounded-xl p-3 max-w-xl">
          Aucun encadrant n'est assigné à ce projet pour le moment.
        </div>
      )}

      {/* --- SECTION ÉTUDIANTS --- */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Étudiants / Coéquipiers ({members.length})
          </h3>
          
          {/* Seuls les étudiants peuvent inviter d'autres coéquipiers */}
          {!isEncadrant && (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-2 rounded-xl transition-all shadow-sm"
            >
              <UserPlus size={14} /> Inviter un membre
            </button>
          )}
        </div>

        {members.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 shadow-sm text-gray-400">
            Aucun coéquipier dans ce projet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {members.map((member) => (
              <div 
                key={member._id} 
                className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center justify-between shadow-sm hover:border-gray-200 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold uppercase">
                    {member.fullName?.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 capitalize">
                      {member.fullName} {member._id === currentUserId && <span className="text-xs font-normal text-gray-400">(Moi)</span>}
                    </h4>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                      <Mail size={12} /> {member.email}
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-50 text-gray-500 border border-gray-100">
                  Étudiant
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ==================================================== */}
      {/* ➕ FENÊTRE MODALE : INVITER UN COÉQUIPIER            */}
      {/* ==================================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900">Inviter un coéquipier</h3>
              <button 
                onClick={() => { setIsModalOpen(false); setModalError(''); setModalSuccess(''); }}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleInviteSubmit} className="p-5 space-y-4">
              {modalError && (
                <div className="p-2.5 text-xs font-medium text-red-600 bg-red-50 border border-red-100 rounded-xl">
                  {modalError}
                </div>
              )}
              {modalSuccess && (
                <div className="p-2.5 text-xs font-medium text-green-600 bg-green-50 border border-green-100 rounded-xl flex items-center gap-1.5">
                  <CheckCircle size={14} /> {modalSuccess}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Adresse Email de l'étudiant
                </label>
                <input
                  type="email"
                  required
                  placeholder="exemple@etudiant.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  disabled={modalLoading || modalSuccess}
                  className="w-full text-sm rounded-xl border border-gray-200 p-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-gray-800 disabled:bg-gray-50"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  disabled={modalLoading}
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 disabled:opacity-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={modalLoading || modalSuccess}
                  className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                >
                  {modalLoading && <Loader2 className="animate-spin" size={14} />}
                  Ajouter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectMembers;