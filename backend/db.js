const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const connect = await mongoose.connect(process.env.DATABASE_URI);
    console.log(`Connected to Mongo: ${connect.connection.host}`);
  } catch (error) {
    console.error(error);
    process.exit()
  }
};

module.exports = connectDB;
