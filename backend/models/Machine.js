const mongoose = require('mongoose');

const machineSchema = new mongoose.Schema({
  name: { type: String, required: true },
  purchasePrice: { type: Number, required: true },
  sellPrice: { type: Number, required: true }, // Added sellPrice
  purchaseDate: { type: Date, required: true },
  companyName: { type: String, required: true },
  quantity: { type: Number, required: true },
  category: { 
    type: String, 
    required: true,
    enum: ['power tools', 'fan', 'light', 'pump and motors'] // Valid categories
  }
});

module.exports = mongoose.model('Machine', machineSchema);
