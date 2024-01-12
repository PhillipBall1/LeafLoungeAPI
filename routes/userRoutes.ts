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
  
      const user = { username: req.body.username, password: hashedPassword };
      await userCollection.insertOne(user);
  
      const createdUser = { ...user, password: undefined };
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
        { userId: user._id }, 
        process.env.JWT_SECRET as string,
        { expiresIn: '1h' }
      );
  
      res.json({ token });
  
    } catch (error) {
      console.error('Error during login:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  router.get('/user/:id', async (req: Request, res: Response) => {
    try {
        const userCollection = db.getUserCollection();
        const userId = req.params.id;

        const user = await userCollection.findOne({ _id: new ObjectId(userId) });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const userResponse = {
            username: user.username,
            admin: user.admin
        };

        res.json(userResponse);
    } catch (error) {
        console.error('Error fetching user by ID:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


module.exports = router;