const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const dotenv = require('dotenv');
const cors = require('cors');
import { Request, Response } from 'express';

dotenv.config();
const { MONGODB_URI, DATABASE_NAME, COLLECTION_NAME } = process.env;

const uri = MONGODB_URI;
const dbName = DATABASE_NAME;
const collectionName = COLLECTION_NAME;

const app = express();
app.use(cors());
app.use(express.json());

const client = new MongoClient(uri, { tlsAllowInvalidCertificates: true });

// Get all plants
app.get('/plants', async (req: Request, res: Response) => {
  try {
    await client.connect();
    const database = client.db(dbName);
    const collection = database.collection(collectionName);

    const documents = await collection.find({}).toArray();
    res.json(documents);
  } catch (error) {
    console.error('Error retrieving plants:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    await client.close();
  }
});

// Get plant by ID
app.get('/plants/:id', async (req: Request, res: Response) => {

  try {
    await client.connect();
    const database = client.db(dbName);
    const collection = database.collection(collectionName);

    const plant = await collection.findOne({ _id: new ObjectId(req.params.id) });

    if (!plant) {
      res.status(404).json({ error: 'Plant not found' });
    } else {
      res.json(plant);
    }
  } catch (error) {
    console.error('Error retrieving plant by ID:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    await client.close();
  }
});

// Search by plant name
app.get('/plants/:plantName', async (req: Request, res: Response) => {

  try {
    await client.connect();
    const database = client.db(dbName);
    const collection = database.collection(collectionName);

    const plants = await collection.find({ plant_name: req.params.plantName }).toArray();
    res.json(plants);
  } catch (error) {
    console.error('Error searching plants by family name:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    await client.close();
  }
});

// Search by family name
app.get('/plants/family/:familyName', async (req: Request, res: Response) => {

  try {
    await client.connect();
    const database = client.db(dbName);
    const collection = database.collection(collectionName);

    const plants = await collection.find({ family_name: req.params.familyName }).toArray();
    res.json(plants);
  } catch (error) {
    console.error('Error searching plants by family name:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    await client.close();
  }
});

// Search by scientific name
app.get('/plants/scientific/:scientificName', async (req: Request, res: Response) => {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const database = client.db(dbName);
    const collection = database.collection(collectionName);

    const plants = await collection.find({ scientific_name: req.params.scientificName }).toArray();
    res.json(plants);
  } catch (error) {
    console.error('Error searching plants by scientific name:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    await client.close();
  }
});

// Add a new plant
app.post('/plants', async (req: Request, res: Response) => {
  try {
    await client.connect();
    const database = client.db(dbName);
    const collection = database.collection(collectionName);

    const newPlant = req.body;
    const result = await collection.insertOne(newPlant);

    res.json(result.ops[0]);
  } catch (error) {
    console.error('Error adding plant:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    await client.close();
  }
});

// Update a plant by ID
app.put('/plants/:id', async (req: Request, res: Response) => {
  try {
    await client.connect();
    const database = client.db(dbName);
    const collection = database.collection(collectionName);

    const plantId = req.params.id;
    const updatedPlant = req.body;

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(plantId) },
      { $set: updatedPlant },
      { returnDocument: 'after' }
    );

    if (!result.value) {
      res.status(404).json({ error: 'Plant not found' });
    } else {
      res.json(result.value);
    }
  } catch (error) {
    console.error('Error updating plant:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    await client.close();
  }
});

// Delete a plant by ID
app.delete('/plants/:id', async (req: Request, res: Response) => {
  try {
    await client.connect();
    const database = client.db(dbName);
    const collection = database.collection(collectionName);

    const plantId = req.params.id;

    const result = await collection.findOneAndDelete({ _id: new ObjectId(plantId) });

    if (!result.value) {
      res.status(404).json({ error: 'Plant not found' });
    } else {
      res.json({ message: 'Plant deleted successfully' });
    }
  } catch (error) {
    console.error('Error deleting plant:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    await client.close();
  }
});

app.listen(process.env.PORT || 3000);

console.log("PORT: " + process.env.PORT);

