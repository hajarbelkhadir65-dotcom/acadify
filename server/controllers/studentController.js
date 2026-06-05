const User = require('../models/User');
const bcrypt = require('bcryptjs');

exports.updateStudentProfile = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { fullName, email, currentPassword, newPassword } = req.body;

    const user = await User.findById(studentId);
    if (!user) {
      return res.status(404).json({ success: false, message: "Utilisateur non trouvé." });
    }

    // Changement de mot de passe si demandé
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          message: "Veuillez fournir votre mot de passe actuel pour le modifier."
        });
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: "Mot de passe actuel incorrect."
        });
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    // Mise à jour champs optionnels
    if (fullName) user.fullName = fullName;

    if (email) {
      // Optionnel simple: éviter duplication d'email
      const emailExists = await User.findOne({ email: email.trim(), _id: { $ne: user._id } });
      if (emailExists) {
        return res.status(400).json({ success: false, message: "Cet email est déjà utilisé." });
      }
      user.email = email;
    }

    await user.save();

    const updatedUser = {
      _id: user._id,
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role
    };

    return res.status(200).json({
      success: true,
      message: "Profil mis à jour avec succès !",
      user: updatedUser
    });
  } catch (error) {
    console.error('Erreur dans updateStudentProfile:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du profil.',
      error: error.message
    });
  }
};

