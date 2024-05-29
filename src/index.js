import { connectDB } from "./config/db.js";
import 'dotenv/config'
import { app } from "./app.js"


connectDB()
    .then(app.listen(process.env.PORT || 8080, () => {
        console.log(`Server is running on port ${process.env.PORT}`)
    }))
    .catch((err) => {
        console.log("DB connection err", err)
    })