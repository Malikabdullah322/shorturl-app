import jwt from "jsonwebtoken";
import prisma from "../config/db.js";

export const protect = async (req, res, next) => {
  let token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ error: "Not authorized, no token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, name: true, email: true }
    });
    
    if (!req.user) {
      return res.status(401).json({ error: "User no longer exists" });
    }
    
    next();
  } catch (error) {
    console.error("Auth error:", error);
    res.status(401).json({ error: "Not authorized, token failed" });
  }
};
