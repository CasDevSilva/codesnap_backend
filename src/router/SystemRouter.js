import mongoose from "mongoose";
import { Router } from "express";

const SystemRouter = Router();

SystemRouter.get("/", (request, response) => {
    let mIntDbState = mongoose.connection.readyState;

    response.status(mIntDbState === 1 ? 200: 503);

    return response.json({
        "status"    : mIntDbState === 1 ? "ok": "error",
        "timestamp" : new Date(),
        "database"  : mIntDbState === 1 ? "connected": "disconnected"
    });
})

export default SystemRouter;