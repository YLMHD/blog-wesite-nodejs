const mongoose = require("mongoose");

// Connect to the database

const ConnectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
    });
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
};

module.exports = ConnectDB;