const express = require('express');
const Machine = require('../models/Machine');
const Bill = require('../models/Bill');
const router = express.Router();

let cart = []; // Consider using a database for cart persistence

// Add a new machine
router.post('/add', async (req, res) => {
  const newMachine = new Machine(req.body);
  try {
    await newMachine.save();
    res.status(201).json(newMachine);
  } catch (err) {
    res.status(400).json({ message: 'Error adding machine: ' + err.message });
  }
});


// Get all machines
router.get('/', async (req, res) => {
  try {
    const machines = await Machine.find();
    res.json(machines);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching machines: ' + err.message });
  }
});

// Get machine by name
router.get('/:name', async (req, res) => {
  try {
    const machine = await Machine.findOne({ name: req.params.name });
    if (machine) {
      res.json(machine);
    } else {
      res.status(404).json({ message: 'Machine not found' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Error fetching machine: ' + err.message });
  }
});

// Add product to cart
router.post('/cart/add', async (req, res) => {
  const { id, quantity } = req.body;
  const qty = parseInt(quantity, 10);

  if (!Number.isInteger(qty) || qty <= 0) {
    return res.status(400).json({ message: 'Invalid quantity' });
  }

  try {
    const machine = await Machine.findById(id);
    if (machine && machine.quantity >= qty) {
      // Deduct quantity from the machine
      machine.quantity -= qty;
      await machine.save();

      // Add to cart or update existing item
      const cartItemIndex = cart.findIndex(item => item.id === id);
      if (cartItemIndex > -1) {
        cart[cartItemIndex].quantity += qty;
      } else {
        cart.push({ id, quantity: qty });
      }
      res.status(200).json({ message: 'Product added to cart' });
    } else {
      res.status(400).json({ message: 'Insufficient quantity or machine not found' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Error adding product to cart: ' + err.message });
  }
});

// Get cart details
// Get cart details
router.get('/cart', async (req, res) => {
  try {
    const cartDetails = await Promise.all(
      cart.map(async item => {
        const machine = await Machine.findById(item.id);
        if (machine) {
          const actualPrice = machine.sellPrice * item.quantity; // Use sellPrice
          const gstPrice = actualPrice * 0.18;
          const totalPrice = actualPrice + gstPrice;
          return {
            ...machine.toObject(),
            quantity: item.quantity,
            totalPrice,
            gstPrice
          };
        } else {
          return null;
        }
      })
    ).then(results => results.filter(result => result !== null)); // Filter out null values

    res.json(cartDetails);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching cart details: ' + err.message });
  }
});

router.get('/cart/bill', async (req, res) => {
  try {
    const cartDetails = await Promise.all(
      cart.map(async item => {
        const machine = await Machine.findById(item.id);
        if (machine) {
          const totalPrice = machine.sellPrice * item.quantity; // Use sellPrice
          const gstPrice = totalPrice * 0.18; // Calculate GST
          return {
            ...machine.toObject(),
            quantity: item.quantity,
            totalPrice: totalPrice + gstPrice, // Total price including GST
            gstPrice
          };
        } else {
          return null;
        }
      })
    ).then(results => results.filter(result => result !== null)); // Filter out null values

    // Calculate total bill including GST
    const totalBill = cartDetails.reduce((acc, item) => {
      acc.totalPrice += item.totalPrice;
      acc.gstPrice += item.gstPrice;
      return acc;
    }, { totalPrice: 0, gstPrice: 0 });

    res.json({ cartDetails, ...totalBill });
  } catch (err) {
    res.status(500).json({ message: 'Error generating bill: ' + err.message });
  }
});


// Delete a machine by ID
router.delete('/:id', async (req, res) => {
  try {
    const machine = await Machine.findByIdAndDelete(req.params.id);
    if (machine) {
      res.status(200).json({ message: 'Machine deleted successfully' });
    } else {
      res.status(404).json({ message: 'Machine not found' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Error deleting machine: ' + err.message });
  }
});

// Delete a machine from the cart and update its quantity
// Remove product from cart
router.delete('/cart/delete', async (req, res) => {
  const { id, quantity } = req.body;

  try {
    // Find the machine by ID
    const machine = await Machine.findById(id);

    if (!machine) {
      return res.status(404).json({ message: 'Machine not found' });
    }

    // Update the machine's quantity
    machine.quantity += quantity;
    await machine.save();

    // Remove the item from the cart
    cart = cart.filter(item => item.id !== id);
    
    res.status(200).json({ message: 'Item successfully removed from cart and returned to product list' });
  } catch (error) {
    console.error('Error removing item from cart:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/save', async (req, res) => {
  console.log('Request received:', req.body); // Log the request body
  const { customerName, customerPhone, cartDetails, totalPrice, gstPrice } = req.body;

  if (!customerName || !customerPhone) {
    return res.status(400).json({ message: 'Customer name and phone are required' });
  }

  try {
    const newBill = new Bill({
      customerName,
      customerPhone,
      cartDetails,
      totalPrice,
      gstPrice
    });

    await newBill.save();

    res.status(201).json({ message: 'Bill saved successfully', bill: newBill });
    cart = []; 
  } catch (error) {
    console.error('Error saving bill:', error);
    res.status(500).json({ message: 'Failed to save bill' });
  }
});

module.exports = router;
