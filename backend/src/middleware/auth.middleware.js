import { verifyToken } from "../utils/jwt.js";

export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.status(401).json({ error: "No token provided" });
  }

  // Validate Bearer format
  if (!authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Invalid authorization format" });
  }

  const token = authHeader.split(" ")[1];

  const decoded = verifyToken(token);

  if (!decoded) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }

  // Attach user info from token
  req.user = decoded;

  next();
};
