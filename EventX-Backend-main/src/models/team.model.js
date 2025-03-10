// Updated Team Model
import mongoose from "mongoose";

const teamSchema = new mongoose.Schema(
  {
    hackathonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hackathon",
      required: true,
    },
    teamName: {
      type: String,
      required: true,
    },
    leaderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    memberIds: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
      default: [],
    },
    memberEmails: {
      type: [String],
      default: [],
    },
    roundAt: {
      type: Number,
      required: true,
    },
    resumeScore:{
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

const Team = mongoose.model("Team", teamSchema);

export default Team;