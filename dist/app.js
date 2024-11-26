"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const config_1 = require("./config");
const cors = require('cors');
const plantRoutes = require('./routes/plantRoutes');
const userRoutes = require('./routes/userRoutes');
const db = require('./database/db');
const app = express();
app.use(cors());
app.use(express.json());
async function startServer() {
    try {
        await db.connect();
        console.log('Database connected successfully');
        // Set up routes after the database connection is established
        app.use('/API', plantRoutes);
        app.use('/API', userRoutes);
        // Start the server
        app.listen(config_1.config.port, () => {
            console.log(`Server listening on port ${config_1.config.port}`);
        });
    }
    catch (err) {
        console.error('Failed to connect to the database:', err);
        process.exit(1); // Exit the process if the database connection fails
    }
}
startServer();
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
