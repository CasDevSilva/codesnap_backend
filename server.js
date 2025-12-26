import 'dotenv/config';
import { connectDatabase } from "./src/config/database.js";
import app from "./src/app.js";

const PORT = process.env.PORT || 3000;

connectDatabase()
    .then(() => {
        console.log("✅ MongoDB conectado")

        app.listen(PORT, () => {
            console.log(`🚀 Server en puerto ${PORT}`)
            console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`)
        })
    })
    .catch((err) => {
        console.error("❌ Error MongoDB:", err.message)
        process.exit(1)
    });