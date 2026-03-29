const mongoose = require("mongoose");
const Registration = require("./backend/models/registrationModel");

async function fixCodes() {
  await mongoose.connect("mongodb+srv://user:pass@cluster.mongodb.net/dbname");
  const regs = await Registration.find({ admitCardCode: { $exists: false } });
  console.log(`Found ${regs.length} registrations without codes`);
  // ...
}
