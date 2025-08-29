// server/server.js
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import { Server } from "socket.io";
import http from "http";
import { v2 as cloudinary } from "cloudinary";
import connectDB from "./lib/db.js";
import userRouter from "./routes/userRoutes.js";
import messageRouter from "./routes/messageRoutes.js";

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Export Cloudinary instance
export { cloudinary };

// Creating express app and HTTPserver
const app = express();
const server = http.createServer(app);

// Socket setup
export const io = new Server(server, {
    cors: {
        origin: "*",
        credentials: true,
    },
});

// Store online users
export const userSocketMap = {}; // {userId: socketId}

// Socket connection handler
io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;
    console.log("User connected", userId);

    if (userId && userId !== "undefined") {
        userSocketMap[userId] = socket.id;
    }

    // Emit online users to all connected clients
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    socket.on("disconnect", () => {
        console.log("User disconnected", userId);
        if (userId) {
            delete userSocketMap[userId];
        }
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
});

// Middleware setup
app.use(express.json({ limit: "10mb" }));
app.use(cors({
    origin: "*",
    credentials: true,
    allowedHeaders: ["token", "Content-Type"],
    exposedHeaders: ["token"],
}));

// Debug middleware to log all requests
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
});

// Routes Setup
app.use("/api/status", (req, res) => {
    res.send("Server is running...");
});
app.use("/api/auth", userRouter);
app.use("/api/messages", messageRouter);

// Connect to MongoDB
await connectDB();


if (process.env.NODE_ENV !== "production") {
    // Set port
    const PORT = process.env.PORT || 5001;

    // Start the server
    server.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

// Export server for Vercel
export default server;