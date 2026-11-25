import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGO_URI;

    if (!mongoURI) {
      throw new Error("MONGO_URI is missing in .env file");
    }

    await mongoose.connect(mongoURI, {
      dbName: "Plannix",
    });

    console.log("MongoDB Connected Successfully 🌿");
    console.log("Database Name:", mongoose.connection.name);
  } catch (error) {
    console.error("MongoDB Connection Failed:", error);
    process.exit(1);
  }
};

export default connectDB;