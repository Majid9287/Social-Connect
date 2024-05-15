import mongoose from "mongoose";

let isConnected = false;

export const connectToDB = async () => {
  if (isConnected) {
    console.log("MongoDB is already connected");
    return;
  }

  try {
    mongoose.set("strictQuery", true);
    await mongoose.connect(process.env.MONGODB_URL, {
      dbName: "VibeZone",
    
    });
    isConnected = true;
    console.log("MongoDB is connected");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error; // Re-throw the error for handling in the route handler
  }
};

// In your API route (GET):
try {
  await connectToDB();
  // Rest of your code using the connected database
} catch (error) {
  console.error("Error:", error);
  // Handle the error appropriately (e.g., return a 500 status code)
}
