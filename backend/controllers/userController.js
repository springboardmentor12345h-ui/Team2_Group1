const User = require('../models/userModel');
const AdminLog = require('../models/adminLogModel');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);

  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

exports.getAllUsers = async (req, res) => {
  try {
    // 1) Filtering
    const queryObj = { ...req.query };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);

    // 2) Basic pagination
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 100;
    const skip = (page - 1) * limit;

    const query = User.find(queryObj);

    // Get total count for the filtered query
    const totalResults = await User.countDocuments(queryObj);

    const users = await query.skip(skip).limit(limit);

    res.status(200).json({
      status: 'success',
      results: users.length,
      totalResults,
      data: {
        users,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message,
    });
  }
};

exports.signup = async (req, res) => {
  try {
    // Check for admin pin if role is collegeAdmin
    if (req.body.role === 'collegeAdmin') {
      if (req.body.adminPin !== '1234') {
        throw new Error('Invalid Admin PIN for College Admin registration!');
      }
    }

    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
      college: req.body.college,
      role: req.body.role,
      adminPin: req.body.adminPin,
    });

    // Add Admin Log
    await AdminLog.create({
      action: `New user registered: ${newUser.name} as ${newUser.role}`,
      user: newUser._id,
    });

    createSendToken(newUser, 201, res);
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message,
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throw new Error('Please provide email and password!');
    }
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.correctPassword(password, user.password))) {
      throw new Error('Incorrect email or password!');
    }
    createSendToken(user, 200, res);
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message,
    });
  }
};

exports.protect = async (req, res, next) => {
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt) {
      token = req.cookies.jwt;
    }

    if (!token) {
      throw new Error('You are not logged in! Please log in to get access.');
    }

    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      throw new Error('The user belonging to this token no longer exist.');
    }

    req.user = currentUser;
    res.locals.user = currentUser;

    next();
  } catch (error) {
    res.status(401).json({
      status: 'error',
      message: error.message,
    });
  }
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: 'You do not have permission to perform this action',
      });
    }
    next();
  };
};
