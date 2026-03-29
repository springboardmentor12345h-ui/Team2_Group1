const express = require('express');
const adminLogController = require('../controllers/adminLogController');
const userController = require('../controllers/userController');

const router = express.Router();

// Only admins can see logs
router.use(userController.protect);
router.use(userController.restrictTo('collegeAdmin', 'superAdmin'));

router
  .route('/')
  .get(adminLogController.getAllLogs)
  .post(adminLogController.createLog);

module.exports = router;
