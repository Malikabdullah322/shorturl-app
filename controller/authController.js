import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../config/db.js";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30m" });
};

export const register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const userExists = await prisma.user.findUnique({ where: { email } });
    if (userExists) return res.status(400).json({ error: "User already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword }
    });

    const token = generateToken(user.id);
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 30 * 60 * 1000, // 30 minutes
      sameSite: "strict",
      path: "/"
    });

    res.status(201).json({ id: user.id, name: user.name, email: user.email });
  } catch (err) {
    console.error("Registration Error:", err);
    res.status(500).json({ error: "Server error during registration" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ error: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    const token = generateToken(user.id);
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 30 * 60 * 1000, // 30 minutes
      sameSite: "strict",
      path: "/"
    });

    res.json({ id: user.id, name: user.name, email: user.email });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ error: "Server error during login" });
  }
};

export const logout = (req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(0),
    path: "/" // Ensure path matches exactly
  });
  res.json({ message: "Logged out successfully" });
};

export const getMe = (req, res) => {
  res.json(req.user);
};
