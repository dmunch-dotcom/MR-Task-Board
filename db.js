const mongoose = require('mongoose');

async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error(
      'MONGODB_URI is not set. Add it to your .env file (see .env.example).'
    );
  }

  mongoose.set('strictQuery', true);

  await mongoose.connect(uri, {
    // These are the defaults in modern Mongoose/driver versions, but being
    // explicit makes intent clear and keeps this working across versions.
    serverSelectionTimeoutMS: 10000
  });

  console.log('✅ Connected to MongoDB Atlas');

  mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
  });
  mongoose.connection.on('disconnected', () => {
    console.warn('⚠️ MongoDB disconnected');
  });
}

module.exports = connectDB;
