import express from "express"
import cors from "cors";
import helmet from "helmet";
import SnippetRouter from "./router/SnippetRouter.js";
import SystemRouter from "./router/SystemRouter.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();
const allowedOrigins = [
    process.env.FRONTEND_URL,
    "http://localhost:5173",
    "http://localhost:3000"
].filter(Boolean);

// Security
app.use(helmet());
app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(null, true);
        }
    },
    credentials: true
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Routes
app.use("/api/snippets", SnippetRouter);
app.use("/api/health", SystemRouter);

app.get("/", (req, res) => {
    res.json({ message: "CodeSnap API", status: "running" });
});

// Error handler (siempre al final)
app.use(errorHandler);

export default app;