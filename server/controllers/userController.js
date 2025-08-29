// server/controllers/userController.js
import User from "../models/User.js";
import bcrypt from "bcrypt";
import { generateToken } from "../lib/utils.js";
import { cloudinary } from "../server.js";

// Signup a new user
export const signup = async (req, res) => {
    const { email, fullName, password, bio } = req.body;

    try {
        // Check if all fields are present
        if (!email || !fullName || !password || !bio) {
            return res.status(400).json({ message: "Missing Details!" });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists." });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const newUser = await User.create({ fullName, email, password: hashedPassword, bio });

        // Generate JWT token
        const token = generateToken(newUser._id);

        res.status(201).json({ success: true, user: newUser, token, message: "User created successfully." });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, message: "Error signing up: " + error.message });
    }
}

// Controller to login a user
export const login = async (req, res) => {

    try {
        const { email, password } = req.body;

        // Check if all fields are present
        if (!email || !password) {
            return res.status(400).json({ message: "Missing Details!" });
        }

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "User not found." });
        }

        // Compare password
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({ message: "Invalid password." });
        }

        // Generate JWT token
        const token = generateToken(user._id);

        res.status(200).json({ success: true, user, token, message: "User logged in successfully." });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, message: "Error logging in: " + error.message });
    }
}

// Controller to check if user is authenticated
export const checkAuth = async (req, res) => {
    res.status(200).json({ success: true, user: req.user, message: "User is authenticated." });
}

// Controller to update a profile details
export const updateProfile = async (req, res) => {
    try {
        const { fullName, bio, profilePic } = req.body;
        const userId = req.user._id;

        if (!userId) {
            return res.status(401).json({ success: false, message: "User not authenticated" });
        }

        if (!fullName || !bio) {
            return res.status(400).json({ success: false, message: "Full name and bio are required" });
        }

        let updatedUser;

        if (!profilePic) {
            updatedUser = await User.findByIdAndUpdate(
                userId,
                { fullName, bio },
                { new: true }
            ).select("-password");
        } else {

            if (!profilePic.startsWith('data:image/')) {
                return res.status(400).json({ success: false, message: "Invalid image format" });
            }

            const upload = await cloudinary.uploader.upload(profilePic, {
                folder: "chat-app-profiles",
                width: 500,
                height: 500,
                crop: "fill",
                resource_type: "image"
            });

            updatedUser = await User.findByIdAndUpdate(
                userId,
                { fullName, bio, profilePic: upload.secure_url },
                { new: true }
            ).select("-password");
        }

        res.status(200).json({
            success: true,
            user: updatedUser,
            message: "Profile updated successfully."
        });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({
            success: false,
            message: "Error updating profile: " + error.message
        });
    }
}
