import dotenv from 'dotenv';
dotenv.config({
    path: '../.env'
});
import { connectDB } from "./db/connectDB.js";
import { app } from "./app.js";


connectDB()
    .then(() =>
        app.listen(3000,()=>{
        console.log("Listening on")
        }
    ))