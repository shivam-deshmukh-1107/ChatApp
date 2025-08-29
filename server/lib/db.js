import mongoose from "mongoose";

// Connect to MongoDB
const connectDB = async () => {
    try {
        mongoose.connection.on("connected", () => {
            console.log("MongoDB Database connected");
        });
        
        await mongoose.connect(`${process.env.MONGODB_URL}/chat-app`);
    } catch (error) {
        console.log(error);
    }
};

export default connectDB;