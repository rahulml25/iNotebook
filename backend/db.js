const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const connection = await mongoose.connect(process.env.DATABASE_URI);
    console.log('Connected to Mongo Successfully');
  } catch (error) {
    console.error(error);
    process.exit()
  }
};

module.exports = connectDB;
