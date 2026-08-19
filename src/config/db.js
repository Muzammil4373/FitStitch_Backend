import mongoose from "mongoose";
import { config } from 'dotenv';

export const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;

    console.log("Mongo URI exists:", !!uri);

    if (!uri) {
      throw new Error("MONGO_URI is not defined in .env");
    }

    await mongoose.connect(uri);

    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    process.exit(1);
  }
};