require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const { MongoMemoryServer } = require('mongodb-memory-server');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());

// Connect to MongoDB with automatic fallback to memory server
const connectDB = async () => {
  try {
    console.log('Attempting to connect to local MongoDB...');
    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 2000 });
    console.log('MongoDB Connected locally');
  } catch (err) {
    console.log('Local MongoDB not found. Starting in-memory database for testing...');
    const mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
    console.log('MongoDB Connected to In-Memory Server');
  }
};

connectDB();

// Routes
app.use('/api/auth',     require('./routes/auth'));
app.use('/api/profile',  require('./routes/profile'));
app.use('/api/feedback', require('./routes/feedback'));

// Serve Frontend in Production / Static Files
app.use(express.static(path.join(__dirname, '../frontend/dist')));

app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../frontend/dist', 'index.html'));
});
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
