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
    roundAt: {
      type: Number,
      required: true,
    },
    description:{
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

export const Team = mongoose.model("Team", teamSchema);

