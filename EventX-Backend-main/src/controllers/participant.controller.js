import Team from '../models/team.model.js';
import { User } from '../models/user.model.js';
import { Hackathon } from '../models/hackathon.model.js';
import mongoose, { mongo } from "mongoose";

const createTeam = async (req, res) => {
  try {
    const {resumeScore,teamName, memberEmails = [] } = req.body;
    const {hackathonName} =req.params;
    const userId = req.user._id; // Assuming user ID comes from auth middleware

    if (!resumeScore || !teamName || !hackathonName) {
      return res.status(400).json({
        success: false,
        message: "Please provide team name and hackathon name and resume score",
      });
    }

    // Check if hackathon exists
    const hackathon = await Hackathon.findOne({ name: hackathonName });
    if (!hackathon) {
      return res.status(404).json({
        success: false,
        message: "Hackathon not found",
      });
    }

    // Get current user
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    const hackathonObjectId=new mongoose.Types.ObjectId(hackathon._id)
    // Check if user is already in a team for this hackathon
    const existingTeam = await Team.findOne({
      hackathonId: hackathonObjectId,
      $or: [{ leaderId: userId }, { memberIds: userId }],
    });

    if (existingTeam) {
      return res.status(400).json({
        success: false,
        message: "You are already part of a team for this hackathon",
      });
    }

    // Remove duplicates and self-email
    const uniqueEmails = [...new Set(memberEmails.map((email) => email.trim().toLowerCase()))].filter(
      (email) => email !== currentUser.email.toLowerCase()
    );

    if (uniqueEmails.length + 1 > hackathon.maxTeamSize) {
      return res.status(400).json({
        success: false,
        message: `Maximum team size for this hackathon is ${hackathon.maxTeamSize}`,
      });
    }

    // Find users by email
    const members = await User.find({ email: { $in: uniqueEmails } });

    if (members.length !== uniqueEmails.length) {
      const foundEmails = members.map((member) => member.email.toLowerCase());
      const missingEmails = uniqueEmails.filter((email) => !foundEmails.includes(email));

      return res.status(404).json({
        success: false,
        message: "Some members don't exist in the system",
        missingEmails,
      });
    }

    // Get member IDs
    const memberIds = members.map((member) => member._id);

    // Check if any members are already in a team for this hackathon
    const membersInTeams = await Team.find({
      hackathonId: hackathonObjectId,
      $or: [{ leaderId: { $in: memberIds } }, { memberIds: { $in: memberIds } }],
    }).populate("memberIds", "email");

    if (membersInTeams.length > 0) {
      const registeredEmails = new Set();

      for (const team of membersInTeams) {
        if (memberIds.some((id) => team.leaderId.equals(id))) {
          const leader = await User.findById(team.leaderId);
          if (leader) registeredEmails.add(leader.email);
        }

        for (const memberId of team.memberIds) {
          if (memberIds.some((id) => id.equals(memberId))) {
            const member = await User.findById(memberId);
            if (member) registeredEmails.add(member.email);
          }
        }
      }

      return res.status(400).json({
        success: false,
        message: "Some users are already in another team for this hackathon",
        registeredUsers: Array.from(registeredEmails),
      });
    }

    // Create the team
    const newTeam = await Team.create({
      hackathonId: hackathonObjectId,
      teamName,
      leaderId: userId,
      memberIds,
      memberEmails: uniqueEmails,
      roundAt: hackathon.roundAt,
      resumeScore:resumeScore
    });

    return res.status(201).json({
      success: true,
      message: "Team created successfully",
      team: newTeam,
    });
  } catch (error) {
    console.error("Error creating team:", error);
    return res.status(500).json({
      success: false,
      message: "Error creating team",
      error: error.message,
    });
  }
};

// Updated to handle email-based invitations
const joinTeam = async (req, res) => {
  try {
    const { teamName } = req.params;
    const userId = req.user._id;
    
    // Check if team exists
    const team = await Team.findOne({teamName:teamName});
    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team not found"
      });
    }
    
    // Check if the hackathon exists
    const hackathon = await Hackathon.findById(team.hackathonId);
    if (!hackathon) {
      return res.status(404).json({
        success: false,
        message: "Hackathon not found"
      });
    }
    
    // Check if user is already in this team
    if (team.leaderId.equals(userId) || team.memberIds.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: "You are already a member of this team"
      });
    }
    
    // Check if user is already in another team for this hackathon
    const existingTeam = await Team.findOne({
      hackathonId: team.hackathonId,
      $or: [
        { leaderId: userId },
        { memberIds: userId }
      ]
    });
    
    if (existingTeam) {
      return res.status(400).json({
        success: false,
        message: "You are already part of a team for this hackathon"
      });
    }
    
    // Check if team is already at max capacity
    if (team.memberIds.length + 1 >= hackathon.maxTeamSize) {
      return res.status(400).json({
        success: false,
        message: "Team is already at maximum capacity"
      });
    }
    // Add user to the team
    team.memberIds.push(userId);
    await team.save();
    
    return res.status(200).json({
      success: true,
      message: "Successfully joined the team",
      team
    });
    
  } catch (error) {
    console.error("Error joining team:", error);
    return res.status(500).json({
      success: false,
      message: "Error joining team",
      error: error.message
    });
  }
};

export { createTeam, joinTeam};