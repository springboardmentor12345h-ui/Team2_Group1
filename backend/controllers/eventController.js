const Event = require('../models/eventModel');
const AdminLog = require('../models/adminLogModel');
const Registration = require('../models/registrationModel');
const { Parser } = require('json2csv');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit-table');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

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
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadEventImage = upload.single('image');

exports.getAllEvents = catchAsync(async (req, res, next) => {
  let queryObj = { ...req.query };

  const excludedFields = ['page', 'sort', 'limit', 'fields', 'search'];
  excludedFields.forEach((el) => delete queryObj[el]);

  // Handle nested and unnested advanced filters (gte, gt, lte, lt)
  const cleanQuery = {};
  Object.keys(queryObj).forEach((key) => {
    // Helper to cast to Date if it's a date field
    const castValue = (field, val) => {
      if (['startDate', 'endDate'].includes(field) && typeof val === 'string') {
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
    status: 'success',
    results: events.length,
    totalResults,
    data: {
      events,
    },
  });
});

exports.createEvent = catchAsync(async (req, res, next) => {
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
});

exports.getEvent = catchAsync(async (req, res, next) => {
  const event = await Event.findById(req.params.id).populate(
    'collegeId',
    'name college',
  );

  if (!event) {
    return next(new AppError('No event found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      event,
    },
  });
});

exports.updateEvent = catchAsync(async (req, res, next) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    return next(new AppError('No event found with that ID', 404));
  }

  // Authorization: superAdmin can update everything, collegeAdmin only their own
  if (
    req.user.role !== 'superAdmin' &&
    event.collegeId.toString() !== req.user.id
  ) {
    return next(new AppError('You are not allowed to update this event', 403));
  }

  if (req.file) {
    req.body.image = `/uploads/events/${req.file.filename}`;
  }

  const updatedEvent = await Event.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  // Add Admin Log
  await AdminLog.create({
    action: `Updated event: ${updatedEvent.title} by ${req.user.name}`,
    user: req.user.id,
  });

  res.status(200).json({
    status: 'success',
    data: {
      event: updatedEvent,
    },
  });
});

exports.deleteEvent = catchAsync(async (req, res, next) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    return next(new AppError('No event found with that ID', 404));
  }

  // Authorization: superAdmin can delete everything, collegeAdmin only their own
  if (
    req.user.role !== 'superAdmin' &&
    event.collegeId.toString() !== req.user.id
  ) {
    return next(new AppError('You are not allowed to delete this event', 403));
  }

  await Event.findByIdAndDelete(req.params.id);

  // Add Admin Log
  await AdminLog.create({
    action: `Deleted event: ${event.title} by ${req.user.name}`,
    user: req.user.id,
  });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.exportParticipants = catchAsync(async (req, res, next) => {
  const { id: eventId } = req.params;
  const { format = 'csv' } = req.query;

  // 1. Verify the event exists
  const event = await Event.findById(eventId).populate('collegeId', 'college');
  if (!event) {
    return next(new AppError('No event found with that ID', 404));
  }

  // 2. Check authorization
  if (
    req.user.role !== 'superAdmin' &&
    event.collegeId?._id?.toString() !== req.user.id
  ) {
    return next(new AppError("You are not authorized to export this event's participants.", 403));
  }

  // 3. Fetch all registrations for this event
  const registrations = await Registration.find({ eventId })
    .populate('studentId', 'name email college')
    .sort('-createdAt');

  if (!registrations || registrations.length === 0) {
    return next(new AppError('No participants found for this event.', 404));
  }

  const fileName = `participants-${event.title.replace(/\s+/g, '_')}-${new Date().toISOString().split('T')[0]}`;

  // 4. Map registrations to standardized rows
  const rows = registrations.map((reg, index) => ({
    "S.No": index + 1,
    "Student Name": reg.studentId?.name || "N/A",
    "Email": reg.studentId?.email || "N/A",
    "College": reg.studentId?.college || "N/A",
    "Status": reg.status ? reg.status.toUpperCase() : "N/A",
    "Registered At": new Date(reg.createdAt).toLocaleString()
  }));

  // 5. Handle different formats
  if (format === 'csv') {
    const fields = ["S.No", "Student Name", "Email", "College", "Status", "Registered At"];
    const parser = new Parser({ fields });
    const csv = parser.parse(rows);

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}.csv"`);
    return res.status(200).end(csv);
  }

  if (format === 'xlsx') {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Participants');

    worksheet.columns = [
      { header: 'S.No', key: 'S.No', width: 10 },
      { header: 'Student Name', key: 'Student Name', width: 30 },
      { header: 'Email', key: 'Email', width: 35 },
      { header: 'College', key: 'College', width: 30 },
      { header: 'Status', key: 'Status', width: 15 },
      { header: 'Registered At', key: 'Registered At', width: 25 }
    ];

    // Style the header
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };

    worksheet.addRows(rows);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}.xlsx"`);

    await workbook.xlsx.write(res);
    return res.status(200).end();
  }

  if (format === 'pdf') {
    const doc = new PDFDocument({ margin: 30, size: 'A4' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}.pdf"`);

    doc.pipe(res);

    // Header
    doc.fontSize(20).text('Event Participants Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Event: ${event.title}`, { bold: true });
    doc.text(`Host: ${event.collegeId?.college || 'N/A'}`);
    doc.text(`Date of Export: ${new Date().toLocaleString()}`);
    doc.moveDown();

    // Table
    const table = {
      title: "Participants List",
      subtitle: `Total Registrations: ${registrations.length}`,
      headers: ["S.No", "Student Name", "Email", "College", "Status"],
      rows: rows.map(r => [r["S.No"], r["Student Name"], r["Email"], r["College"], r["Status"]])
    };

    await doc.table(table, {
      prepareHeader: () => doc.font('Helvetica-Bold').fontSize(10),
      prepareRow: (row, indexColumn, indexRow, rectRow, rectCell) => {
        doc.font('Helvetica').fontSize(10);
      },
    });

    doc.end();
    return;
  }

  return next(new AppError('Invalid export format', 400));
});
