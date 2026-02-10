const User = require('../models/userModel');

exports.getAllUsers = async (req, res) => {
  const users = await User.find();
  res.status(200).json({
    status: 'success',
    data: {
      users,
    },
  });
};

exports.createUser = async (req, res) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    college: req.body.college,
    role: req.body.role,
  });
  res.status(201).json({
    status: 'success',
    data: {
      user: newUser,
    },
  });
};
