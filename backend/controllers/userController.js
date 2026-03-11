const User = require('../models/userModel');
const AdminLog = require('../models/adminLogModel');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

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

exports.getAllUsers = catchAsync(async (req, res, next) => {
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
});

exports.signup = catchAsync(async (req, res, next) => {
  // Check for admin pin if role is collegeAdmin
  if (req.body.role === 'collegeAdmin') {
    if (req.body.adminPin !== '1234') {
      return next(
        new AppError('Invalid Admin PIN for College Admin registration!', 400),
      );
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
    status: req.body.role === 'collegeAdmin' ? 'pending' : 'approved',
  });

  // Add Admin Log
  await AdminLog.create({
    action: `New user registered: ${newUser.name} as ${newUser.role}`,
    user: newUser._id,
  });

  // Handle based on status
  if (newUser.status === 'pending') {
    return res.status(201).json({
      status: 'success',
      message:
        'Registration successful! Please wait for the Super Admin to approve your account before you can log in.',
      data: {
        user: newUser,
      },
    });
  }

  createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400));
  }
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password!', 401));
  }

  if (user.status === 'pending') {
    return next(
      new AppError(
        'Your registration is pending approval from the Super Admin.',
        401,
      ),
    );
  }

  if (user.status === 'rejected') {
    return next(new AppError('Your registration has been rejected.', 401));
  }

  createSendToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
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
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401),
    );
  }

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError('The user belonging to this token no longer exist.', 401),
    );
  }

  req.user = currentUser;
  res.locals.user = currentUser;

  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          `You do not have permission to perform this action. Current role: ${req.user.role}`,
          403,
        ),
      );
    }
    next();
  };
};

exports.deleteUser = catchAsync(async (req, res, next) => {
  if (req.params.id === req.user.id) {
    return next(new AppError('You cannot delete yourself!', 400));
  }
  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }

  // Add Admin Log
  await AdminLog.create({
    action: `Deleted user: ${user.name} (${user.email}) by Super Admin`,
    user: req.user.id,
  });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.updateUserStatus = catchAsync(async (req, res, next) => {
  const { status } = req.body;
  if (!['approved', 'rejected'].includes(status)) {
    return next(
      new AppError('Invalid status provide. Use approved or rejected.', 400),
    );
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true, runValidators: true },
  );

  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }

  // Add Admin Log
  await AdminLog.create({
    action: `User ${user.name} (${user.email}) ${status} by Super Admin`,
    user: req.user.id,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

exports.updateLastViewedEvents = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, {
    lastViewedEventsAt: Date.now(),
  });

  res.status(200).json({
    status: 'success',
  });
});
