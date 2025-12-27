import mongoose from "mongoose";

const connectDB= async() => {
  try {
    console.log("Connecting to MongoDB...");
    console.log("URI:", process.env.MONGO_URI);
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Successfully connected to mongoDB :)");
  }
  catch(err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
}

export default connectDB;