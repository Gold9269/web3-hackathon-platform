import mongoose from "mongoose";

const SubmissionSchema = new mongoose.Schema({
  hackathonName:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hackathon',
  },
  roundId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Round", 
    required: true 
  },
  teamId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Team", 
    required: true 
  },
  submissionUrl: { 
    type: String, 
    required: true 
  },
  submittedAt: { 
    type: Date, 
    default: Date.now 
  }
});

export const Submission = mongoose.model("Submission", SubmissionSchema);
