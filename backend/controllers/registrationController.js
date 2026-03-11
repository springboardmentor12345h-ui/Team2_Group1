const Registration = require('../models/registrationModel');
const Event = require('../models/eventModel');

exports.createRegistration = async (req, res) => {
  try {
    const { eventId } = req.body;
    
    // Check if event exists
    const event = await Event.findById(eventId);
    if (!event) {
      throw new Error('No event found with that ID');
    }

    // Ensure student hasn't already registered
    const existingRegistration = await Registration.findOne({
      eventId,
      studentId: req.user.id
    });

    if (existingRegistration) {
      throw new Error('You are already registered for this event');
    }

    const newRegistration = await Registration.create({
      eventId,
      studentId: req.user.id,
      adminId: event.collegeId, // the admin who created the event
      status: 'approved',
      isRead: false
    });

    res.status(201).json({
      status: 'success',
      data: {
        registration: newRegistration,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
};

exports.getAdminRegistrations = async (req, res) => {
  try {
    // Check if current user is an admin
    if (req.user.role !== 'collegeAdmin' && req.user.role !== 'superAdmin') {
       throw new Error('Only admins can view these registrations');
    }

    // Find registrations where this user is the adminId
    const registrations = await Registration.find({ adminId: req.user.id })
      .populate('studentId', 'name email college')
      .populate('eventId', 'title startDate')
      .sort('-createdAt');

    res.status(200).json({
      status: 'success',
      results: registrations.length,
      data: {
        registrations,
      },
    });
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: error.message,
    });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const registration = await Registration.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true, runValidators: true }
    );

    if (!registration) {
      throw new Error('No registration found with that ID');
    }

    res.status(200).json({
      status: 'success',
      data: {
        registration,
      },
    });
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: error.message,
    });
  }
};
