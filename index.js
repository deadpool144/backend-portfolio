import dotenv from "dotenv";
import { app } from "./src/app.js";
import {connectDB} from "./src/db/connectDB.js";

dotenv.config();



const PORT = process.env.PORT || 5000;



connectDB()
.then(()=>{
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    })
})
.catch((err)=>{
    console.log("Failed to connect to DB", err);
})