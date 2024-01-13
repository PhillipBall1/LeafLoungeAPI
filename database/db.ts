const { MongoClient } = require('mongodb');
import { config } from '../config';
let db = null;

const client = new MongoClient(config.mongodbUri, { tlsAllowInvalidCertificates: true });

async function connect() {
    try {
        console.log('Attempting to connect to MongoDB');
        await client.connect();
        console.log('Connected to MongoDB');
        db = client.db(config.dbName);
        console.log('Database object set');
    }
    catch (error) {
        console.error('Could not connect to MongoDB', error);
        process.exit(1);
    }
}

function getDb() {
    if (!db) {
      throw new Error('No database connected!');
    }
    return db;
}

function getUserCollection() {
    if (!db) {
        throw new Error('No database connected!');
    }
    return db.collection(config.userCollectionName);
}

function getPlantCollection() {
    if (!db) {
        throw new Error('No database connected!');
    }
    return db.collection(config.plantCollectionName);
}

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