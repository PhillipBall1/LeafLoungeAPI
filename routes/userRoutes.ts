import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
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
    } catch (error) {
      console.error('Error registering user:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
  router.post('/login', async (req: Request, res: Response) => {
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
  
      const token = jwt.sign(
        { userId: user._id, admin: user.admin }, 
        process.env.JWT_SECRET as string,
        { expiresIn: '1h' }
      );
      
  
      res.json({ token });
  
    } catch (error) {
      console.error('Error during login:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  router.get('/user/:userId', async (req, res) => {
    try {
      const userId = req.params.userId;
      if (!ObjectId.isValid(userId)) {
        return res.status(400).send('Invalid user ID');
      }
      const userCollection = db.getUserCollection();
      const user = await userCollection.findOne({ _id: new ObjectId(userId) }, { projection: { password: 0 } });
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      console.error('Error getting user details:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });


module.exports = router;