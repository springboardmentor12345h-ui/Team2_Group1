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
    let queryObj = { ...req.query };

    const excludedFields = ["page", "sort", "limit", "fields", "search"];
    excludedFields.forEach((el) => delete queryObj[el]);

    // Handle nested and unnested advanced filters (gte, gt, lte, lt)
    const cleanQuery = {};
    Object.keys(queryObj).forEach((key) => {
      // Helper to cast to Date if it's a date field
      const castValue = (field, val) => {
        if (
          ['startDate', 'endDate'].includes(field) &&
          typeof val === 'string'
        ) {
          const d = new Date(val);
          return isNaN(d.getTime()) ? val : d;
        }
        return val;
      };

      // Case 1: Unnested key like "endDate[gte]" (Simple parser)
      const bracketMatch = key.match(/^(.+)\[(gte|gt|lte|lt)\]$/);
      if (bracketMatch) {
        const [, field, op] = bracketMatch;
        if (!cleanQuery[field]) cleanQuery[field] = {};
        cleanQuery[field][`$${op}`] = castValue(field, queryObj[key]);
      }
      // Case 2: Already nested object like { endDate: { gte: '...' } } (Extended parser)
      else if (
        typeof queryObj[key] === 'object' &&
        queryObj[key] !== null &&
        !Array.isArray(queryObj[key])
      ) {
        cleanQuery[key] = {};
        Object.keys(queryObj[key]).forEach((op) => {
          if (['gte', 'gt', 'lte', 'lt'].includes(op)) {
            cleanQuery[key][`$${op}`] = castValue(key, queryObj[key][op]);
          } else {
            cleanQuery[key][op] = queryObj[key][op];
          }
        });
      }
      // Case 3: Simple key-value pair
      else {
        cleanQuery[key] = castValue(key, queryObj[key]);
      }
    });

    // Build aggregation pipeline
    const pipeline = [];

    // 1) Match stage (Filtering)
    pipeline.push({ $match: cleanQuery });

    // 2) Search stage
    if (req.query.search) {
      pipeline.push({
        $match: {
          $or: [
            { title: { $regex: req.query.search, $options: 'i' } },
            { description: { $regex: req.query.search, $options: 'i' } },
            { category: { $regex: req.query.search, $options: 'i' } },
          ],
        },
      });
    }

    // 3) Add comparison field for sorting
    pipeline.push({
      $addFields: {
        isUpcoming: { $gte: ['$endDate', new Date()] },
      },
    });

    // 4) Sorting
    const sortObj = { isUpcoming: -1 }; // ALWAYS Upcoming first

    if (req.query.sort) {
      req.query.sort.split(',').forEach((field) => {
        if (field.startsWith('-')) {
          sortObj[field.substring(1)] = -1;
        } else {
          sortObj[field] = 1;
        }
      });
    } else {
      // Default secondary sort: nearest start date
      sortObj.startDate = 1;
    }

    pipeline.push({ $sort: sortObj });

    // 5) Total Results Count (before pagination)
    const countPipeline = [...pipeline];
    countPipeline.push({ $count: 'total' });
    const countResult = await Event.aggregate(countPipeline);
    const totalResults = countResult.length > 0 ? countResult[0].total : 0;

    // 6) Pagination
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 6;
    const skip = (page - 1) * limit;
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: limit });

    // 7) Populate collegeId
    pipeline.push({
      $lookup: {
        from: 'users',
        localField: 'collegeId',
        foreignField: '_id',
        as: 'collegeId',
      },
    });
    pipeline.push({ $unwind: '$collegeId' });
    pipeline.push({
      $project: {
        'collegeId.password': 0,
        'collegeId.passwordConfirm': 0,
        'collegeId.__v': 0,
      },
    });

    const events = await Event.aggregate(pipeline);

    res.status(200).json({
      status: "success",
      results: events.length,
      totalResults,
      data: {
        events,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
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
    const event = await Event.findById(req.params.id);

    if (!event) {
      throw new Error('No event found with that ID');
    }

    // Authorization: superAdmin can update everything, collegeAdmin only their own
    if (
      req.user.role !== 'superAdmin' &&
      event.collegeId.toString() !== req.user.id
    ) {
      return res.status(403).json({
        status: 'fail',
        message: 'You are not allowed to update this event',
      });
    }

    if (req.file) {
      req.body.image = `/uploads/events/${req.file.filename}`;
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      },
    );

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

    if (!event) {
      throw new Error('No event found with that ID');
    }

    // Authorization: superAdmin can delete everything, collegeAdmin only their own
    if (
      req.user.role !== 'superAdmin' &&
      event.collegeId.toString() !== req.user.id
    ) {
      return res.status(403).json({
        status: 'fail',
        message: 'You are not allowed to delete this event',
      });
    }

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
