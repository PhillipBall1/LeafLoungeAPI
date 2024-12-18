"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_1 = require("mongodb");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const express = require('express');
const db = require('../database/db');
const router = express.Router();
router.post('/register', async (req, res) => {
    try {
        const userCollection = db.getUserCollection();
        const existingUser = await userCollection.findOne({ username: req.body.username });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const user = { username: req.body.username, password: hashedPassword, admin: req.body.admin };
        await userCollection.insertOne(user);
        const createdUser = { ...user, password: undefined, admin: false };
        res.status(201).json(createdUser);
    }
    catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
router.post('/login', async (req, res) => {
    try {
        const userCollection = db.getUserCollection();
        const { username, password } = req.body;
        const user = await userCollection.findOne({ username });
        if (!user) {
            return res.status(400).json({ error: 'Invalid username or password' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid username or password' });
        }
        const token = jwt.sign({ userId: user._id, admin: user.admin }, "RejfFLso93nFL6sP20382KEYkf89d0", { expiresIn: '1h' });
        res.json({ token });
    }
    catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
router.get('/user/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        if (!mongodb_1.ObjectId.isValid(userId)) {
            return res.status(400).send('Invalid user ID');
        }
        const userCollection = db.getUserCollection();
        const user = await userCollection.findOne({ _id: new mongodb_1.ObjectId(userId) }, { projection: { password: 0 } });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    }
    catch (error) {
        console.error('Error getting user details:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
router.put('/user/:userId/cart', async (req, res) => {
    try {
        const userId = req.params.userId;
        const plantToAdd = req.body;
        if (!mongodb_1.ObjectId.isValid(userId)) {
            return res.status(400).send('Invalid user ID');
        }
        const userCollection = db.getUserCollection();
        const updateResult = await userCollection.updateOne({ _id: new mongodb_1.ObjectId(userId) }, { $push: { cart: plantToAdd } });
        if (!updateResult.matchedCount) {
            return res.status(404).json({ error: 'User not found' });
        }
        if (!updateResult.modifiedCount) {
            return res.status(400).json({ error: 'Failed to add plant to cart' });
        }
        res.json({ message: 'Plant added to cart successfully' });
    }
    catch (error) {
        console.error('Error adding plant to user cart:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
router.get('/user/:userId/cart', async (req, res) => {
    try {
        const userId = req.params.userId;
        if (!mongodb_1.ObjectId.isValid(userId)) {
            return res.status(400).send('Invalid user ID');
        }
        const userCollection = db.getUserCollection();
        const user = await userCollection.findOne({ _id: new mongodb_1.ObjectId(userId) }, { projection: { cart: 1 } });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user.cart);
    }
    catch (error) {
        console.error('Error fetching user cart:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
router.delete('/user/:userId/cart/:plantId', async (req, res) => {
    try {
        const { userId, plantId } = req.params;
        if (!mongodb_1.ObjectId.isValid(userId) || !mongodb_1.ObjectId.isValid(plantId)) {
            return res.status(400).send('Invalid IDs');
        }
        const userCollection = db.getUserCollection();
        const updateResult = await userCollection.updateOne({ _id: new mongodb_1.ObjectId(userId) }, { $pull: { cart: { plantId: plantId } } });
        if (!updateResult.matchedCount) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ message: 'Item removed from cart successfully' });
    }
    catch (error) {
        console.error('Error removing item from cart:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
module.exports = router;
