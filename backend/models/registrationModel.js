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
    default: true,
  },
  attendanceStatus: {
    type: String,
    enum: ['pending', 'absent', 'present'],
    default: 'pending',
  },
  admitCardCode: {
    type: String,
    unique: true,
  },
  isCertificateIssued: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

registrationSchema.pre('save', async function () {
  if (this.admitCardCode) return;

  // Generate unique 6 digit admit card code (alphanumeric uppercase)
  let code;
  let isUnique = false;
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  
  while (!isUnique) {
    code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    const existing = await this.constructor.findOne({ admitCardCode: code });
    if (!existing) isUnique = true;
  }
  this.admitCardCode = code;
  console.log(`Generated Admit Card Code: ${code} for registration ${this._id}`);
});

const Registration = mongoose.model('Registration', registrationSchema);

module.exports = Registration;
