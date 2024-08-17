// routes/billRoutes.js
const express = require('express');
const router = express.Router();
const Bill = require('../models/Bill');

// Route to get bill details by ID
router.get('/:id', async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id);
    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }
    res.json(bill);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});
router.get('/', async (req, res) => {
  try {
    const bills = await Bill.find();
    res.json(bills);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
module.exports = router;
