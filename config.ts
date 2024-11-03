
import * as dotenv from 'dotenv';
dotenv.config();

export const config = {
  mongodbUri: process.env.MONGODB_URI,
  dbName: process.env.DATABASE_NAME,
  jwtSecret: process.env.JWT_SECRET,
  port: process.env.PORT || '3000',
  heroku: process.env.HEROKU,
};