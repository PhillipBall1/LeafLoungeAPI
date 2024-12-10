import { ObjectId } from "mongodb";
import { Request, Response } from 'express';
const db = require('../database/db');
const express = require('express');
const router = express.Router();
const logger = require('./logger');


router.get('/plants', async (req, res) => {
  logger.info('Entering /api/plants');
  try {
    const plantCollection = db.getPlantCollection();
    const plants = await plantCollection.find({}).toArray();
    logger.info('Exiting /api/plants');
    res.json(plants);
  } catch (error) {
    logger.error(`Error in /api/plants: ${error.message}`);
    res.status(500).send(error.message);
  }
});

// Get plant by ID
router.get('/plants/:id', async (req: Request, res: Response) => {
  logger.info(`GET /plants/:id - Request received with ID: ${req.params.id}`);

  try {
    const plantCollection = db.getPlantCollection();
    logger.info('Attempting to retrieve plant collection from database');

    const plant = await plantCollection.findOne({ _id: new ObjectId(req.params.id) });

    if (!plant) {
      logger.warn(`Plant with ID ${req.params.id} not found`);
      res.status(404).json({ error: 'Plant not found' });
    } else {
      logger.info(`Plant retrieved successfully: ${JSON.stringify(plant)}`);
      res.json(plant);
    }
  } catch (error) {
    logger.error(`Error retrieving plant by ID: ${req.params.id}. Error: ${error.message}`);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get plants by featured
router.get('/featured-plants', async (req, res) => {
  logger.info('Received request to get featured plants');
  try {
    const plantCollection = db.getPlantCollection();
    const featuredPlants = await plantCollection.find({ featured: true }).toArray();
    logger.info('Successfully retrieved featured plants', { count: featuredPlants.length });
    res.json(featuredPlants);
  } catch (error) {
    logger.error('Error searching for featured plants', { error: error.message });
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get plants by indoor
router.get('/indoor-plants', async (req, res) => {
  logger.info('Received request to get indoor plants');
  try {
    const plantCollection = db.getPlantCollection();
    const indoorPlants = await plantCollection.find({ indoor: true }).toArray();
    logger.info('Successfully retrieved indoor plants', { count: indoorPlants.length });
    res.json(indoorPlants);
  } catch (error) {
    logger.error('Error searching for indoor plants', { error: error.message });
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get plants by edible
router.get('/edible-plants', async (req, res) => {
  try {
    logger.info('Request received to fetch edible plants.');
    const plantCollection = db.getPlantCollection();
    const ediblePlants = await plantCollection.find({ edible: true }).toArray();
    logger.info(`Successfully retrieved ${ediblePlants.length} edible plants.`);
    res.json(ediblePlants);
  } catch (error) {
    logger.error('Error searching for edible plants:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Search by plant name
router.get('/plant/:plantName', async (req, res) => {
  try {
    const plantName = req.params.plantName;
    logger.info(`Request received to search for plants with name matching: ${plantName}`);
    const plantCollection = db.getPlantCollection();
    const searchRegex = new RegExp(plantName, 'i');
    const plants = await plantCollection.find({ plant_name: { $regex: searchRegex } }).toArray();
    logger.info(`Successfully retrieved ${plants.length} plants matching name: ${plantName}`);
    res.json(plants);
  } catch (error) {
    logger.error(`Error searching plants by name "${req.params.plantName}":`, error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Search by plant difficulty
router.get('/difficulty/:plantDifficulty', async (req: Request, res: Response) => {
  try {
    const plantDifficulty = req.params.plantDifficulty;
    logger.info(`Request received to search for plants with difficulty: ${plantDifficulty}`);
    const plantCollection = db.getPlantCollection();
    const plants = await plantCollection.find({ difficulty: plantDifficulty }).toArray();
    logger.info(`Successfully retrieved ${plants.length} plants with difficulty: ${plantDifficulty}`);
    res.json(plants);
  } catch (error) {
    logger.error(`Error searching plants by difficulty "${req.params.plantDifficulty}":`, error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Search by family name
router.get('/family/:familyName', async (req: Request, res: Response) => {
  const familyName = req.params.familyName;
  try {
    logger.info(`Request received to search for plants in family: ${familyName}`);
    const plantCollection = db.getPlantCollection();
    const plants = await plantCollection.find({ family_name: familyName }).toArray();
    logger.info(`Successfully retrieved ${plants.length} plants in family: ${familyName}`);
    res.json(plants);
  } catch (error) {
    logger.error(`Error searching plants by family name "${familyName}":`, error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Search by scientific name
router.get('/scientific/:scientificName', async (req: Request, res: Response) => {
  const scientificName = req.params.scientificName;
  try {
    logger.info(`Request received to search for plants with scientific name: ${scientificName}`);
    const plantCollection = db.getPlantCollection();
    const plants = await plantCollection.find({ scientific_name: scientificName }).toArray();
    logger.info(`Successfully retrieved ${plants.length} plants with scientific name: ${scientificName}`);
    res.json(plants);
  } catch (error) {
    logger.error(`Error searching plants by scientific name "${scientificName}":`, error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Add a new plant
router.post('/plants', async (req: Request, res: Response) => {
  const newPlant = req.body;
  try {
    logger.info(`Request received to add a new plant: ${JSON.stringify(newPlant)}`);
    const plantCollection = db.getPlantCollection();
    const result = await plantCollection.insertOne(newPlant);

    if (result.insertedCount === 1) {
      const insertedId = result.insertedId;
      logger.info(`Plant added successfully with ID: ${insertedId}`);
      const insertedDocument = await plantCollection.findOne({ _id: insertedId });
      res.json(insertedDocument);
    } else {
      logger.error('Failed to insert the plant. No document inserted.');
      res.status(500).json({ error: 'Failed to add plant' });
    }
  } catch (error) {
    logger.error('Error adding plant:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Update a plant by ID
router.put('/plants/:id', async (req, res) => {
  try {
    const plantId = req.params.id;
    const updatedPlant = req.body;

    // Log the update attempt
    logger.info(`Attempting to update plant with ID: ${plantId}`);

    delete updatedPlant._id;
    const plantCollection = db.getPlantCollection();
    const result = await plantCollection.findOneAndUpdate(
      { _id: new ObjectId(plantId) },
      { $set: updatedPlant },
      { returnDocument: 'after' }
    );

    if (!result.value) {
      logger.warn(`Plant with ID: ${plantId} not found`);
      res.status(404).json({ error: 'Plant not found' });
    } else {
      logger.info(`Plant with ID: ${plantId} updated successfully`);
      res.json(result.value);
    }
  } catch (error) {
    logger.error('Error updating plant:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Delete a plant by ID
router.delete('/plants/:id', async (req, res) => {
  try {
    const plantId = req.params.id;
    logger.info(`Attempting to delete plant with ID: ${plantId}`);

    const plantCollection = db.getPlantCollection();
    const result = await plantCollection.findOneAndDelete({ _id: new ObjectId(plantId) });

    if (!result.value) {
      logger.warn(`Plant with ID: ${plantId} not found`);
      res.status(404).json({ error: 'Plant not found' });
    } else {
      logger.info(`Plant with ID: ${plantId} deleted successfully`);
      res.json({ message: 'Plant deleted successfully' });
    }
  } catch (error) {
    logger.error('Error deleting plant:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;