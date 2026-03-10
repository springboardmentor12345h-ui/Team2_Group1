const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path'); // Added this line
const User = require('./models/userModel');
const Event = require('./models/eventModel');

dotenv.config({ path: path.join(__dirname, 'config.env') }); // Modified this line

const DB = process.env.DATABASE.replace(
  '<db_password>',
  process.env.DATABASE_PASSWORD,
);

mongoose.connect(DB).then(() => console.log('DB connection successful!'));

const sampleEvents = [
  {
    title: 'Inter-College Hackathon 2026',
    description:
      'A 48-hour coding marathon bringing together the brightest minds to solve real-world problems. Participants will work in teams to build innovative solutions using modern technologies.',
    category: 'Hackathon',
    location: 'Tech Auditorium',
    startDate: '2026-03-15T09:00:00Z',
    endDate: '2026-03-17T09:00:00Z',
  },
  {
    title: 'Cultural Fest - Harmony 2026',
    description:
      'Celebrate diversity and creativity through music, dance, drama, and art performances. A week-long celebration of talent and culture.',
    category: 'Cultural',
    location: 'City Cultural Center',
    startDate: '2026-03-20T10:00:00Z',
    endDate: '2026-03-27T22:00:00Z',
  },
  {
    title: 'Basketball Championship',
    description:
      'Annual inter-college basketball tournament featuring top teams from across the region. Come and support your team!',
    category: 'Sports',
    location: 'Main Sports Arena',
    startDate: '2026-02-10T16:00:00Z',
    endDate: '2026-02-12T20:00:00Z',
  },
  {
    title: 'AI & Future Workshop',
    description:
      'An intensive workshop on Artificial Intelligence and its future impact on various industries. Led by industry experts.',
    category: 'Workshop',
    location: 'Conference Hall A',
    startDate: '2026-04-05T10:00:00Z',
    endDate: '2026-04-05T17:00:00Z',
  },
  {
    title: 'National Level Tech Symposium',
    description:
      'A gathering of tech enthusiasts to discuss emerging technologies, participate in workshops, and network with industry leaders.',
    category: 'Workshop',
    location: 'Main Hall',
    startDate: '2026-03-10T10:00:00Z',
    endDate: '2026-03-11T17:00:00Z',
  },
  {
    title: 'Global Robotics Challenge',
    description:
      'Teams from across the globe compete in various robotics challenges, from autonomous navigation to robot combat.',
    category: 'Hackathon',
    location: 'Convention Center',
    startDate: '2026-04-12T09:00:00Z',
    endDate: '2026-04-14T18:00:00Z',
  },
  {
    title: 'Photography & Visual Arts Expo',
    description:
      'Showcasing the best photography and visual arts from college students. Includes workshops on digital editing and composition.',
    category: 'Cultural',
    location: 'Art Gallery',
    startDate: '2026-03-18T10:00:00Z',
    endDate: '2026-03-20T20:00:00Z',
  },
  {
    title: 'Inter-College Cricket League',
    description:
      'The biggest inter-college cricket tournament of the season. Support your favorite teams as they battle for the trophy.',
    category: 'Sports',
    location: 'University Ground',
    startDate: '2026-03-05T08:00:00Z',
    endDate: '2026-03-08T18:00:00Z',
  },
  {
    title: 'UI/UX Design Sprint',
    description:
      'A fast-paced design challenge where teams create intuitive UI/UX solutions for real-world problems in under 24 hours.',
    category: 'Hackathon',
    location: 'Design Lab',
    startDate: '2026-03-25T10:00:00Z',
    endDate: '2026-03-26T17:00:00Z',
  },
];

const seedData = async () => {
  try {
    await Event.deleteMany();
    await User.deleteMany();

    // Find or create the superAdmin
    let superAdmin = await User.findOne({ email: 'admin@example.com' });
    if (!superAdmin) {
      superAdmin = await User.create({
        name: 'Super Admin',
        email: 'admin@example.com',
        password: 'test1234',
        passwordConfirm: 'test1234',
        college: 'Global Hub',
        role: 'superAdmin',
        status: 'approved',
      });
    }

    // Find or create a college admin
    let admin = await User.findOne({ role: 'collegeAdmin' });
    if (!admin) {
      admin = await User.create({
        name: 'Admin',
        email: 'admin@college.edu',
        password: 'test1234',
        passwordConfirm: 'test1234',
        college: 'Tech University',
        role: 'collegeAdmin',
        status: 'approved',
      });
    }

    // Find or create a student
    let student = await User.findOne({ email: 'max@example.com' });
    if (!student) {
      student = await User.create({
        name: 'Max Student',
        email: 'max@example.com',
        password: 'test1234',
        passwordConfirm: 'test1234',
        college: 'Tech University',
        role: 'student',
        status: 'approved',
      });
    }

    const eventsWithAdmin = sampleEvents.map((event) => ({
      ...event,
      collegeId: admin._id,
    }));

    const events = await Event.create(eventsWithAdmin);

    // Create Admin Logs for seeded events
    const AdminLog = require('./models/adminLogModel');
    const logPromises = events.map((event) =>
      AdminLog.create({
        action: `Created new event: ${event.title} by Admin`,
        user: admin._id,
      }),
    );
    await Promise.all(logPromises);

    console.log('Sample data and admin logs seeded successfully!');
    process.exit();
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
