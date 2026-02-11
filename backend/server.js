const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose');

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Database Connection
const connectDB = async (retries = 5) => {
    for (let i = 0; i < retries; i++) {
        try {
            const conn = await mongoose.connect('mongodb://localhost:27017/campus_event_hub');
            console.log(`MongoDB Connected: ${conn.connection.host}`);
            return;
        } catch (error) {
            console.error(`Error: ${error.message}`);
            if (i < retries - 1) {
                console.log(`Retrying connection in 5 seconds... (${i + 1}/${retries})`);
                await new Promise(resolve => setTimeout(resolve, 5000));
            } else {
                console.error('Failed to connect to MongoDB after retries');
                // process.exit(1); // Commented out to allow server to run without DB
            }
        }
    }
};

connectDB();

// Routes
app.get('/', (req, res) => {
    res.send('API is running...');
});

// Import Routes
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

const projectRoutes = require('./routes/projectRoutes');
app.use('/api/projects', projectRoutes);

const taskRoutes = require('./routes/taskRoutes');
app.use('/api/tasks', taskRoutes);

const PORT = process.env.PORT || 5007;

app.listen(PORT, console.log(`Server running on port ${PORT}`));
