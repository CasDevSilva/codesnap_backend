import express from "express"
import cors from "cors";
import helmet from "helmet";
import SnippetRouter from "./router/SnippetRouter.js";
import SystemRouter from "./router/SystemRouter.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

// Security
app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Routes
app.use("/api/snippets", SnippetRouter);
app.use("/api/health", SystemRouter);

// Error handler (siempre al final)
app.use(errorHandler);

export default app;