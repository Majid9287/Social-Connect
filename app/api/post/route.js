import Post from "@lib/models/Post";
import { connectToDB } from "@lib/mongodb/mongoose";

export const GET = async (req) => {
  try {
    await connectToDB();

    const feedPosts = await Post.find()
      .populate("creator likes")
      .sort({ createdAt: -1 }) // Sort by createdAt in descending order (-1)
      .exec();

    return new Response(JSON.stringify(feedPosts), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response("Failed to fetch all Feed Posts", { status: 500 });
  }
};
