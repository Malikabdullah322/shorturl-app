import express from "express";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import testroutes from "./routes/testroutes.js";
import compression from 'compression';
import { redirect } from "./controller/testcontroller.js";
import cookieParser from 'cookie-parser';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.set('trust proxy', true);

// 1. Middleware
app.use(compression());
app.use(cookieParser());
app.use(express.json());

// 2. Static Files (Serve Frontend in production)
const distPath = path.join(__dirname, "dist");
app.use(express.static(distPath));

// 3. API and Redirection routes
app.use("/api", testroutes);

// 4. Catch-all for short links (Root level redirection)
app.get("/:code", redirect);

// 5. SPA Fallback (Serve index.html for unknown frontend routes)
app.get("/*path", (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server started on http://localhost:${PORT}`);
    // Keep event loop active (Heartbeat)
    setInterval(() => { }, 60000);
});
