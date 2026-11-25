import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db";
import authRoutes from "./routes/authRoutes";
import taskRoutes from "./routes/taskRoutes";
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());
app.get("/", (_req, res) => {
    res.json({ message: "Plannix Backend is Running 🌿" });
});
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
const startServer = async () => {
    try {
        await connectDB();
        app.listen(PORT, () => {
            console.log(`Plannix server running on port ${PORT}`);
        });
    }
    catch (error) {
        console.error("Server startup failed:", error);
        process.exit(1);
    }
};
startServer();
