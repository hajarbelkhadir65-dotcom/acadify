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

    // Normaliser selon le schéma attendu dans les contrôleurs (req.user.id)
    req.user = {
      ...decoded,
      id: decoded.id || decoded._id,
      role: decoded.role,
    };

    if (!req.user.id) {
      return res.status(401).json({ success: false, message: "Token invalide: id manquant." });
    }

    next(); // On passe au contrôleur suivant
  } catch (error) {
    const errName = error?.name || 'JWT_ERROR';
    const errMsg = error?.message || '';
    return res.status(401).json({
      success: false,
      message: "Token invalide ou expiré.",
      debug: { errName, errMsg },
    });
  }
};

// Tout en bas de authMiddleware.js, remplace par :
module.exports = authMiddleware;