const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const plantRoutes = require('./routes/plantRoutes');
const userRoutes = require('./routes/userRoutes');
const db = require('../database/db');
const app = express();
import { config } from './config';

dotenv.config();

const corsOptions = {
  origin: ['http://localhost:4200', 'https://phillipball1.github.io', config.heroku],
  optionsSuccessStatus: 200,
  credentials: true,
};

app.use(cors(corsOptions));
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
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});