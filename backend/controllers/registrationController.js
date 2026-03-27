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
  const filter = { ...req.query };
  delete filter.page;
  delete filter.limit;
  delete filter.sort;

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
    return next(new AppError('Invalid status. Use approved or rejected.', 400));
  }

  const registration = await Registration.findById(req.params.id)
    .populate('studentId', 'name email')
    .populate('eventId', 'title startDate location')
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
    return next(
      new AppError(
        'SuperAdmins are not authorized to accept or reject registrations',
        403,
      ),
    );
  }

  if (registration.adminId._id.toString() !== req.user.id) {
    return next(
      new AppError(
        'Only the host college admin can update this registration',
        403,
      ),
    );
  }

  registration.status = status;
  registration.isRead = true;
  registration.isStudentRead = false; // Notify student

  // Save and capture the updated document (to get the generated admitCardCode)
  const savedRegistration = await registration.save();
  // Update local reference so subsequent code uses the same data
  Object.assign(registration, savedRegistration.toObject());

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

    const info = await sendEmail({
      email: registration.studentId.email,
      subject: `Registration ${status.toUpperCase()}: ${registration.eventId.title}`,
      message,
      html,
    });

    if (info?.previewUrl) {
      console.log(`✉️ [PREVIEW] Registration Status Notification: ${info.previewUrl}`);
    }

    // If approved, send Admit Card email as well
    if (status === 'approved') {
      const { getAdmitCardTemplate } = require('../utils/emailTemplates');
      const admitHtml = getAdmitCardTemplate(
        registration.studentId.name,
        registration.eventId.title,
        registration.eventId.location,
        registration.eventId.startDate,
        registration.admitCardCode,
      );

      console.log(
        `📤 Sending admit card email with code: ${registration.admitCardCode}`,
      );
      const admitInfo = await sendEmail({
        email: registration.studentId.email,
        subject: `Your Admit Card: ${registration.eventId.title}`,
        message: `Your registration is approved. Your admit card code is ${registration.admitCardCode || 'Contact Support'}`,
        html: admitHtml,
      });

      if (admitInfo?.previewUrl) {
        console.log(`🎫 [PREVIEW] Admit Card Email: ${admitInfo.previewUrl}`);
      }
    }

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
    return next(
      new AppError('You are not authorized to delete this registration', 403),
    );
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
    return next(
      new AppError('No registration found with that ID for this student', 404),
    );
  }

  res.status(200).json({
    status: 'success',
    data: {
      registration,
    },
  });
});

exports.verifyAttendance = catchAsync(async (req, res, next) => {
  const { admitCardCode } = req.body;

  const registration = await Registration.findOne({ admitCardCode })
    .populate('studentId', 'name email college')
    .populate('eventId', 'title startDate location')
    .populate('adminId', 'college');

  if (!registration) {
    return next(new AppError('Invalid Admit Card Code', 404));
  }

  if (registration.status !== 'approved') {
    return next(new AppError('This registration is not approved yet', 400));
  }

  if (registration.attendanceStatus === 'present') {
    return next(
      new AppError('Attendance already marked for this student', 400),
    );
  }

  // Authorization check
  if (
    req.user.role !== 'superAdmin' &&
    registration.adminId._id.toString() !== req.user.id
  ) {
    return next(
      new AppError(
        'You are not authorized to mark attendance for this event',
        403,
      ),
    );
  }

  registration.attendanceStatus = 'present';
  await registration.save();

  // Send Notification Email
  const sendEmail = require('../utils/email');
  try {
    const { getAttendanceMarkedTemplate } = require('../utils/emailTemplates');
    const info = await sendEmail({
      email: registration.studentId.email,
      subject: `Attendance Verified: ${registration.eventId.title}`,
      html: getAttendanceMarkedTemplate(
        registration.studentId.name,
        registration.eventId.title,
        registration.eventId.location,
        registration.eventId.startDate,
      ),
    });

    if (info?.previewUrl) {
      console.log(`✅ [PREVIEW] Attendance Notification: ${info.previewUrl}`);
    }
  } catch (err) {
    console.error('Attendance email failed:', err.message);
  }

  res.status(200).json({
    status: 'success',
    message: 'Attendance marked successfully',
    data: { registration },
  });
});

exports.issueCertificate = catchAsync(async (req, res, next) => {
  const registration = await Registration.findById(req.params.id)
    .populate('studentId', 'name email')
    .populate('eventId', 'title startDate location')
    .populate('adminId', 'college');

  if (!registration) {
    return next(new AppError('No registration found', 404));
  }

  if (registration.attendanceStatus !== 'present') {
    return next(
      new AppError(
        'Certificates can only be issued to students who attended the event',
        400,
      ),
    );
  }

  if (registration.isCertificateIssued) {
    return next(
      new AppError('Certificate already issued for this student', 400),
    );
  }

  // Auth check
  if (
    req.user.role !== 'superAdmin' &&
    registration.adminId._id.toString() !== req.user.id
  ) {
    return next(
      new AppError('Not authorized to issue certificates for this event', 403),
    );
  }

  registration.isCertificateIssued = true;
  registration.isStudentRead = false;
  await registration.save();

  const sendEmail = require('../utils/email');
  const { getCertificateTemplate } = require('../utils/emailTemplates');

  const certHtml = getCertificateTemplate(
    registration.studentId.name,
    registration.eventId.title,
    registration.adminId.college,
    registration.eventId.startDate,
  );

  const info = await sendEmail({
    email: registration.studentId.email,
    subject: `Certificate Issued: ${registration.eventId.title}`,
    message: `Congratulations! Your certificate for ${registration.eventId.title} has been issued.`,
    html: certHtml,
  });

  console.log('\n========================================');
  console.log('🎓 [SUCCESS] CERTIFICATE ISSUANCE');
  console.log(`👤 Student: ${registration.studentId.name}`);
  if (info?.previewUrl) {
    console.log(`🎓 [PREVIEW] Certificate Issuance Notification: ${info.previewUrl}`);
  }
  console.log('========================================\n');

  res.status(200).json({
    status: 'success',
    message: 'Certificate issued and student notified',
  });
});

exports.downloadCertificate = catchAsync(async (req, res, next) => {
  const registration = await Registration.findById(req.params.id)
    .populate('studentId', 'name')
    .populate('eventId', 'title startDate location')
    .populate('adminId', 'college');

  if (!registration) {
    return next(new AppError('Registration not found', 404));
  }

  // Auth
  if (
    registration.studentId._id.toString() !== req.user.id &&
    req.user.role !== 'superAdmin'
  ) {
    return next(new AppError('Not authorized', 403));
  }

  if (!registration.isCertificateIssued) {
    return next(new AppError('Certificate has not been issued yet', 400));
  }

  try {
    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 0 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=Certificate-${registration.eventId?._id}.pdf`,
    );

    doc.pipe(res);

    // Certificate Border
    doc.rect(20, 20, 802, 555).lineWidth(15).stroke('#1e293b');
    doc.rect(40, 40, 762, 515).lineWidth(2).stroke('#e2e8f0');

    // Content
    // Title
    doc
      .fillColor('#1e293b')
      .fontSize(54)
      .font('Times-Bold')
      .text('CERTIFICATE', 0, 100, { align: 'center', characterSpacing: 6 });
    doc
      .fillColor('#64748b')
      .fontSize(22)
      .font('Times-Italic')
      .text('of Participation', 0, 170, { align: 'center' });

    // Middle Text
    doc
      .fillColor('#64748b')
      .fontSize(16)
      .font('Times-Roman')
      .text('This is to certify that', 0, 230, { align: 'center' });

    // Name
    const name = (registration.studentId?.name || 'STUDENT').toUpperCase();
    doc
      .fillColor('#4f46e5')
      .fontSize(42)
      .font('Times-Bold')
      .text(name, 0, 270, { align: 'center' });

    // Underline for name
    const nameWidth = doc.widthOfString(name);
    const centerX = (doc.page.width - nameWidth) / 2;
    doc
      .strokeColor('#e2e8f0')
      .lineWidth(1)
      .moveTo(centerX - 30, 315)
      .lineTo(centerX + nameWidth + 30, 315)
      .stroke();

    // Event/College description - Using dynamic positioning to prevent overlap
    const margin = 60;
    const width = doc.page.width - margin * 2;
    let currentY = 360;

    doc.fillColor('#64748b').fontSize(16).font('Times-Roman').text('has successfully participated in', margin, currentY, { width, align: 'center' });
    currentY += 25;
    
    doc.fillColor('#1e293b').fontSize(24).font('Times-Bold').text(registration.eventId?.title || 'Unknown Event', margin, currentY, { width, align: 'center' });
    // Calculate how much space the title took (in case it wrapped)
    const titleHeight = doc.heightOfString(registration.eventId?.title || 'Unknown Event', { width, align: 'center' });
    currentY += titleHeight + 10;
    
    doc.fillColor('#64748b').fontSize(14).font('Times-Roman').text(`organized by ${registration.adminId?.college || 'Unknown College'}`, margin, currentY, { width, align: 'center' });
    currentY += 20;
    
    doc.fillColor('#64748b').fontSize(14).font('Times-Roman').text(`on ${new Date(registration.eventId?.startDate).toLocaleDateString()}.`, margin, currentY, { width, align: 'center' });

    doc.end();
  } catch (err) {
    console.error('❌ Certificate Generation Error:', err);
    if (!res.headersSent) {
      res
        .status(500)
        .json({
          status: 'error',
          message: 'Failed to generate certificate PDF',
        });
    }
  }
});

exports.downloadAdmitCard = catchAsync(async (req, res, next) => {
  const registration = await Registration.findById(req.params.id)
    .populate('studentId', 'name _id')
    .populate('eventId', 'title startDate location description');

  if (!registration) {
    return next(new AppError('Registration not found', 404));
  }

  // Authorization check
  if (
    registration.studentId?._id.toString() !== req.user.id &&
    req.user.role !== 'superAdmin' &&
    req.user.role !== 'collegeAdmin'
  ) {
    return next(new AppError('Not authorized', 403));
  }

  if (registration.status !== 'approved') {
    return next(
      new AppError(
        'Can only download admit card for approved registrations',
        400,
      ),
    );
  }

  if (!registration.eventId) {
    return next(
      new AppError('Event details not found. It might have been deleted.', 404),
    );
  }

  // If code is missing, generate it now
  if (!registration.admitCardCode) {
    const saved = await registration.save();
    registration.admitCardCode = saved.admitCardCode;
  }

  try {
    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument({ size: 'A4', margin: 50 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=AdmitCard-${registration.admitCardCode || 'CODE'}.pdf`,
    );

    doc.pipe(res);

    // Background
    doc.rect(0, 0, doc.page.width, doc.page.height).fill('#f8fafc');

    // Header
    doc.rect(50, 50, 500, 80).fill('#1e293b');
    doc
      .fillColor('#ffffff')
      .fontSize(24)
      .font('Helvetica-Bold')
      .text('EVENT ADMIT CARD', 70, 75);
    doc.fontSize(10).font('Helvetica').text('CAMPUS EVENT HUB', 70, 105);

    // Content
    doc
      .fillColor('#1e293b')
      .fontSize(14)
      .font('Helvetica-Bold')
      .text('STUDENT DETAILS', 50, 160);
    doc.moveTo(50, 180).lineTo(550, 180).stroke('#e2e8f0');

    doc.fontSize(10).font('Helvetica').text('NAME', 50, 200);
    doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .text((registration.studentId?.name || 'STUDENT').toUpperCase(), 50, 215);

    doc.fontSize(10).font('Helvetica').text('EVENT', 50, 250);
    doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .text(registration.eventId?.title || 'Unknown Event', 50, 265);

    doc.fontSize(10).font('Helvetica').text('VENUE', 300, 250);
    doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .text(registration.eventId?.location || 'Unknown Venue', 300, 265);

    doc.fontSize(10).font('Helvetica').text('DATE', 50, 300);
    doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .text(
        registration.eventId?.startDate
          ? new Date(registration.eventId.startDate).toLocaleDateString()
          : 'TBD',
        50,
        315,
      );

    // Code Box
    doc
      .rect(50, 370, 500, 100)
      .lineWidth(2)
      .dash(5, { space: 5 })
      .stroke('#4f46e5');
    doc.undash();

    doc
      .fillColor('#4f46e5')
      .fontSize(10)
      .font('Helvetica-Bold')
      .text('UNIQUE VERIFICATION CODE', 0, 390, {
        align: 'center',
        width: doc.page.width,
      });
    doc
      .fontSize(36)
      .font('Courier-Bold')
      .text(registration.admitCardCode || '000000', 0, 415, {
        align: 'center',
        width: doc.page.width,
      });

    // Footer
    doc
      .fillColor('#64748b')
      .fontSize(9)
      .font('Helvetica')
      .text(
        'Present this admit card at the venue for verification. Entry is subject to verification of the unique code.',
        50,
        500,
        { align: 'center', width: 500 },
      );

    doc.end();
  } catch (err) {
    console.error('❌ PDF Generation Error:', err);
    if (!res.headersSent) {
      res
        .status(500)
        .json({ status: 'error', message: 'Failed to generate PDF' });
    }
  }
});
