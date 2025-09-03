import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const { connection } = await mongoose.connect(
      process.env.MONGODB_URI || ""
    );
    console.log(
      `MongoDB is Connected at : ${connection.host}: ${connection.port}`
    );
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

export default connectDB;
