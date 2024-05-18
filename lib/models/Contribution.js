import mongoose from "mongoose";

const ContributionSchema = new mongoose.Schema({
  content: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
  story: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Story",
    required: true,
  },
  status: {
    type: String,
    enum: ["show", "hidden"],
    default: "show",
  },

  liked: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    default: [],
  },
  
  disliked: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    default: [],
  },
});

export default mongoose.models.Contribution ||
  mongoose.model("Contribution", ContributionSchema);
