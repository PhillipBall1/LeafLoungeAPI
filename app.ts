const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const dotenv = require('dotenv');

dotenv.config();

const { MONGODB_URI, DATABASE_NAME, COLLECTION_NAME } = process.env;

const uri = MONGODB_URI;
const dbName = DATABASE_NAME;
const collectionName = COLLECTION_NAME;

const app = express();
const port = 3000;

app.use(express.json());

// Get all plants
app.get('/plants', async (req, res) => {
  const client = new MongoClient(uri);

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
app.get('/plants/:id', async (req, res) => {
  const client = new MongoClient(uri);

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

// Search by family name
app.get('/plants/family/:familyName', async (req, res) => {
  const client = new MongoClient(uri);

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
app.get('/plants/scientific/:scientificName', async (req, res) => {
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

// Add similar routes for update and delete operations...

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
