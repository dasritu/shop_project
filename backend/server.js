const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

const machineRoutes = require('./routes/machines');
app.use('/api/machines', machineRoutes);

const billRoutes = require('./routes/billRouter');
app.use('/api/bills', billRoutes);

// Connect to MongoDB
const uri = 'mongodb+srv://rituparnadas:dasritu@cluster0.vlwdlmh.mongodb.net/shopDB?retryWrites=true&w=majority'; // Replace with your MongoDB URI
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log('MongoDB connection error:', err));

// Start the server
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});

