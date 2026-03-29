const express = require('express');
const {
  getAllUsers,
  signup,
  login,
  protect,
  restrictTo,
  deleteUser,
  updateUserStatus,
  updateLastViewedEvents,
} = require('../controllers/userController');

const router = express.Router();
 
router.post('/signup', signup);
router.post('/login', login);

router
  .route('/')
  .get(protect, restrictTo('collegeAdmin', 'superAdmin'), getAllUsers);

router
  .route('/:id')
  .delete(protect, restrictTo('superAdmin'), deleteUser)
  .patch(protect, restrictTo('superAdmin'), updateUserStatus);

router.patch('/update-last-viewed-events', protect, updateLastViewedEvents);

module.exports = router;
