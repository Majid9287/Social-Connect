import mongoose from "mongoose";

const StorySchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  visibility: { type: String, enum: ['public', 'followers'], default: 'public' },
  totalViews: { type: Number, default: 0 }, // Total views field
  liked: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    default: [],
  },
  contributions:{
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Contribution" }],
    default: [],
  }, 
}, { timestamps: true });

export default mongoose.models.Story || mongoose.model('Story', StorySchema);
