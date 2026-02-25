const Event = require('../models/eventModel');
const AdminLog = require('../models/adminLogModel');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/events';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split('/')[1];
    cb(null, `event-${req.user.id}-${Date.now()}.${ext}`);
  },
});

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new Error('Not an image! Please upload only images.'), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadEventImage = upload.single('image');

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
      // Default: Upcoming first (nearest first), then past
      // We'll use a trick or just sort by startDate but we really need a way to push past events down.
      // Since MongoDB .sort() is limited on computed fields, we'll keep startDate but the frontend
      // can pass endDate[gte] to filter.
      query = query.sort('startDate');
    }

    // 4) Pagination & Limit
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 100;
    const skip = (page - 1) * limit;

    // Get total count for pagination (with current filters/search)
    const totalResults = await Event.countDocuments(query.getFilter());

    query = query.skip(skip).limit(limit);

    const events = await query;

    res.status(200).json({
      status: 'success',
      results: events.length,
      totalResults,
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

    if (req.file) {
      req.body.image = `/uploads/events/${req.file.filename}`;
    }

    const newEvent = await Event.create(req.body);

    // Add Admin Log
    await AdminLog.create({
      action: `Created new event: ${newEvent.title} by ${req.user.name}`,
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
    if (req.file) {
      req.body.image = `/uploads/events/${req.file.filename}`;
    }

    const event = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    // Add Admin Log
    if (event) {
      await AdminLog.create({
        action: `Updated event: ${event.title} by ${req.user.name}`,
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
        action: `Deleted event: ${event.title} by ${req.user.name}`,
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
