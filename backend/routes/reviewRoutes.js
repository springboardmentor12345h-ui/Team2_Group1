const express = require('express');
const reviewController = require('../controllers/reviewController');
const { protect, restrictTo } = require('../controllers/userController');

const router = express.Router();

router.use(protect);

router.post('/', reviewController.createReview);
router.get('/:eventId', reviewController.getEventReviews);

// Admin-level access: both collegeAdmins and superAdmins can view all reviews
router.get(
  '/admin/all',
  restrictTo('collegeAdmin', 'superAdmin'),
  reviewController.getAllReviews,
);

module.exports = router;
