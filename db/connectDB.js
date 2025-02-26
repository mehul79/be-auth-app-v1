import mongoose from "mongoose";

export const connectDB = async () => {
    try {
      const conn = await mongoose.connect(process.env.MONOGO_URI, {
        serverSelectionTimeoutMS: 5000, // Add timeout
        connectTimeoutMS: 10000
      });
      console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
      console.error(`Error: ${error.message}`);
      process.exit(1);
    }
  };