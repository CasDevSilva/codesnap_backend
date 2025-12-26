import mongoose from "mongoose"

const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/codesnap"

export function connectDatabase() {
    return mongoose.connect(uri)
}