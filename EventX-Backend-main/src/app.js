import express from 'express';
import cookieParser from "cookie-parser";
import cors from 'cors';
import userRoutes from './routes/user.routes.js';
import participantRoutes from './routes/participant.routes.js';

const app = express();

// Middleware setup
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.json({ limit: "16kb" }));
app.use(cookieParser());

// Routes
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/participant", participantRoutes);

// Error handling middleware (optional but recommended)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: "Something went wrong!",
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// 404 handler for unmatched routes
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found"
    });
});

export { app };