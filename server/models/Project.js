const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  startDate: { type: String, required: true },
  endDate: { type: String, required: true },
  status: { type: String, default: 'En cours' },
  progressPercentage: { type: Number, default: 0 },
  
  // Le créateur du projet
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // Tableau contenant les ID des membres inscrits
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  
  // L'ID du superviseur (professeur)
  supervisor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Project', ProjectSchema);