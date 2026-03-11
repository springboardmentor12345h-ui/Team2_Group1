const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Event',
    required: [true, 'A registration must belong to an event'],
  },
  studentId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'A registration must belong to a student'],
  },
  adminId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'A registration must belong to an admin'],
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  isStudentRead: {
    type: Boolean,
    default: true, // true by default because on creation, student knows they registered
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Registration = mongoose.model('Registration', registrationSchema);

module.exports = Registration;
