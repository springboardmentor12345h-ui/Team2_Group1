const express = require('express');
const cookieParser = require('cookie-parser');
const userRoutes = require('./routes/userRoutes');
const app = express();

app.use(express.json());
app.use(cookieParser());

app.use('/api/v1/users', userRoutes);

module.exports = app;
