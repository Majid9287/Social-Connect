import Comment from "@lib/models/Comment";
import User from "@lib/models/User";
import { connectToDB } from "@lib/mongodb/mongoose";

export const GET = async (req, { params }) => {
  try {
    await connectToDB();
    const { postId } = params;

    const comments = await Comment.find({ postId, parentId: null })
      .populate({
        path: "user",
        model: User,
      })
      .populate({
        path: "replies",
        model: Comment,
        populate: [
          { path: "user", model: User },
          { // Recursively populate further replies
            path: "replies",
            model: Comment,
            populate: [
              { path: "user", model: User },
              { path: "replies", model: Comment, populate: [{ path: "user", model: User }] }, // Limit depth if needed
            ],
          },
        ],
      })
      .exec();

    return new Response(JSON.stringify(comments), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response("Failed to get comments", { status: 500 });
  }
};
