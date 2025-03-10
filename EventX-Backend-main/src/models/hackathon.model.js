import mongoose from "mongoose";

const hackathonSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    organizerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    finaleDate: {
      type: Date,
      required: true,
    },
    prizePool: {
      type: Number,
      required: true,
    },
    isVoteActive: {
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
  },
  { timestamps: true }
);

export const Hackathon = mongoose.model("Hackathon", hackathonSchema);

