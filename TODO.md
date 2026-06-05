# TODO - Notifications Acadify

## Étape 1 — Backend (modèle & routes)
- [ ] Créer `server/models/Notification.js`
- [ ] Créer `server/routes/notificationRoutes.js` (GET my + PATCH mark read)
- [ ] Enregistrer les routes dans `server/index.js`

## Étape 2 — Backend (déclencheurs métier)
- [ ] Dans `projectController.createProject` :
  - [ ] Notification encadrant (Nouveau projet)
  - [ ] Notifications étudiants (Invitation)
- [ ] Dans `taskController.updateTaskStatus` :
  - [ ] Notification encadrant (Tâche terminée)
  - [ ] Notifications étudiants coéquipiers (Tâche terminée)
- [ ] Dans `projectController.updateProject` :
  - [ ] Notification encadrant (Projet clôturé)
  - [ ] Notifications étudiants (Célébration fin de projet)

## Étape 3 — Frontend (UI notifications)
- [ ] Dans `client/src/pages/StudentDashboard.jsx` :
  - [ ] Charger notifications (GET /api/notifications/my)
  - [ ] Badge nombre non-lus
  - [ ] Dropdown modal liste + mark read

## Étape 4 — Encadrant UI
- [ ] Mettre à jour `client/src/pages/SupervisorDashboard.jsx` de la même façon (si non déjà fait)

## Étape 5 — Tests
- [ ] Vérifier 6 messages exacts sur scénario :
  - [ ] Création projet
  - [ ] Passage tâche en Done
  - [ ] Passage projet en Terminé

