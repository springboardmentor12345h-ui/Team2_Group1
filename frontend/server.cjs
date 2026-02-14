
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = 'your_super_secret_key_change_this_in_production';

// --- MONGODB CONFIGURATION ---
const MONGODB_URI = 'mongodb://localhost:27017/campus_event_hub'; 

app.use(cors());
app.use(express.json());

// --- MODELS ---

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  college: { type: String, required: true },
  role: { type: String, enum: ['student', 'college_admin', 'super_admin'], default: 'student' }
});

const EventSchema = new mongoose.Schema({
  college_id: mongoose.Schema.Types.ObjectId,
  college_name: String,
  title: String,
  description: String,
  category: String,
  location: String,
  start_date: Date,
  end_date: Date,
  imageUrl: String,
  created_at: { type: Date, default: Date.now }
});

const RegistrationSchema = new mongoose.Schema({
  event_id: mongoose.Schema.Types.ObjectId,
  user_id: mongoose.Schema.Types.ObjectId,
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  timestamp: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);
const Event = mongoose.model('Event', EventSchema);
const Registration = mongoose.model('Registration', RegistrationSchema);

// --- ROUTES ---

// Health Check
app.get('/', (req, res) => res.json({ status: 'Backend is running and healthy' }));

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, college, role } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: 'Email already exists' });
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword, college, role });
    await user.save();
    
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET);
    res.json({ token, user: { id: user._id, name, email, college, role } });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error during registration' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }
  const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET);
  res.json({ token, user: { id: user._id, name: user.name, email: user.email, college: user.college, role: user.role } });
});

// Event Routes
app.get('/api/events', async (req, res) => {
  try {
    const events = await Event.find().sort({ start_date: 1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

app.post('/api/events', async (req, res) => {
  try {
    const event = new Event(req.body);
    await event.save();
    res.status(201).json(event);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Registration Routes
app.get('/api/registrations', async (req, res) => {
  try {
    const regs = await Registration.find().sort({ timestamp: -1 });
    res.json(regs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch registrations' });
  }
});

app.post('/api/registrations', async (req, res) => {
  try {
    const { event_id, user_id } = req.body;
    const existing = await Registration.findOne({ event_id, user_id });
    if (existing) return res.json(existing);
    
    const reg = new Registration({ event_id, user_id });
    await reg.save();
    res.status(201).json(reg);
  } catch (err) {
    res.status(400).json({ error: 'Registration failed' });
  }
});

app.get('/api/registrations/:userId', async (req, res) => {
  try {
    const regs = await Registration.find({ user_id: req.params.userId });
    res.json(regs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user registrations' });
  }
});

// --- DATABASE CONNECTION ---
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('--- MongoDB Connected ---');
    app.listen(PORT, () => console.log(`--- Server Running at http://localhost:${PORT} ---`));
  })
  .catch(err => {
    console.error('--- MongoDB Connection Failed ---');
    console.error('Ensure MongoDB is running locally at: ' + MONGODB_URI);
  });
