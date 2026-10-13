require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const Invoice = require('./models/invoice');
const User = require('./models/user');
const apiRoutes  = require('./routes/route')

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://rahulkatravath03_db_user:Rahull123@cluster0.0gnueg6.mongodb.net/invoicetracker?retryWrites=true&w=majority'
;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));


let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGO_URI, {
      bufferCommands: false, // Stop waiting 10s if connection drops
      serverSelectionTimeoutMS: 5000 // Fail fast in 5s if IP is blocked
    }).then((m) => m);
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

app.use(async (req, res, next) => {
  if (req.path.startsWith('/api')) {
    try {
      await connectDB();
    } catch (err) {
      console.error('MongoDB connection failure:', err.message);
      return res.status(500).json({ 
        error: 'Database connection failed', 
        details: err.message 
      });
    }
  }
  next();
})

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


if (require.main === module) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}
module.exports = app;