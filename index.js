import app from "./api/index.js";
import path from "path";
import express from "express";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.resolve(__dirname, "dist");

// Serve static files locally (Vercel handles this automatically in production)
app.use(express.static(distPath));
app.get("/*path", (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(distPath, "index.html"));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Local development server started on http://localhost:${PORT}`);
});
