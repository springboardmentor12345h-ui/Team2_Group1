const Event = require('../models/eventModel');
const AdminLog = require('../models/adminLogModel');

exports.getAllEvents = async (req, res) => {
  try {
    // 1) Filtering
    const queryObj = { ...req.query };
    const excludedFields = ['page', 'sort', 'limit', 'fields', 'search'];
    excludedFields.forEach((el) => delete queryObj[el]);

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    let query = Event.find(JSON.parse(queryStr)).populate(
      'collegeId',
      'name college',
    );

    // 2) Search
    if (req.query.search) {
      query = query.find({
        $or: [
          { title: { $regex: req.query.search, $options: 'i' } },
          { description: { $regex: req.query.search, $options: 'i' } },
          { category: { $regex: req.query.search, $options: 'i' } },
        ],
      });
    }

    // 3) Sorting
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-startDate');
    }

    const events = await query;

    res.status(200).json({
      status: 'success',
      results: events.length,
      data: {
        events,
      },
    });
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: error.message,
    });
  }
};

exports.createEvent = async (req, res) => {
  try {
    // Automatically set collegeId from the logged in user
    if (!req.body.collegeId) req.body.collegeId = req.user.id;

    const newEvent = await Event.create(req.body);

    // Add Admin Log
    await AdminLog.create({
      action: `Created new event: ${newEvent.title}`,
      user: req.user.id,
    });

    res.status(201).json({
      status: 'success',
      data: {
        event: newEvent,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
};

exports.getEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate(
      'collegeId',
      'name college',
    );
    res.status(200).json({
      status: 'success',
      data: {
        event,
      },
    });
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: error.message,
    });
  }
};

exports.updateEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    // Add Admin Log
    if (event) {
      await AdminLog.create({
        action: `Updated event: ${event.title}`,
        user: req.user.id,
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        event,
      },
    });
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: error.message,
    });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    await Event.findByIdAndDelete(req.params.id);

    // Add Admin Log
    if (event) {
      await AdminLog.create({
        action: `Deleted event: ${event.title}`,
        user: req.user.id,
      });
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: error.message,
    });
  }
};
