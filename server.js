const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const Invoice = require('./models/invoice');
const User = require('./models/user');
const apiRoutes  = require('./routes/route')

const app = express();
const PORT = process.env.PORT || 2000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/invoicetracker';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Database Connection
mongoose.connect(MONGO_URI)
  .then(() => console.log('Connected to MongoDB successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

// Helper: Calculate Totals
function calculateTotals(items, taxPercent = 0) {
  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const tax = (subtotal * taxPercent) / 100;
  const totalAmount = subtotal + tax;
  return { subtotal, totalAmount };
}

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.use('/api', apiRoutes)


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;