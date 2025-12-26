import { Router } from "express";
import { generateSnippet, getSnippetById, getSnippetImage } from "../controllers/SnippetController.js";
import { generateLimiter } from "../middleware/rateLimiter.js";

const SnippetRouter = Router();

SnippetRouter.post("/generate", generateLimiter, generateSnippet);
SnippetRouter.get("/:id", getSnippetById);
SnippetRouter.get("/:id/image", getSnippetImage);

export default SnippetRouter;