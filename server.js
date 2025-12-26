import { connectDatabase } from "./src/config/database.js";
import app from "./src/app.js";

connectDatabase()
    .then(()=>{
        console.log("Conectado a mongo")

        app.listen(3000, () => {
            console.log("Desplegado en puerto 3000")
        })
    })
    .catch(()=>{
        console.log("Error al conectarse a mongo")
    });