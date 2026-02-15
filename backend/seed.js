const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/userModel');
const Event = require('./models/eventModel');

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace(
  '<db_password>',
  process.env.DATABASE_PASSWORD,
);

mongoose.connect(DB).then(() => console.log('DB connection successful!'));

const sampleEvents = [
  {
    title: 'Inter-College Hackathon 2024',
    description:
      'A 48-hour coding marathon bringing together the brightest minds to solve real-world problems. Participants will work in teams to build innovative solutions using modern technologies.',
    category: 'Hackathon',
    location: 'Tech Auditorium',
    startDate: '2024-03-15T09:00:00Z',
    endDate: '2024-03-17T09:00:00Z',
  },
  {
    title: 'Cultural Fest - Harmony 2024',
    description:
      'Celebrate diversity and creativity through music, dance, drama, and art performances. A week-long celebration of talent and culture.',
    category: 'Cultural',
    location: 'City Cultural Center',
    startDate: '2024-03-20T10:00:00Z',
    endDate: '2024-03-27T22:00:00Z',
  },
  {
    title: 'Basketball Championship',
    description:
      'Annual inter-college basketball tournament featuring top teams from across the region. Come and support your team!',
    category: 'Sports',
    location: 'Main Sports Arena',
    startDate: '2024-03-10T16:00:00Z',
    endDate: '2024-03-12T20:00:00Z',
  },
  {
    title: 'AI & Future Workshop',
    description:
      'An intensive workshop on Artificial Intelligence and its future impact on various industries. Led by industry experts.',
    category: 'Workshop',
    location: 'Conference Hall A',
    startDate: '2024-04-05T10:00:00Z',
    endDate: '2024-04-05T17:00:00Z',
  },
];

const seedData = async () => {
  try {
    await Event.deleteMany();

    // Find or create a college admin
    let admin = await User.findOne({ role: 'collegeAdmin' });
    if (!admin) {
      admin = await User.create({
        name: 'Admin User',
        email: 'admin@college.edu',
        password: 'password123',
        passwordConfirm: 'password123',
        college: 'Tech University',
        role: 'collegeAdmin',
      });
    }

    const eventsWithAdmin = sampleEvents.map((event) => ({
      ...event,
      collegeId: admin._id,
    }));

    await Event.create(eventsWithAdmin);
    console.log('Sample data seeded successfully!');
    process.exit();
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

// seedData();
