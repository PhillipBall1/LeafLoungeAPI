// config.js
require('dotenv').config();

const config = {
  mongodbUri: process.env.MONGODB_URI,
  dbName: process.env.DATABASE_NAME,
  plantCollectionName: process.env.PLANT_COLLECTION_NAME,
  userCollectionName: process.env.USER_COLLECTION_NAME,
  jwtSecret: process.env.JWT_SECRET,
  port: process.env.PORT || 3000,
};

module.exports = config;