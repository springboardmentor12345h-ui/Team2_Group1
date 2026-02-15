const AdminLog = require('../models/adminLogModel');

exports.getAllLogs = async (req, res) => {
  try {
    const logs = await AdminLog.find().populate('user', 'name role college');
    res.status(200).json({
      status: 'success',
      results: logs.length,
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
