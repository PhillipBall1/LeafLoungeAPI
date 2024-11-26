"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_1 = require("mongodb");
const db = require('../database/db');
const express = require('express');
const router = express.Router();
router.get('/plants', async (req, res) => {
    try {
        const plantCollection = db.getPlantCollection();
        const plants = await plantCollection.find({}).toArray();
        res.json(plants);
    }
    catch (error) {
        res.status(500).send(error.message);
    }
});
// Get plant by ID
router.get('/plants/:id', async (req, res) => {
    try {
        const plantCollection = db.getPlantCollection();
        const plant = await plantCollection.findOne({ _id: new mongodb_1.ObjectId(req.params.id) });
        if (!plant) {
            res.status(404).json({ error: 'Plant not found' });
        }
        else {
            res.json(plant);
        }
    }
    catch (error) {
        console.error('Error retrieving plant by ID:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
// Get plants by featured
router.get('/featured-plants', async (req, res) => {
    try {
        const plantCollection = db.getPlantCollection();
        const featuredPlants = await plantCollection.find({ featured: true }).toArray();
        res.json(featuredPlants);
    }
    catch (error) {
        console.error('Error searching for featured plants:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
// Get plants by indoor
router.get('/indoor-plants', async (req, res) => {
    try {
        const plantCollection = db.getPlantCollection();
        const indoorPlants = await plantCollection.find({ indoor: true }).toArray();
        res.json(indoorPlants);
    }
    catch (error) {
        console.error('Error searching for indoor plants:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
// Get plants by edible
router.get('/edible-plants', async (req, res) => {
    try {
        const plantCollection = db.getPlantCollection();
        const ediblePlants = await plantCollection.find({ edible: true }).toArray();
        res.json(ediblePlants);
    }
    catch (error) {
        console.error('Error searching for edible plants:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
// Search by plant name
router.get('/plant/:plantName', async (req, res) => {
    try {
        const plantCollection = db.getPlantCollection();
        const searchRegex = new RegExp(req.params.plantName, 'i');
        const plants = await plantCollection.find({ plant_name: { $regex: searchRegex } }).toArray();
        res.json(plants);
    }
    catch (error) {
        console.error('Error searching plants by name:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
// Search by plant difficulty
router.get('/difficulty/:plantDifficulty', async (req, res) => {
    try {
        const plantCollection = db.getPlantCollection();
        const plants = await plantCollection.find({ difficulty: req.params.plantDifficulty }).toArray();
        res.json(plants);
    }
    catch (error) {
        console.error('Error searching plants by difficulty:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
// Search by family name
router.get('/family/:familyName', async (req, res) => {
    try {
        const plantCollection = db.getPlantCollection();
        const plants = await plantCollection.find({ family_name: req.params.familyName }).toArray();
        res.json(plants);
    }
    catch (error) {
        console.error('Error searching plants by family name:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
// Search by scientific name
router.get('/scientific/:scientificName', async (req, res) => {
    try {
        const plantCollection = db.getPlantCollection();
        const plants = await plantCollection.find({ scientific_name: req.params.scientificName }).toArray();
        res.json(plants);
    }
    catch (error) {
        console.error('Error searching plants by scientific name:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
// Add a new plant
router.post('/plants', async (req, res) => {
    try {
        const plantCollection = db.getPlantCollection();
        const newPlant = req.body;
        const result = await plantCollection.insertOne(newPlant);
        const insertedId = result.insertedId;
        const insertedDocument = await plantCollection.findOne({ _id: insertedId });
        res.json(insertedDocument);
    }
    catch (error) {
        console.error('Error adding plant:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
// Update a plant by ID
router.put('/plants/:id', async (req, res) => {
    try {
        const plantId = req.params.id;
        const updatedPlant = req.body;
        delete updatedPlant._id;
        const plantCollection = db.getPlantCollection();
        const result = await plantCollection.findOneAndUpdate({ _id: new mongodb_1.ObjectId(plantId) }, { $set: updatedPlant }, { returnDocument: 'after' });
        if (!result.value) {
            res.status(404).json({ error: 'Plant not found' });
        }
        else {
            res.json(result.value);
        }
    }
    catch (error) {
        console.error('Error updating plant:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
// Delete a plant by ID
router.delete('/plants/:id', async (req, res) => {
    try {
        const plantCollection = db.getPlantCollection();
        const result = await plantCollection.findOneAndDelete({ _id: new mongodb_1.ObjectId(req.params.id) });
        if (!result.value) {
            res.status(404).json({ error: 'Plant not found' });
        }
        else {
            res.json({ message: 'Plant deleted successfully' });
        }
    }
    catch (error) {
        console.error('Error deleting plant:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
module.exports = router;
