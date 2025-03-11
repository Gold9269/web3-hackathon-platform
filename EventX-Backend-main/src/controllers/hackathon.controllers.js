import jwt from 'jsonwebtoken'
import mongoose from "mongoose"
import {User} from '../models/user.model.js'
import { Hackathon } from '../models/hackathon.model.js'
import uploadOnCloudinary from '../utils/cloudinary.js'
import { Round } from '../models/round.model.js'
import {Submission} from "../models/submission.model.js"


export const browseHackathons = async(req,res)=>{
    try {
      const hackathons = await Hackathon.find()
      if(!hackathons) res.status(404).json({
        message: "No hackathons are available"
      })
      res.status(200).json({hackathons})
    } catch (error) {
      res.status(500).json(error.message)
    }
}

export const registerHackathon = async (req,res)=>{
    try {
        const {name, description, finaleDate, prizePool, votingOpen, maxTeamSize, roundTotal} = req.body;
        
        if(
            [name, description, finaleDate].some((field)=> field?.trim()==="" )
        ){
            throw new Error("Fill all the fields");
        }
        if (prizePool ==null || votingOpen ==null || prizePool === null || maxTeamSize === null || roundTotal== null) {
          return res.status(400).json({ message: "Fill all the fields" });
        }
    
        const existedHackathon = await Hackathon.findOne({name});
        if(existedHackathon){
            return res.status(400).json({ message: "Name already exists" });
        }
        const user = req.user;
        const organizerId = user._id;
        const hackathon = await Hackathon.create({
                 name,
                 organizerId,
                 description,
                 finaleDate, 
                 prizePool, 
                 votingOpen, 
                 maxTeamSize, 
                 roundTotal
                })
        
                const bannerLocalPath = req.file.path;

                if(!bannerLocalPath){
                    throw new Error("Please upload an banner");
                }
            
                const banner = await uploadOnCloudinary(bannerLocalPath)
            
                if(!banner.url){
                    throw new Error("Error while uploading banner");
                }
    
                await Hackathon.findByIdAndUpdate(
                  hackathon._id,
                  {
                      $set: { banner: banner.url }
                  }
              );
      
              await User.findByIdAndUpdate(user._id, {
                  $push: { ownedHackathons: hackathon._id }
              });
    
        res.status(201).json({ success: true, hackathon });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

export const getHackathonDetails = async (req,res) =>{
    try {
        const hackathon = await Hackathon.findById(req.params.id);
        if(!hackathon) return res.status(404).json({ message: 'Hackathon not found' });

        res.status(200).json({success: true, hackathon});
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const addRound = async (req, res) => {
    try {
      const { id } = req.params;
  
      const hackathon = await Hackathon.findById(id);
      if (!hackathon) return res.status(404).json({ message: "Hackathon not found" });
  
      if (hackathon.roundAt > hackathon.roundTotal) {
        return res.status(400).json({ message: "All rounds are already added" });
      }
  
      const round = await Round.create({
        hackathonId:hackathon._id,
        roundNumber: hackathon.roundAt + 1,
        roundName: req.body.roundName || `Round ${hackathon.roundAt + 1}`,
        roundType: req.body.roundType,
        judgingCriteria: req.body.judgingCriteria,
        startDate: req.body.startDate,
        endDate: req.body.endDate,
      });
  
      hackathon.roundAt += 1;
      await hackathon.save();
  
      res.status(201).json({ success: true, round });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

export const getRounds = async (req,res)=>{
  const {id} = req.params;
  const response = await Round.find({hackathonId:id})

  if (response.length === 0) { // ✅ Correct empty check
    return res.status(404).json({ message: 'No rounds found for this Hackathon' });
  }
  return res.status(200).json(response)
}

export const getSubmissionsForHackathon = async (req, res) => {
  try {
    const { name } = req.params;

    // Find the hackathon by name
    const hackathon = await Hackathon.findOne({ name: name });
    if (!hackathon) {
      return res.status(404).json({ message: "Hackathon not found" });
    }

    // Fetch submissions for all rounds of this hackathon
    const submissions = await Submission.find({ hackathonName: hackathon.name })
      .populate("roundId teamId");

    res.status(200).json({ success: true, submissions });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const announceWinnersAndNextRound = async (req, res) => {
    try {
      const { hackathonName, roundId, winners } = req.body;
  
      const hackathon = await Hackathon.findOne({name:hackathonName});
      if (!hackathon) return res.status(404).json({ message: "Hackathon not found" });

      const round = await Round.findById(roundId);
      if (!round) return res.status(404).json({ message: "Round not found" });
  
      await Round.findByIdAndDelete(roundId);

      await Submission.deleteMany({ roundId });
  
      // Check if the hackathon has reached the final round
      if (hackathon.roundAt === hackathon.roundTotal) {
        hackathon.winners = winners;
        await hackathon.save();
        return res.status(200).json({ success: true, message: "Final round completed. Winners announced." });
      }
  
      // Create the next round
      const nextRound = await Round.create({
        hackathonName,
        roundNumber: hackathon.roundAt + 1,
        roundName: `Round ${hackathon.roundAt + 1}`,
        roundType: req.body.nextRoundType,
        judgingCriteria: req.body.judgingCriteria,
        startDate: req.body.startDate,
        endDate: req.body.endDate,
      });
  
      // Increment `roundAt`
      hackathon.roundAt += 1;
      await hackathon.save();
  
      res.status(201).json({ success: true, message: "Next round created", nextRound });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
    

  