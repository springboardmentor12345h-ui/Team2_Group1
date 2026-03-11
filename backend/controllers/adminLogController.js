const AdminLog = require('../models/adminLogModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getAllLogs = catchAsync(async (req, res, next) => {
  // Basic pagination
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 100;
  const skip = (page - 1) * limit;

  const query = AdminLog.find()
    .sort('-timestamp')
    .populate('user', 'name role college');

  // Get total count
  const totalResults = await AdminLog.countDocuments();

  const logs = await query.skip(skip).limit(limit);

  res.status(200).json({
    status: 'success',
    results: logs.length,
    totalResults,
    data: {
      logs,
    },
  });
});

exports.createLog = catchAsync(async (req, res, next) => {
  if (!req.body.action) {
    return next(new AppError('Please provide an action for the log.', 400));
  }

  const newLog = await AdminLog.create({
    action: req.body.action,
    user: req.user.id,
  });

  res.status(201).json({
    status: 'success',
    data: {
      log: newLog,
    },
  });
});
