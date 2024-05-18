import User from "@lib/models/User";
import { connectToDB } from "@lib/mongodb/mongoose";

export const POST = async (req, { params }) => {
  try {
    await connectToDB();

    const userId = params.id;
    const postId = params.postId;

    const user = await User.findOne({ clerkId: userId }).populate(
      "posts savedPosts likedPosts following followers"
    );

    if (!user) {
      return new Response("User not found", { status: 404 });
    }

    const isSaved = user.savedPosts.some((item) => item.toString() === postId);

    const update = isSaved
      ? { $pull: { savedPosts: postId } }
      : { $addToSet: { savedPosts: postId } };

    await User.findByIdAndUpdate(user._id, update, { new: true });

    return new Response(JSON.stringify(user), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response("Failed to save/unsave post", { status: 500 });
  }
};
