const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'An event must have a title'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'An event must have a description'],
  },
  category: {
    type: String,
    required: [true, 'An event must have a category'],
  },
  location: {
    type: String,
    required: [true, 'An event must have a location'],
  },
  startDate: {
    type: Date,
    required: [true, 'An event must have a start date'],
  },
  endDate: {
    type: Date,
    required: [true, 'An event must have an end date'],
  },
  collegeId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'An event must belong to a college admin'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
