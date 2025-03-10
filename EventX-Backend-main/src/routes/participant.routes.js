import { createTeam, joinTeam } from '../controllers/participant.controller.js';
import { verifyJWT } from '../middleware/verifyJWT.middleware.js';
import express from 'express';

const router=express.Router();
router.post("/create-team/:hackathonName", verifyJWT, createTeam);
router.post("/join-team/:teamName",verifyJWT,joinTeam);

export default router;