import { Router } from "express";
import { generateSnippet, getSnippetById, getSnippetImage } from "../controllers/SnippetController.js";

const SnippetRouter = Router();

SnippetRouter.post("/generate", generateSnippet);
SnippetRouter.get("/:id", getSnippetById);
SnippetRouter.get("/:id/image", getSnippetImage);


export default SnippetRouter;