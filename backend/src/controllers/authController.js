import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User";
const generateToken = (userId) => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error("JWT_SECRET is missing in .env file");
    }
    return jwt.sign({ userId }, secret, { expiresIn: "7d" });
};
// REGISTER
export const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }
        const normalizedEmail = email.toLowerCase().trim();
        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
            return res.status(409).json({
                message: "Email already registered. Please login.",
            });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword,
        });
        const token = generateToken(user._id.toString());
        return res.status(201).json({
            message: "Registration successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
            },
        });
    }
    catch (error) {
        console.error("Register Error:", error);
        return res.status(500).json({ message: "Registration failed" });
    }
};
// LOGIN
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required",
            });
        }
        const normalizedEmail = email.toLowerCase().trim();
        const user = await User.findOne({ email: normalizedEmail });
        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password",
            });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                message: "Invalid email or password",
            });
        }
        const token = generateToken(user._id.toString());
        return res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
            },
        });
    }
    catch (error) {
        console.error("Login Error:", error);
        return res.status(500).json({ message: "Login failed" });
    }
};
// GET CURRENT USER
export const getMe = async (req, res) => {
    try {
        const userId = req.userId;
        const user = await User.findById(userId).select("-password");
        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }
        return res.status(200).json({
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
            },
        });
    }
    catch (error) {
        console.error("Get Me Error:", error);
        return res.status(500).json({
            message: "Failed to fetch user",
        });
    }
};
