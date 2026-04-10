import express from "express";
import { shorten, redirect, getStats, getAllCountries, getAllClicks, getDashboardData, trackClick, deleteLink } from "../controller/testcontroller.js";
import { register, login, logout, getMe } from "../controller/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// 0. Auth Routes
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", protect, getMe);

// 1. Create short link
router.post("/shorten", protect, shorten);

// 2. View statistics for a link
router.get("/stats/:code", protect, getStats);

// 3. Get dashboard statistics and link list
router.get("/dashboard-stats", protect, getDashboardData);

// 3. Get all unique countries from database
router.get("/countries", protect, getAllCountries);

// 4. Get ALL clicks from ALL links
router.get("/all-clicks", protect, getAllClicks);

// 5. Track click data from browser
router.post("/track-click", trackClick);

// 6. Delete a link
router.delete("/links/:id", protect, deleteLink);


export default router;
