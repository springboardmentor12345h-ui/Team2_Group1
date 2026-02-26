const mongoose = require('mongoose');

const adminLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: [true, 'A log must have an action description'],
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'A log must belong to a user'],
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const AdminLog = mongoose.model('AdminLog', adminLogSchema);

module.exports = AdminLog;
