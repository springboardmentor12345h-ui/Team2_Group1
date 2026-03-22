const express = require('express');
const feedbackController = require('../controllers/feedbackController');
const userController = require('../controllers/userController');

const router = express.Router({ mergeParams: true });

// Ratings
router.post(
  '/:eventId/rate',
  userController.protect,
  feedbackController.rateEvent
);

router.get(
  '/:eventId/rating',
  feedbackController.getRating
);

// Comments
router.post(
  '/:eventId/comment',
  userController.protect,
  feedbackController.postComment
);

router.get(
  '/:eventId/comments',
  feedbackController.getComments
);

router.delete(
  '/:commentId',
  userController.protect,
  feedbackController.deleteComment
);

// Admin summary
router.get(
  '/:eventId/summary',
  userController.protect,
  userController.restrictTo('collegeAdmin', 'superAdmin'),
  feedbackController.getEventFeedbackSummary
);

module.exports = router;
