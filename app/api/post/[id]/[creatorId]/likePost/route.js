
import User from "@lib/models/User"
import { pusherServer } from "@lib/pusher"; 
import { connectToDB } from "@lib/mongodb/mongoose";
import Post from "@lib/models/Post";
// Like Story API
export const PUT = async (req, { params }) => {
  try {
    await connectToDB();

    const { id,creatorId } = params;
    const post = await Post.findById(id);
    const user = await User.findById(creatorId)
    if (!post) {
      return new Response("not found", { status: 404 }); // Handle missing story
    }
    if (!user) {
      return new Response("not found", { status: 404 }); // Handle missing story
    }
    // Toggle the like status
    const likedIndex = post.likes.indexOf(creatorId);
    if (likedIndex === -1) {
      post.likes.push(creatorId);
      user.likedPosts.push(creatorId)
    } else {
      post.likes.splice(likedIndex, 1);
      user.likedPosts.pull(post._id);
    }

    await post.save();

    // Send a Pusher event with the story ID and the updated liked array
    pusherServer.trigger(
      `post-${id}-liked`, 
      "like", 
      { id, liked: post.likes }
    );

    // Return a valid JSON response
    return new Response(
      JSON.stringify({ 
        message: "Like status updated successfully",
        liked: post.likes  // Include updated liked status
      }), 
      { status: 200 }
    );
  } catch (err) {
    console.error(err);
    return new Response("Failed to update like status", { status: 500 });
  }
};
