const express = require('express');
const registrationController = require('../controllers/registrationController');
const userController = require('../controllers/userController');

const router = express.Router();

router.use(userController.protect);

router
  .route('/')
  .post(userController.restrictTo('student'), registrationController.createRegistration);

router
  .route('/admin')
  .get(userController.restrictTo('collegeAdmin', 'superAdmin'), registrationController.getAdminRegistrations);

router
  .route('/:id/read')
  .patch(userController.restrictTo('collegeAdmin', 'superAdmin'), registrationController.markAsRead);

module.exports = router;
