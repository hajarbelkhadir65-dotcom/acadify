const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

// 🚀 IMPORTS DES MODÈLES
const User = require('./models/User'); 
// (Le modèle Project n'a plus besoin d'être ici puisqu'il sera géré dans son propre contrôleur)

// 🔌 IMPORTS DES ROUTEURS MODULAIRES
const projectRoutes = require('./routes/projectRoutes');
const taskRoutes = require('./routes/taskRoutes'); // 🚀 AJOUT : Import des routes pour les tâches
const dashboardRoutes = require('./routes/dashboardRoutes');
const supervisorRoutes = require('./routes/supervisorRoutes');
const studentRoutes = require('./routes/studentRoutes');
const app = express();
const PORT = 5000;
const JWT_SECRET = "acadify_secret_key_2026";
app.get('/api/test', (req, res) => {
    res.send("Le serveur répond !");
});
// Middlewares globaux
app.use(cors());
app.use(express.json());

// ==========================================
// 🔌 CONNEXION À MONGOOSE (BASE DE DONNÉES)
// ==========================================
mongoose.connect('mongodb://localhost:27017/acadify_db')
  .then(() => console.log('🍃 Connecté avec succès à MongoDB !'))
  .catch((err) => console.error('❌ Erreur de connexion MongoDB :', err));


// ==========================================
// 🌐 BRANCHEMENT DES ROUTEURS MODULAIRES
// ==========================================
// Toutes les requêtes HTTP qui commencent par /api/projects iront dans ton fichier route
app.use('/api/projects', projectRoutes);

// 🚀 AJOUT : Toutes les requêtes HTTP qui commencent par /api/tasks iront dans ton fichier taskRoutes

app.use('/api/tasks', taskRoutes); // 👈 C'est cette ligne qui donne le préfixe "/api/tasks"
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/supervisor', supervisorRoutes);
app.use('/api/student', studentRoutes);
// ==========================================
// 🌐 ROUTE : INSCRIPTION (REGISTER)
// ==========================================
app.post('/api/auth/register', async (req, res) => {
  try {
    const { fullName, email, password, role } = req.body;

    // 1. Chercher si l'utilisateur existe déjà en BDD
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'Cet email est déjà utilisé.' });
    }

    // 2. Hachage du mot de passe
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Sauvegarde dans MongoDB
    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
      role
    });
    await newUser.save();

    // 4. Jeton JWT
    const token = jwt.sign({ id: newUser._id }, JWT_SECRET, { expiresIn: '24h' });
    
    const userWithoutPassword = newUser.toObject();
    delete userWithoutPassword.password;

    res.status(201).json({ success: true, token, user: userWithoutPassword });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Erreur serveur lors de la création.' });
  }
});


// ==========================================
// 🌐 ROUTE : CONNEXION (LOGIN)
// ==========================================
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Chercher l'utilisateur par email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: 'Identifiants incorrects.' });
    }

    // 2. Vérifier le mot de passe haché
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Identifiants incorrects.' });
    }

    // 3. Jeton JWT
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '24h' });

    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password;

    res.json({ success: true, token, user: userWithoutPassword });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur lors de la connexion.' });
  }
});


// 🚀 ÉCOUTE DU PORT (Toujours tout à la fin)
app.listen(PORT, () => console.log(`🚀 Serveur actif sur http://localhost:${PORT}`));