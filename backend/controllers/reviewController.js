const Review = require('../models/reviewModel');
const Event = require('../models/eventModel');
const Registration = require('../models/registrationModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.createReview = catchAsync(async (req, res, next) => {
  const { eventId, rating, comment } = req.body;

  // 1. Check if event exists
  const event = await Event.findById(eventId);
  if (!event) {
    return next(new AppError('No event found with that ID', 404));
  }

  // 2. Check if event is completed
  if (new Date() < new Date(event.endDate)) {
    return next(new AppError('You can only review completed events.', 400));
  }

  // 3. Check if user was registered for this event
  const registration = await Registration.findOne({
    eventId,
    studentId: req.user.id,
    status: 'approved',
  });

  if (!registration) {
    return next(
      new AppError('You can only review events you successfully registered for.', 403),
    );
  }

  // 4. Create review
  const review = await Review.create({
    event: eventId,
    user: req.user.id,
    rating,
    comment,
  });

  res.status(201).json({
    status: 'success',
    data: {
      review,
    },
  });
});

exports.getEventReviews = catchAsync(async (req, res, next) => {
  const reviews = await Review.find({ event: req.params.eventId })
    .populate('user', 'name college role')
    .sort('-createdAt');

  res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: {
      reviews,
    },
  });
});

// Admin Review Management
exports.getAllReviews = catchAsync(async (req, res, next) => {
  let filter = {};

  // For college admins, filter reviews for their own events
  if (req.user.role === 'collegeAdmin') {
    const events = await Event.find({ collegeId: req.user.id });
    const eventIds = events.map((e) => e._id);
    filter = { event: { $in: eventIds } };
  }

  const reviews = await Review.find(filter)
    .populate('event', 'title collegeId')
    .populate('user', 'name college')
    .sort('-createdAt');

  res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: {
      reviews,
    },
  });
});
