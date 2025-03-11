import express from 'express'
import cookieParser from "cookie-parser"
import cors from 'cors'

const app = express();

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.urlencoded({extended:true,limit:"10mb"}))
app.use(express.json({limit:"10mb"}))
app.use(cookieParser())

import userRoutes from './routes/user.routes.js';
import hackathonRoutes from './routes/hackathonOrganizer.routes.js'
import participantRoutes from './routes/participants.routes.js';

app.use("/api/v1/user",userRoutes)
app.use("/api/v1/hackathon/organizer",hackathonRoutes)
app.use("/api/v1/hackathon/participant", participantRoutes);

export{app}
