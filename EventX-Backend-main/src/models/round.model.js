import mongoose from "mongoose";

const roundSchema = new mongoose.Schema(
  {
    hackathonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hackathon",
      required: true,
    },
    roundNumber: {
      type: Number,
      required: true,
    },
    roundName: {
      type: String,
      required: true,
    },
    roundType: {
      type: String,
      enum: [
        "Profile Reviewing",
        "Presentation Submission",
        "Judging",
        "Finale Round",
      ],
      required: true,
    },
    judgingCriteria: {
      type: String,
      required: true,
    },
    winners: {
      type: [String],
      default: [],
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

export const Round = mongoose.model("Round", roundSchema);


