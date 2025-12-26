import express from "express"
import cors from "cors";
import helmet from "helmet";
import SnippetRouter from "./router/SnippetRouter.js";
import SystemRouter from "./router/SystemRouter.js";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.use("/api/snippets", SnippetRouter);
app.use("/api/health", SystemRouter);

export default app;