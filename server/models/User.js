const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'student' },
  stats: {
    activeProjects: { type: Number, default: 3 },
    totalTasks: { type: Number, default: 18 },
    inProgressTasks: { type: Number, default: 8 },
    pendingReview: { type: Number, default: 2 }
  },
  deadline: {
    title: { type: String, default: 'Livrable Spécifications UI' },
    projectName: { type: String, default: 'Acadify Project' },
    priority: { type: String, default: 'high' },
    dueDate: { type: String, default: 'Juin 15, 2026' },
    daysLeft: { type: Number, default: 13 }
  },
  project: {
    name: { type: String, default: 'Acadify Web Application' },
    membersCount: { type: Number, default: 3 },
    status: { type: String, default: 'In Progress' },
    progressPercentage: { type: Number, default: 45 }
  }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);