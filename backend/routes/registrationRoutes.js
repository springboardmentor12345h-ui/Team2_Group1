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
  .route('/my-registrations')
  .get(userController.restrictTo('student'), registrationController.getStudentRegistrations);

router
  .route('/:id/status')
  .patch(userController.restrictTo('collegeAdmin', 'superAdmin'), registrationController.updateRegistrationStatus);

router
  .route('/:id/read')
  .patch(userController.restrictTo('collegeAdmin', 'superAdmin'), registrationController.markAsRead);

router
  .route('/:id/student-read')
  .patch(userController.restrictTo('student'), registrationController.markRegistrationAsReadByStudent);

router
  .route('/verify-attendance')
  .post(userController.restrictTo('collegeAdmin', 'superAdmin'), registrationController.verifyAttendance);

router
  .route('/:id/issue-certificate')
  .post(userController.restrictTo('collegeAdmin', 'superAdmin'), registrationController.issueCertificate);

router
  .route('/:id/download-admit-card')
  .get(userController.restrictTo('student', 'collegeAdmin', 'superAdmin'), registrationController.downloadAdmitCard);

router
  .route('/:id/download-certificate')
  .get(userController.restrictTo('student', 'superAdmin'), registrationController.downloadCertificate);

router
  .route('/:id')
  .delete(userController.restrictTo('collegeAdmin', 'superAdmin'), registrationController.deleteRegistration);


module.exports = router;
