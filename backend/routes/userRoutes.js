const express = require('express');
const {
  getAllUsers,
  signup,
  login,
  protect,
  restrictTo,
  deleteUser,
  updateUserStatus,
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

module.exports = router;
