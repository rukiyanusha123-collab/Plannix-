import jwt from "jsonwebtoken";
export const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            res.status(401).json({ message: "Access token required" });
            return;
        }
        const token = authHeader.split(" ")[1];
        const secret = process.env.JWT_SECRET;
        if (!token || !secret) {
            res.status(401).json({ message: "Invalid token or server configuration" });
            return;
        }
        const decoded = jwt.verify(token, secret);
        req.userId = decoded.userId;
        next();
    }
    catch {
        res.status(401).json({ message: "Invalid or expired token" });
    }
};
