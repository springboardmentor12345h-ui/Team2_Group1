const Registration = require('../models/registrationModel');
const Event = require('../models/eventModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.createRegistration = catchAsync(async (req, res, next) => {
  const { eventId } = req.body;

  // Check if event exists
  const event = await Event.findById(eventId);
  if (!event) {
    return next(new AppError('No event found with that ID', 404));
  }

  // Ensure student hasn't already registered
  const existingRegistration = await Registration.findOne({
    eventId,
    studentId: req.user.id,
  });

  if (existingRegistration) {
    return next(new AppError('You are already registered for this event', 400));
  }

  const newRegistration = await Registration.create({
    eventId,
    studentId: req.user.id,
    adminId: event.collegeId, // the admin who created the event
    status: 'pending',
    isRead: false,
  });

  res.status(201).json({
    status: 'success',
    data: {
      registration: newRegistration,
    },
  });
});

exports.getAdminRegistrations = catchAsync(async (req, res, next) => {
  // Check if current user is an admin
  if (req.user.role !== 'collegeAdmin' && req.user.role !== 'superAdmin') {
    return next(new AppError('Only admins can view these registrations', 403));
  }

  // For collegeAdmins, show only their registrations. For superAdmins, show all.
  const filter = {};
  if (req.user.role === 'collegeAdmin') {
    filter.adminId = req.user.id;
  }

  // Basic pagination
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 10;
  const skip = (page - 1) * limit;

  const totalResults = await Registration.countDocuments(filter);

  const registrations = await Registration.find(filter)
    .populate('studentId', 'name email college')
    .populate('eventId', 'title startDate')
    .sort('-createdAt')
    .skip(skip)
    .limit(limit);

  res.status(200).json({
    status: 'success',
    results: registrations.length,
    totalResults,
    data: {
      registrations,
    },
  });
});

exports.markAsRead = catchAsync(async (req, res, next) => {
  const registration = await Registration.findByIdAndUpdate(
    req.params.id,
    { isRead: true },
    { new: true, runValidators: true },
  );

  if (!registration) {
    return next(new AppError('No registration found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      registration,
    },
  });
});

exports.updateRegistrationStatus = catchAsync(async (req, res, next) => {
  const { status } = req.body;
  if (!['approved', 'rejected'].includes(status)) {
    return next(
      new AppError('Invalid status. Use approved or rejected.', 400),
    );
  }

  const registration = await Registration.findById(req.params.id)
    .populate('studentId', 'name email')
    .populate('eventId', 'title')
    .populate('adminId', 'college');

  if (!registration) {
    return next(new AppError('No registration found with that ID', 404));
  }

  // Authorization: Host admin can update, SuperAdmin can update any (based on user request, SuperAdmins are NOT allowed to accept/reject registrations)
  // Wait, the user reverted my change where SuperAdmins could accept/reject. 
  // Step Id 408 shows they reverted it to:
  /*
  if (req.user.role === 'superAdmin') {
      throw new Error(
        'SuperAdmins are not authorized to accept or reject registrations',
      );
    }
  */
  // So I must stick to that.
  
  if (req.user.role === 'superAdmin') {
    return next(new AppError('SuperAdmins are not authorized to accept or reject registrations', 403));
  }

  if (registration.adminId._id.toString() !== req.user.id) {
    return next(
      new AppError('Only the host college admin can update this registration', 403),
    );
  }

  registration.status = status;
  registration.isRead = true;
  registration.isStudentRead = false; // Notify student
  await registration.save();

  // Send notification/email
  console.log('📬 Preparing to send email notification...');
  const sendEmail = require('../utils/email');
  const { getRegistrationStatusTemplate } = require('../utils/emailTemplates');

  try {
    const html = getRegistrationStatusTemplate(
      registration.studentId.name,
      registration.eventId.title,
      status,
      registration.adminId.college,
    );

    const message = `Dear ${registration.studentId.name},\n\nYour registration for the event "${registration.eventId.title}" has been ${status}.\n\nBest regards,\nCampusEventHub Team`;

    console.log('📤 Sending email to student...');
    await sendEmail({
      email: registration.studentId.email,
      subject: `Registration ${status.toUpperCase()}: ${registration.eventId.title}`,
      message,
      html,
    });
    console.log('✅ Email process completed.');
  } catch (err) {
    console.error('❌ Email notification failed:', err.message);
  }

  res.status(200).json({
    status: 'success',
    data: {
      registration,
    },
  });
});

exports.getStudentRegistrations = catchAsync(async (req, res, next) => {
  const registrations = await Registration.find({ studentId: req.user.id })
    .populate(
      'eventId',
      'title startDate endDate image category location collegeId',
    )
    .populate('adminId', 'name college')
    .sort('-createdAt');

  res.status(200).json({
    status: 'success',
    results: registrations.length,
    data: {
      registrations,
    },
  });
});

exports.deleteRegistration = catchAsync(async (req, res, next) => {
  const registration = await Registration.findById(req.params.id);

  if (!registration) {
    return next(new AppError('No registration found with that ID', 404));
  }

  // Auth check: SuperAdmin can delete anything, CollegeAdmin only their own
  if (
    req.user.role !== 'superAdmin' &&
    registration.adminId.toString() !== req.user.id
  ) {
    return next(new AppError('You are not authorized to delete this registration', 403));
  }

  await Registration.findByIdAndDelete(req.params.id);

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.markRegistrationAsReadByStudent = catchAsync(async (req, res, next) => {
  const registration = await Registration.findOneAndUpdate(
    { _id: req.params.id, studentId: req.user.id },
    { isStudentRead: true },
    { new: true },
  );

  if (!registration) {
    return next(new AppError('No registration found with that ID for this student', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      registration,
    },
  });
});
