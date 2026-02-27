const express = require('express');
const eventController = require('../controllers/eventController');
const userController = require('../controllers/userController');

const router = express.Router();
router
  .get('/suggestions', eventController.getSuggestions);

router
  .route('/')
  .get(eventController.getAllEvents)
  .post(
    userController.protect,
    userController.restrictTo('collegeAdmin', 'superAdmin'),
    eventController.uploadEventImage,
    eventController.createEvent,
  );



router
  .route('/:id')
  .get(eventController.getEvent)
  .patch(
    userController.protect,
    userController.restrictTo('collegeAdmin', 'superAdmin'),
    eventController.uploadEventImage,
    eventController.updateEvent,
  )
  .delete(
    userController.protect,
    userController.restrictTo('collegeAdmin', 'superAdmin'),
    eventController.deleteEvent,
  );

module.exports = router;
