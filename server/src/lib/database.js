const mongoose = require("mongoose");

mongoose.set("strictQuery", true);

async function connectDB(uri) {
  if (!uri) {
    throw new Error("Missing MongoDB connection string.");
  }

  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  // Use a single shared connection for the entire API process.
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000
  });

  return mongoose.connection;
}

module.exports = { connectDB };
