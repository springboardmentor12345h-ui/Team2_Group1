const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const userRoutes = require('./routes/userRoutes');
const eventRoutes = require('./routes/eventRoutes');
const adminLogRoutes = require('./routes/adminLogRoutes');
const registrationRoutes = require('./routes/registrationRoutes');
const path = require('path');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:5173", 
      "http://127.0.0.1:5173",
      "http://localhost:5174",
      "http://127.0.0.1:5174",
      "http://localhost:5175",
      "http://127.0.0.1:5175"
    ],
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/v1/users', userRoutes);
app.use('/api/v1/events', eventRoutes);
app.use('/api/v1/logs', adminLogRoutes);
app.use('/api/v1/registrations', registrationRoutes);

app.use((req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
