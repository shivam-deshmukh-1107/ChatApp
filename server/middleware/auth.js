// middleware/auth.js
// import jwt from "jsonwebtoken";
// import User from "../models/User.js";

// // Middleware to check if user is authenticated
// export const protectRoute = async (req, res, next) => {
//     try {
//         const token = req.headers.token;
//         const decoded = jwt.verify(token, process.env.JWT_SECRET);
//         const user = await User.findById(decoded.userId).select("-password");
//         if (!user) {
//             return res.status(401).json({ message: "User not found." });
//         }
//         req.user = user;
//         next();
//     } catch (error) {
//         console.log(error.message);
//         res.status(401).json({ message: "Unauthorized User", error: error.message });
//     }
// }

// // middleware/auth.js
// import jwt from "jsonwebtoken";
// import User from "../models/User.js";

// export const protectRoute = async (req, res, next) => {
//     try {
//         const token = req.headers.token;
//         if (!token) {
//             return res.status(401).json({ success: false, message: "No token provided" });
//         }

//         const decoded = jwt.verify(token, process.env.JWT_SECRET);

//         // accept multiple claim names to be backward/forward-compatible
//         const uid = decoded.userId || decoded.id || decoded._id;
//         if (!uid) {
//             return res.status(401).json({ success: false, message: "Invalid token payload" });
//         }

//         const user = await User.findById(uid).select("-password");
//         if (!user) {
//             return res.status(401).json({ success: false, message: "User not found." });
//         }

//         req.user = user;
//         next();
//     } catch (error) {
//         return res.status(401).json({ success: false, message: "Unauthorized User", error: error.message });
//     }
// };

// server/middleware/auth.js - Debug version
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protectRoute = async (req, res, next) => {
    try {
        const token = req.headers.token;

        if (!token) {
            return res.status(401).json({ success: false, message: "No token provided" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // accept multiple claim names to be backward/forward-compatible
        const uid = decoded.userId || decoded.id || decoded._id;

        if (!uid) {
            return res.status(401).json({ success: false, message: "Invalid token payload" });
        }

        const user = await User.findById(uid).select("-password");

        if (!user) {
            return res.status(401).json({ success: false, message: "User not found." });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error("Auth middleware error:", error.message);
        return res.status(401).json({ success: false, message: "Unauthorized User", error: error.message });
    }
};

