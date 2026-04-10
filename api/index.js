import express from "express";
import dotenv from "dotenv";
import testroutes from "../routes/testroutes.js";
import compression from 'compression';
import { redirect } from "../controller/testcontroller.js";
import cookieParser from 'cookie-parser';

dotenv.config();

const app = express();
app.set('trust proxy', true);

// 1. Middleware
app.use(compression());
app.use(cookieParser());
app.use(express.json());

// 2. API Routes
app.use("/api", testroutes);

// 3. Root level redirection for short codes
// This allows your domain.com/XYZ to redirect properly
app.get("/:code", redirect);

export default app;
