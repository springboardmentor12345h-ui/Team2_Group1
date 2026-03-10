const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const userRoutes = require('./routes/userRoutes');
const eventRoutes = require('./routes/eventRoutes');
const adminLogRoutes = require('./routes/adminLogRoutes');
const registrationRoutes = require('./routes/registrationRoutes');
const path = require('path');
const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/v1/users', userRoutes);
app.use('/api/v1/events', eventRoutes);
app.use('/api/v1/logs', adminLogRoutes);
app.use('/api/v1/registrations', registrationRoutes);

module.exports = app;
