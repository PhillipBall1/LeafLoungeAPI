import { ObjectId } from "mongodb";
import { Request, Response } from 'express';

const express = require('express');
const router = express.Router();
const plantCollection = db.getPlantCollection();

router.get('/', async (req, res) => {
  try {
    const plants = await plantCollection.find({}).toArray();
    res.json(plants);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Get plant by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const plant = await plantCollection.findOne({ _id: new ObjectId(req.params.id) });
    if (!plant) {
      res.status(404).json({ error: 'Plant not found' });
    } else {
      res.json(plant);
    }
  } catch (error) {
    console.error('Error retrieving plant by ID:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get plants by featured
router.get('/featured-plants', async (req, res) => {
  try {
    const featuredPlants = await plantCollection.find({ featured: true }).toArray();
    res.json(featuredPlants);
  } catch (error) {
    console.error('Error searching for featured plants:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get plants by indoor
router.get('/indoor-plants', async (req, res) => {
  try {
    const collection = plantCollection.collection(config.plantCollectionName);
    const indoorPlants = await collection.find({ indoor: true }).toArray();
    res.json(indoorPlants);
  } catch (error) {
    console.error('Error searching for indoor plants:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get plants by edible
router.get('/edible-plants', async (req, res) => {
  try {
    const collection = plantCollection.collection(config.plantCollectionName);
    const ediblePlants = await collection.find({ edible: true }).toArray();
    res.json(ediblePlants);
  } catch (error) {
    console.error('Error searching for edible plants:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Search by plant name
router.get('/plant/:plantName', async (req, res) => {
  try {
    const collection = plantCollection.collection(config.plantCollectionName);
    const searchRegex = new RegExp(req.params.plantName, 'i');
    const plants = await collection.find({ plant_name: { $regex: searchRegex } }).toArray();
    res.json(plants);
  } catch (error) {
    console.error('Error searching plants by name:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// Search by plant difficulty
router.get('/difficulty/:plantDifficulty', async (req: Request, res: Response) => {
  try {
    const collection = plantCollection.collection(config.plantCollectionName);
    const plants = await collection.find({ difficulty: req.params.plantDifficulty }).toArray();
    res.json(plants);
  } catch (error) {
    console.error('Error searching plants by difficulty:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Search by family name
router.get('/family/:familyName', async (req: Request, res: Response) => {
  try {
    const collection = plantCollection.collection(config.plantCollectionName);
    const plants = await collection.find({ family_name: req.params.familyName }).toArray();
    res.json(plants);
  } catch (error) {
    console.error('Error searching plants by family name:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Search by scientific name
router.get('/scientific/:scientificName', async (req: Request, res: Response) => {
  try {
    const collection = plantCollection.collection(config.plantCollectionName);
    const plants = await collection.find({ scientific_name: req.params.scientificName }).toArray();
    res.json(plants);
  } catch (error) {
    console.error('Error searching plants by scientific name:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Add a new plant
router.post('', async (req: Request, res: Response) => {
  try {
    const newPlant = req.body;
    const collection = plantCollection.collection(config.plantCollectionName);
    const result = await collection.insertOne(newPlant);

    const insertedId = result.insertedId;
    const insertedDocument = await collection.findOne({ _id: insertedId });
    res.json(insertedDocument);
  } catch (error) {
    console.error('Error adding plant:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Update a plant by ID
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const plantId = req.params.id;
    const updatedPlant = req.body;

    delete updatedPlant._id;

    const collection = plantCollection.collection(config.plantCollectionName);
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
  }
});


// Delete a plant by ID
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const result = await plantCollection.findOneAndDelete({ _id: new ObjectId(req.params.id) });
    if (!result.value) {
      res.status(404).json({ error: 'Plant not found' });
    } else {
      res.json({ message: 'Plant deleted successfully' });
    }
  } catch (error) {
    console.error('Error deleting plant:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;