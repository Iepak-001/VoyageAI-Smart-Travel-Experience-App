const express = require('express');
const router = express.Router();
const City = require('../models/City');

// Get city details
router.get('/:cityName', async (req, res) => {
  const { cityName } = req.params;
  try {
    const city = await City.findOne({ name: new RegExp(`^${cityName}$`, 'i') });
    if (!city) return res.status(404).json({ message: 'City not found' });
    res.json(city);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get places of a city
router.get('/:cityName/places', async (req, res) => {
  const { cityName } = req.params;
  try {
    const city = await City.findOne({ name: new RegExp(`^${cityName}$`, 'i') });
    if (!city) return res.status(404).json({ message: 'City not found' });
    res.json(city.places || []);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add a place to a city
router.post('/:cityName/places', async (req, res) => {
  const { cityName } = req.params;
  const { name, description, imageUrl } = req.body;

  try {
    const city = await City.findOne({ name: new RegExp(`^${cityName}$`, 'i') });
    if (!city) return res.status(404).json({ message: 'City not found' });

    city.places.push({ name, description, imageUrl });
    await city.save();

    res.status(201).json({ message: 'Place added', place: { name, description, imageUrl } });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get YouTube videos (dummy)
router.get('/:cityName/videos', async (req, res) => {
  const { cityName } = req.params;

  const dummyVideos = [
    {
      title: `Top places to visit in ${cityName}`,
      videoId: 'dQw4w9WgXcQ',
      thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg'
    },
    {
      title: `Things to do in ${cityName}`,
      videoId: 'eY52Zsg-KVI',
      thumbnail: 'https://img.youtube.com/vi/eY52Zsg-KVI/hqdefault.jpg'
    }
  ];

  res.json(dummyVideos);
});

module.exports = router;
