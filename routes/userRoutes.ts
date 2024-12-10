import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const express = require('express');
const db = require('../database/db');
const router = express.Router();
const logger = require('./logger');

// Register a user
router.post('/register', async (req, res) => {
  try {
    const userCollection = db.getUserCollection();
    const existingUser = await userCollection.findOne({ username: req.body.username });
    
    if (existingUser) {
      logger.warn(`User with username ${req.body.username} already exists`);
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = { username: req.body.username, password: hashedPassword, admin: req.body.admin };

    await userCollection.insertOne(user);
    const createdUser = { ...user, password: undefined, admin: false };
    
    logger.info(`User with username ${req.body.username} registered successfully`);
    res.status(201).json(createdUser);
  } catch (error) {
    logger.error('Error registering user:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Login a user
router.post('/login', async (req, res) => {
  try {
    const userCollection = db.getUserCollection();
    const { username, password } = req.body;
    
    const user = await userCollection.findOne({ username });
    if (!user) {
      logger.warn(`Failed login attempt for non-existing user: ${username}`);
      return res.status(400).json({ error: 'Invalid username or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      logger.warn(`Failed login attempt for user: ${username}`);
      return res.status(400).json({ error: 'Invalid username or password' });
    }

    const token = jwt.sign(
      { userId: user._id, admin: user.admin }, 
      "RejfFLso93nFL6sP20382KEYkf89d0",
      { expiresIn: '1h' }
    );

    logger.info(`User ${username} logged in successfully`);
    res.json({ token });
  } catch (error) {
    logger.error('Error during login:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get user details by ID
router.get('/user/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    
    if (!ObjectId.isValid(userId)) {
      logger.warn(`Invalid user ID format: ${userId}`);
      return res.status(400).send('Invalid user ID');
    }

    const userCollection = db.getUserCollection();
    const user = await userCollection.findOne({ _id: new ObjectId(userId) }, { projection: { password: 0 } });

    if (!user) {
      logger.warn(`User with ID ${userId} not found`);
      return res.status(404).json({ error: 'User not found' });
    }

    logger.info(`Fetched user details for user with ID ${userId}`);
    res.json(user);
  } catch (error) {
    logger.error('Error getting user details:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Add plant to user cart by user ID
router.put('/user/:userId/cart', async (req, res) => {
  try {
    const userId = req.params.userId;
    const plantToAdd = req.body;

    if (!ObjectId.isValid(userId)) {
      logger.warn(`Invalid user ID format: ${userId}`);
      return res.status(400).send('Invalid user ID');
    }

    const userCollection = db.getUserCollection();
    const updateResult = await userCollection.updateOne(
      { _id: new ObjectId(userId) },
      { $push: { cart: plantToAdd } }
    );

    if (!updateResult.matchedCount) {
      logger.warn(`User with ID ${userId} not found`);
      return res.status(404).json({ error: 'User not found' });
    }

    if (!updateResult.modifiedCount) {
      logger.warn(`Failed to add plant to cart for user with ID ${userId}`);
      return res.status(400).json({ error: 'Failed to add plant to cart' });
    }

    logger.info(`Plant added to cart for user with ID ${userId}`);
    res.json({ message: 'Plant added to cart successfully' });
  } catch (error) {
    logger.error('Error adding plant to user cart:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

  // Get user cart by user ID
router.get('/user/:userId/cart', async (req, res) => {
  try {
    const userId = req.params.userId;

    if (!ObjectId.isValid(userId)) {
      logger.warn(`Invalid user ID format: ${userId}`);
      return res.status(400).send('Invalid user ID');
    }

    const userCollection = db.getUserCollection();
    const user = await userCollection.findOne(
      { _id: new ObjectId(userId) },
      { projection: { cart: 1 } }
    );

    if (!user) {
      logger.warn(`User with ID ${userId} not found`);
      return res.status(404).json({ error: 'User not found' });
    }

    logger.info(`Fetched cart details for user with ID ${userId}`);
    res.json(user.cart);
  } catch (error) {
    logger.error('Error fetching user cart:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Remove item from user cart by user ID and plant ID
router.delete('/user/:userId/cart/:plantId', async (req, res) => {
  try {
    const { userId, plantId } = req.params;

    if (!ObjectId.isValid(userId) || !ObjectId.isValid(plantId)) {
      logger.warn(`Invalid IDs - userId: ${userId}, plantId: ${plantId}`);
      return res.status(400).send('Invalid IDs');
    }

    const userCollection = db.getUserCollection();
    const updateResult = await userCollection.updateOne(
      { _id: new ObjectId(userId) },
      { $pull: { cart: { plantId: plantId } } }
    );

    if (!updateResult.matchedCount) {
      logger.warn(`User with ID ${userId} not found`);
      return res.status(404).json({ error: 'User not found' });
    }

    logger.info(`Removed plant with ID ${plantId} from cart for user with ID ${userId}`);
    res.json({ message: 'Item removed from cart successfully' });
  } catch (error) {
    logger.error('Error removing item from cart:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;