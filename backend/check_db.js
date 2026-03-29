const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Registration = require('./models/registrationModel');

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose.connect(DB).then(async () => {
  const regs = await Registration.find({ status: 'approved' });
  console.log(`Found ${regs.length} approved registrations:`);
  regs.forEach(r => {
    console.log(`ID: ${r._id}, Code: "${r.admitCardCode}"`);
  });
  process.exit();
}).catch(err => {
  console.error(err);
  process.exit(1);
});
