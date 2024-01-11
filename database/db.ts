const { MongoClient } = require('mongodb');
import { config } from '../config';
let db = null;

// Initialize MongoDB Client
const client = new MongoClient(config.mongodbUri, { tlsAllowInvalidCertificates: true });

// Establish a connection to MongoDB
async function connect() {
    try {
        await client.connect();
        console.log('Connected to MongoDB');
        db = client.db(config.dbName);
    }
    catch (error) {
        console.error('Could not connect to MongoDB', error);
        process.exit(1);
    }
}

// Function to get the database object
function getDb() {
    if (!db) {
      throw new Error('No database connected!');
    }
    return db;
}

// Function to get the User Collection
function getUserCollection() {
    if (!db) {
        throw new Error('No database connected!');
    }
    return db.collection(config.userCollectionName);
}

// Function to get the Plant Collection
function getPlantCollection() {
    if (!db) {
        throw new Error('No database connected!');
    }
    return db.collection(config.plantCollectionName);
}

// Function to close the connection
async function close() {
    if (client.isConnected()) {
      await client.close();
    }
}

module.exports = {
  connect,
  getDb,
  close,
  getPlantCollection,
  getUserCollection,
};