"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { MongoClient } = require('mongodb');
const config_1 = require("../config");
let db = null;
const client = new MongoClient(config_1.config.mongodbUri, { tlsAllowInvalidCertificates: true });
async function connect() {
    try {
        console.log('Attempting to connect to MongoDB');
        await client.connect();
        console.log('Connected to MongoDB');
        db = client.db("fullstack");
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
    return db.collection("users");
}
function getPlantCollection() {
    if (!db) {
        throw new Error('No database connected!');
    }
    return db.collection("plants");
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
