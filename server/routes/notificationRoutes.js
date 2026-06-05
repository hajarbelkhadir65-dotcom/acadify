const express = require('express');
const router = express.Router();

const authMiddleware = require('../middlewares/authMiddleware');
const Notification = require('../models/Notification');

router.use(authMiddleware);

// Liste des notifications de l'utilisateur connecté
router.get('/my', async (req, res) => {
  try {
    const userId = req.user.id;

    const notifications = await Notification.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate('project', 'name')
      .populate('task', 'title')
      .select('type message isRead createdAt project task role createdBy');

    const unreadCount = await Notification.countDocuments({ user: userId, isRead: false });

    res.json({
      success: true,
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.error('Erreur GET /api/notifications/my:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

// Marquer une notification comme lue
router.patch('/:id/read', async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const notification = await Notification.findOne({ _id: id, user: userId });
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification introuvable.' });
    }

    notification.isRead = true;
    await notification.save();

    res.json({ success: true, message: 'Notification marquée comme lue.' });
  } catch (error) {
    console.error('Erreur PATCH /api/notifications/:id/read:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

module.exports = router;

