import jwt from "jsonwebtoken";

// Function to generate JWT token
export const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "1d" }); // <-- 'id' is the payload
};