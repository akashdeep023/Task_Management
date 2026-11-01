const mongoose = require("mongoose");

async function connectDatabase() {
  const uri =
    process.env.MONGODB_URI ||
    process.env.MONGO_URL ||
    process.env.MONGO_PUBLIC_URL;

  if (!uri) {
    throw new Error(
      "MongoDB connection string not configured. Define MONGODB_URI, MONGO_URL or MONGO_PUBLIC_URL."
    );
  }

  const dbName = process.env.MONGODB_DB_NAME || "task_management";

  await mongoose.connect(uri, {
    dbName,
    serverSelectionTimeoutMS: 10000,
  });

  console.log(`MongoDB connected to database: ${mongoose.connection.name}`);
}

module.exports = connectDatabase;
