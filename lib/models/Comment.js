import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Post' // Reference the Post model if it exists in your project
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User' // Reference the User model if it exists in your project
  },
  liked: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment' // Reference the Comment model itself for replies (optional)
  },
  replies:  {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment'}],
    default: []
  },}
);
export default mongoose.models.Comment ||
  mongoose.model("Comment", commentSchema)
