const mongoose = require('mongoose');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const Registration = require('./models/registrationModel');

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

async function runTest() {
  await mongoose.connect(DB);
  console.log('DB Connected');
  
  const reg = await Registration.findOne({ status: 'approved' }).populate('studentId');
  if (!reg) {
    console.log('No approved registration found');
    process.exit(0);
  }
  
  console.log(`Found Registration: ${reg._id} for Student: ${reg.studentId._id} Role: ${reg.studentId.role}`);
  
  // Create token
  const token = jwt.sign({ id: reg.studentId._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  try {
    const res = await axios.get(`http://localhost:5000/api/v1/registrations/${reg._id}/download-admit-card`, {
      headers: {
        Authorization: `Bearer ${token}`
      },
      responseType: 'arraybuffer'
    });
    console.log(`Success! PDF downloaded, size: ${res.data.length} bytes`);
  } catch (error) {
    console.error('Request failed. Status:', error.response?.status);
    console.error('Response data:', error.response?.data ? error.response.data.toString() : error.message);
  }
  
  process.exit(0);
}

runTest();
