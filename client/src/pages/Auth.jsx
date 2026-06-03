import React, { useState } from 'react';
import { User, Mail, Lock, Users, BarChart3, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import axios from 'axios'; // 🚀 Importation d'Axios pour le backend

export default function Auth({ onLoginSuccess }) { // <-- On reçoit une fonction pour signaler la connexion réussie
  const [activeTab, setActiveTab] = useState('login'); // Par défaut sur login pour tester plus vite
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Pour éviter le double-clic sur le bouton
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'student'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRoleChange = (roleValue) => {
    setFormData({ ...formData, role: roleValue });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // ==========================================
  // 🌐 SOUCHETAGE ET CONNEXION BACKEND
  // ==========================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // URL de ton futur serveur Node.js / Express
    const API_URL = 'http://localhost:5000/api/auth'; 
    const endpoint = activeTab === 'login' ? `${API_URL}/login` : `${API_URL}/register`;

    try {
      // Préparation des données à envoyer
      const payload = activeTab === 'login' 
        ? { email: formData.email, password: formData.password }
        : formData;

      // Envoi de la requête au serveur
      const response = await axios.post(endpoint, payload);

      if (response.data.success) {
        toast.success(activeTab === 'login' ? 'Connexion réussie ! 👋' : 'Compte créé avec succès ! 🎉');
        
        // Sauvegarde du jeton de sécurité (JWT) reçu du backend
        localStorage.setItem('token', response.data.token);
        
        // On transmet les vraies données de l'utilisateur connecté à l'application
        if (onLoginSuccess) {
          onLoginSuccess(response.data.user);
        }
      }
    } catch (error) {
      // Gestion des erreurs du serveur (ex: Mot de passe incorrect, email déjà utilisé...)
      const errorMessage = error.response?.data?.message || 'Une erreur est survenue. Réessayez.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const iconClass = "absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400 pointer-events-none";

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between font-sans selection:bg-purple-500 selection:text-white">
      <Toaster position="top-center" reverseOrder={false} />

      <div className="flex-1 flex flex-col md:flex-row">
        
        {/* --- PARTIE GAUCHE --- */}
        <div 
          className="hidden md:flex md:w-1/2 bg-cover bg-center p-12 flex-col justify-between relative"
          style={{ backgroundImage: "url('/photo.png')" }}
        >
          <div className="absolute inset-0 bg-neutral-900/70 backdrop-blur-[2px]"></div>
          
          <div className="flex items-center gap-3 z-10 opacity-80">
            <span className="text-sm font-semibold tracking-wider uppercase text-purple-300">Espace de travail</span>
          </div>

          <div className="my-auto z-10 flex flex-col items-center justify-center text-center w-full">
            <div className="max-w-md space-y-4">
              <h1 className="text-4xl font-extrabold text-white tracking-tight drop-shadow-md">
                Bienvenue sur Acadify
              </h1>
              <p className="text-gray-200 text-base font-medium leading-relaxed drop-shadow-sm">
                Gerez vos projets academiques, collaborez en equipe et suivez votre progression simplement.
              </p>
            </div>
          </div>

          <div className="text-xs text-gray-400 z-10">
            © {new Date().getFullYear()} Acadify Inc. Tous droits reserves.
          </div>
        </div>

        {/* --- PARTIE DROITE --- */}
        <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 md:px-12 bg-white">
          <div className="w-full max-w-md space-y-6">
            
            {/* Logo */}
            <div className="flex flex-col items-center md:items-start gap-2 mb-4">
              <img 
                src="/logo.png" 
                alt="Logo Acadify" 
                className="h-20 w-20 object-contain rounded-2xl shadow-md border border-purple-100" 
              />
            </div>

            {/* Onglets */}
            <div className="space-y-4">
              <div className="space-y-1">
                <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
                  {activeTab === 'register' ? 'Creer un compte' : 'De retour parmi nous !'}
                </h2>
                <p className="text-sm text-gray-500">
                  {activeTab === 'register' ? 'Rejoignez Acadify pour piloter vos projets efficacement.' : 'Connectez-vous pour acceder a votre espace.'}
                </p>
              </div>
              
              <div className="grid grid-cols-2 bg-gray-100 p-1 rounded-full text-sm font-medium">
                <button 
                  type="button"
                  onClick={() => setActiveTab('login')}
                  className={`py-2 px-4 rounded-full transition-all ${activeTab === 'login' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                  Se connecter
                </button>
                <button 
                  type="button"
                  onClick={() => setActiveTab('register')}
                  className={`py-2 px-4 rounded-full transition-all ${activeTab === 'register' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                  Creer un compte
                </button>
              </div>
            </div>

            {/* Formulaire */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {activeTab === 'register' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 tracking-wide uppercase">Nom complet</label>
                  <div className="relative">
                    <span className={iconClass}><User size={16} /></span>
                    <input
                      type="text"
                      name="fullName"
                      required={activeTab === 'register'}
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="John Doe"
                      className="w-full pl-11 pr-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#9333ea] focus:border-transparent transition-all placeholder:text-gray-400 text-gray-900"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 tracking-wide uppercase">Adresse email</label>
                <div className="relative">
                  <span className={iconClass}><Mail size={16} /></span>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="nom@universite.com"
                    className="w-full pl-11 pr-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#9333ea] focus:border-transparent transition-all placeholder:text-gray-400 text-gray-900"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 tracking-wide uppercase">Mot de passe</label>
                <div className="relative">
                  <span className={iconClass}><Lock size={16} /></span>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-12 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#9333ea] focus:border-transparent transition-all placeholder:text-gray-400 text-gray-900"
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-400 hover:text-purple-600 transition-colors focus:outline-none"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {activeTab === 'register' && (
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-500 tracking-wide uppercase">Vous etes ?</label>
                  <div className="grid grid-cols-2 gap-3">
                    <div
                      onClick={() => handleRoleChange('student')}
                      className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                        formData.role === 'student' ? 'border-[#9333ea] bg-purple-50/30' : 'border-gray-100 bg-gray-50/30 hover:border-gray-200'
                      }`}
                    >
                      <div className="flex-1">
                        <p className="text-sm font-bold text-gray-900">Etudiant</p>
                        <p className="text-[11px] text-gray-400 leading-snug">Travaillez sur vos projets</p>
                      </div>
                      <div className={`w-4 h-4 rounded-full border mt-1 flex items-center justify-center ${formData.role === 'student' ? 'border-[#9333ea] bg-[#9333ea]' : 'border-gray-300'}`}>
                        {formData.role === 'student' && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                      </div>
                    </div>

                    <div
                      onClick={() => handleRoleChange('supervisor')}
                      className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                        formData.role === 'supervisor' ? 'border-[#9333ea] bg-purple-50/30' : 'border-gray-100 bg-gray-50/30 hover:border-gray-200'
                      }`}
                    >
                      <div className="flex-1">
                        <p className="text-sm font-bold text-gray-900">Superviseur</p>
                        <p className="text-[11px] text-gray-400 leading-snug">Suivez & guidez vos eleves</p>
                      </div>
                      <div className={`w-4 h-4 rounded-full border mt-1 flex items-center justify-center ${formData.role === 'supervisor' ? 'border-[#9333ea] bg-[#9333ea]' : 'border-gray-300'}`}>
                        {formData.role === 'supervisor' && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'login' && (
                <div className="flex items-center justify-between text-sm pt-1">
                  <label className="flex items-center gap-2 text-gray-600 cursor-pointer select-none">
                    <input type="checkbox" className="rounded text-[#9333ea] focus:ring-[#9333ea] h-4 w-4 border-gray-300" />
                    Se souvenir de moi
                  </label>
                  <a href="#" className="font-semibold text-[#9333ea] hover:underline">Mot de passe oublie ?</a>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3 px-4 bg-[#9333ea] hover:bg-[#7e2ccf] text-white font-semibold rounded-xl text-sm shadow-md shadow-purple-600/10 transition-colors focus:outline-none focus:ring-4 focus:ring-purple-200 disabled:opacity-50"
              >
                {isLoading ? 'Chargement...' : activeTab === 'login' ? 'Se connecter' : 'Creer mon compte'}
              </button>
            </form>

            {/* Séparateur */}
            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-gray-100"></div>
              <span className="flex-shrink mx-4 text-xs text-gray-400 uppercase tracking-wider">ou continuer avec</span>
              <div className="flex-grow border-t border-gray-100"></div>
            </div>

            {/* Boutons Sociaux */}
            <div className="grid grid-cols-2 gap-3">
              <button 
                type="button" 
                onClick={() => toast('Connexion Google bientôt disponible ! 🚀', { icon: '🌐' })}
                className="flex items-center justify-center gap-2.5 py-2.5 px-4 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50/80 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-100"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                <span>Google</span>
              </button>

              <button 
                type="button" 
                onClick={() => toast('Connexion Microsoft bientôt disponible ! 🚀', { icon: '💻' })}
                className="flex items-center justify-center gap-2.5 py-2.5 px-4 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50/80 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-100"
              >
                <svg className="h-4.5 w-4.5" viewBox="0 0 23 23" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0 0h11v11H0z" fill="#f25022" />
                  <path d="M12 0h11v11H12z" fill="#7fba00" />
                  <path d="M0 12h11v11H0z" fill="#00a4ef" />
                  <path d="M12 12h11v11H12z" fill="#ffb900" />
                </svg>
                <span>Microsoft</span>
              </button>
            </div>

            <div className="text-center text-sm text-gray-600 pt-2">
              {activeTab === 'login' ? "Vous n'avez pas de compte ? " : "Deja inscrit ? "}
              <button
                type="button"
                onClick={() => setActiveTab(activeTab === 'login' ? 'register' : 'login')}
                className="font-bold text-[#9333ea] hover:underline focus:outline-none"
              >
                {activeTab === 'login' ? "S'inscrire" : 'Se connecter'}
              </button>
            </div>

          </div>
        </div>

      </div>

      {/* --- FOOTER --- */}
      <div className="border-t border-gray-100 bg-gray-50/50 py-4 px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-center items-center gap-x-12 gap-y-2 text-xs font-medium text-gray-500">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-emerald-500" /> <span><strong className="text-gray-700">Securise :</strong> Donnees protegees</span>
          </div>
          <div className="flex items-center gap-2">
            <Users size={16} className="text-purple-500" /> <span><strong className="text-gray-700">Collaboratif :</strong> Travail d'equipe</span>
          </div>
          <div className="flex items-center gap-2">
            <BarChart3 size={16} className="text-amber-500" /> <span><strong className="text-gray-700">Productif :</strong> Atteignez vos objectifs</span>
          </div>
        </div>
      </div>
    </div>
  );
}