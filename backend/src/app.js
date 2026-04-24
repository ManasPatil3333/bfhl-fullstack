const express = require('express');
const cors = require('cors');

const bfhlRoutes = require('./routes/bfhlRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/bfhl', bfhlRoutes);

// Health check
app.get('/', (req, res) => {
    res.send('BFHL API is running...');
});

module.exports = app;