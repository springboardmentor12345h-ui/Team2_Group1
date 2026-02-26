const express = require('express');
const {
  getAllUsers,
  signup,
  login,
  protect,
  restrictTo,
} = require('../controllers/userController');

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);

router
  .route('/')
  .get(protect, restrictTo('collegeAdmin', 'superAdmin'), getAllUsers);

module.exports = router;
