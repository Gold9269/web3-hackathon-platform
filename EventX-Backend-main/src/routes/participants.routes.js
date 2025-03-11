import { createTeam, joinTeam ,getAllTeams, getTeam } from '../controllers/participant.controller.js';
import { verifyJWT } from '../middleware/verifyJWT.middleware.js';
import express from 'express';

const router=express.Router();
router.route("/create-team/:hackathonName").post( verifyJWT, createTeam);
//router.route("/join-team/:teamName").post(verifyJWT,joinTeam);
router.route("/allteam/:hackathonId").get(verifyJWT,getAllTeams)
router.route("/join-team/:id").post(verifyJWT,joinTeam)
router.route("/team-details/:id").get(verifyJWT,getTeam)

export default router;