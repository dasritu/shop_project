// models/Bill.js
const mongoose = require('mongoose');

const BillSchema = new mongoose.Schema({
  customerName: {
    type: String,
    required: true,
  },
  customerPhone: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  cartDetails: [{
    name: String,
    quantity: Number,
    costPrice: Number,
    purchasePrice: Number,
    totalPrice: Number,
    gstPrice: Number,
  }],
  totalPrice: {
    type: Number,
    required: true,
  },
  gstPrice: {
    type: Number,
    required: true,
  }
});

module.exports = mongoose.model('Bill', BillSchema);
