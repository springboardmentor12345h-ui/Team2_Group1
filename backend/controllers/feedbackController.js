const Feedback = require('../models/Feedback');
const Event = require('../models/eventModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// 1. POST /api/v1/feedback/:eventId/comment
exports.postComment = catchAsync(async (req, res, next) => {
  const { eventId } = req.params;
  const { comment } = req.body;

  if (!comment || comment.trim() === '') {
    return next(new AppError('Comment cannot be empty', 400));
  }

  const newFeedback = await Feedback.create({
    eventId,
    userId: req.user._id,
    comment
  });

  const populatedFeedback = await newFeedback.populate({
    path: 'userId',
    select: 'name college'
  });

  res.status(201).json({
    status: 'success',
    data: {
      comment: populatedFeedback
    }
  });
});

// 2. GET /api/v1/feedback/:eventId/comments
exports.getComments = catchAsync(async (req, res, next) => {
  const { eventId } = req.params;

  const comments = await Feedback.find({ eventId, comment: { $ne: '' } })
    .populate({
      path: 'userId',
      select: 'name college'
    })
    .sort({ createdAt: -1 });

  res.status(200).json({
    status: 'success',
    results: comments.length,
    data: {
      comments
    }
  });
});

// 3. DELETE /api/v1/feedback/:commentId
exports.deleteComment = catchAsync(async (req, res, next) => {
  const commentId = req.params.commentId;
  const feedback = await Feedback.findById(commentId);

  if (!feedback) {
    return next(new AppError('No comment found with that ID', 404));
  }

  if (
    String(feedback.userId) !== String(req.user._id) &&
    req.user.role !== 'superAdmin'
  ) {
    return next(new AppError('You do not have permission to delete this comment', 403));
  }

  await Feedback.findByIdAndDelete(commentId);

  res.status(204).json({
    status: 'success',
    data: null
  });
});

// 4. POST /api/v1/feedback/:eventId/rate
exports.rateEvent = catchAsync(async (req, res, next) => {
  const { eventId } = req.params;
  const { rating } = req.body;

  if (rating < 1 || rating > 5) {
    return next(new AppError('Rating must be between 1 and 5', 400));
  }

  let feedback = await Feedback.findOne({
    eventId,
    userId: req.user._id,
    rating: { $ne: null }
  });

  if (feedback) {
    feedback.rating = rating;
    await feedback.save();
  } else {
    feedback = await Feedback.create({
      eventId,
      userId: req.user._id,
      rating
    });
  }

  const allRatings = await Feedback.find({
    eventId,
    rating: { $ne: null }
  });

  const count = allRatings.length;
  const avg = count > 0 ? allRatings.reduce((sum, f) => sum + f.rating, 0) / count : 0;

  const breakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  allRatings.forEach(f => {
    breakdown[f.rating] = (breakdown[f.rating] || 0) + 1;
  });

  res.status(200).json({
    status: 'success',
    data: {
      averageRating: avg,
      totalRatings: count,
      userRating: rating,
      breakdown
    }
  });
});

// 5. GET /api/v1/feedback/:eventId/rating
exports.getRating = catchAsync(async (req, res, next) => {
  const { eventId } = req.params;

  const allRatings = await Feedback.find({
    eventId,
    rating: { $ne: null }
  });

  const count = allRatings.length;
  const avg = count > 0 ? allRatings.reduce((sum, f) => sum + f.rating, 0) / count : 0;

  const breakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  allRatings.forEach(f => {
    breakdown[f.rating] = (breakdown[f.rating] || 0) + 1;
  });

  let userRating = null;
  if (req.query.userId) {
    const userFeedback = await Feedback.findOne({
      eventId,
      userId: req.query.userId,
      rating: { $ne: null }
    });
    if (userFeedback) userRating = userFeedback.rating;
  }

  res.status(200).json({
    status: 'success',
    data: {
      averageRating: avg,
      totalRatings: count,
      userRating,
      breakdown
    }
  });
});

// 6. GET /api/v1/feedback/:eventId/summary
exports.getEventFeedbackSummary = catchAsync(async (req, res, next) => {
  const { eventId } = req.params;
  const event = await Event.findById(eventId);

  if (!event) {
    return next(new AppError('No event found with that ID', 404));
  }

  if (
    req.user.role !== 'superAdmin' &&
    String(event.collegeId) !== String(req.user._id)
  ) {
    return next(new AppError('You do not have permission to view feedback for this event', 403));
  }

  const allFeedback = await Feedback.find({ eventId }).populate('userId', 'name');

  const ratings = allFeedback.filter(f => f.rating !== null);
  const comments = allFeedback.filter(f => f.comment && f.comment.trim() !== '');

  const totalRatings = ratings.length;
  const averageRating = totalRatings > 0 ? ratings.reduce((sum, f) => sum + f.rating, 0) / totalRatings : 0;

  const breakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  ratings.forEach(f => {
    breakdown[f.rating] = (breakdown[f.rating] || 0) + 1;
  });

  const recentComments = comments
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 5)
    .map(f => ({
      _id: f._id,
      comment: f.comment,
      userName: f.userId?.name || 'Unknown',
      createdAt: f.createdAt
    }));

  res.status(200).json({
    status: 'success',
    data: {
      totalComments: comments.length,
      totalRatings,
      averageRating,
      breakdown,
      recentComments
    }
  });
});
