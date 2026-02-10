const dotenv = require('dotenv');
dotenv.config({ path: './config.env', quiet: true });

const mongoose = require('mongoose');
const app = require('./app');

if (!process.env.DATABASE || !process.env.DATABASE_PASSWORD) {
  console.error(
    '❌ Missing Database configuration. Please set DATABASE and DATABASE_PASSWORD in config.env',
  );
  process.exit(1);
}

const DB = process.env.DATABASE.replace(
  '<db_password>',
  process.env.DATABASE_PASSWORD,
);

mongoose
  .connect(DB)
  .then(() => console.log('DB connection status - 🟢 Success...!'))
  .catch((err) => console.error('❌ DB connection failed:', err));

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}/`);
});
