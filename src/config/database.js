import mongoose from "mongoose"

const uri = "mongodb://127.0.0.1:27017/codesnap"

export function connectDatabase() {
    return mongoose.connect(uri)
}