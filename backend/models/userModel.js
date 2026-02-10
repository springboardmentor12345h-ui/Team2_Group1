const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide your name!'],
    minlength: [3, 'A name must have more or equal than 3 characters'],
    maxlength: [40, 'A name must have less or equal than 40 characters'],
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email address!'],
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      validator: function (val) {
        return val === this.password;
      },
      message: 'Passwords do not match!',
    },
  },
  college: {
    type: String,
    trim: true,
    required: [true, 'Please provide your college name!'],
  },
  role: {
    type: String,
    enum: ['student', 'collegeAdmin', 'superAdmin'],
    default: 'student',
  },
});

userSchema.pre('save', async function () {
  this.passwordConfirm = undefined;
});

const User = mongoose.model('User', userSchema);

module.exports = User;
