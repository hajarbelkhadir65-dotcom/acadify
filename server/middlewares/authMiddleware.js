const jwt = require('jsonwebtoken');

// Utilisez la même clé secrète que dans votre index.js
const JWT_SECRET = "acadify_secret_key_2026";

const authMiddleware = (req, res, next) => {
  // Récupérer le token du header Authorization (Format: Bearer <TOKEN>)
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: "Accès refusé. Aucun token fourni." });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Vérification du jeton
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // On injecte l'ID de l'utilisateur dans la requête pour pouvoir l'utiliser plus tard
    req.user = decoded; 
    
    next(); // On passe au contrôleur suivant
  } catch (error) {
    return res.status(401).json({ success: false, message: "Token invalide ou expiré." });
  }
};

module.exports = { authMiddleware };