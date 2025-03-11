import mongoose from "mongoose";

const hackathonSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique:true
    },
    description: {
      type: String,
      required: true,
    },
    organizerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    finaleDate: {
      type: Date,
      required: true,
    },
    prizePool: {
      type: Number,
      required: true,
    },
    votingOpen: {
      type: Boolean,
      default: false,
    },
    maxTeamSize: {
      type: Number,
      required: true,
    },
    roundTotal: {
      type: Number,
      required: true,
    },
    roundAt: {
      type: Number,
      default: 1,
    },
    banner:{
      type:String,
    }
    },
  { timestamps: true }
);

export const Hackathon = mongoose.model("Hackathon", hackathonSchema);

