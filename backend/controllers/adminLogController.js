const AdminLog = require('../models/adminLogModel');

exports.getAllLogs = async (req, res) => {
  try {
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
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: error.message,
    });
  }
};

exports.createLog = async (req, res) => {
  try {
    // This could be called internally or via API
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
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
};
