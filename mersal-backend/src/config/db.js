const mongoose = require('mongoose');

const connectDatabase = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
      throw new Error('MONGO_URI is not defined in environment variables');
    }

    await mongoose.connect(mongoUri);

    console.log('========================================');
    console.log('MERSAL DATABASE');
    console.log('========================================');
    console.log('MongoDB connected successfully');
    console.log(`Database: ${mongoose.connection.name}`);
    console.log('========================================');
  } catch (error) {
    console.error('========================================');
    console.error('DATABASE CONNECTION ERROR');
    console.error('========================================');
    console.error(error.message);

    process.exit(1);
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB disconnected');
});

mongoose.connection.on('reconnected', () => {
  console.log('MongoDB reconnected');
});

module.exports = connectDatabase;
