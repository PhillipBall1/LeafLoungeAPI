const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const plantRoutes = require('./routes/plantRoutes'); // Import the plant routes module
const userRoutes = require('./routes/userRoutes');

const app = express();
dotenv.config();
app.use(cors());
app.use(express.json());

// Establish a connection to MongoDB
db.connect().then(() => {
  app.use('/plants', plantRoutes);
  app.use('/users', userRoutes);
  app.listen(config.port, () => {
    console.log(`Server listening on port ${config.port}`);
  });
}).catch(err => {
  console.error('Failed to connect to database:', err);
});

// When shutting down, ensure we close the database connection
process.on('SIGINT', async () => {
  console.log('Closing MongoDB connection');
  await db.close();
  process.exit(0);
});
process.on('SIGTERM', async () => {
  console.log('Closing MongoDB connection');
  await db.close();
  process.exit(0);
});
