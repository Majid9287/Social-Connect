import Comment from "@lib/models/Comment";
import { pusherServer } from "@lib/pusher"; // Import Pusher server instance
import { connectToDB } from "@lib/mongodb/mongoose";

// Like Comment API
export const POST = async (req,{params}) => {
  try {
    await connectToDB();
    const body = await req.json();

    const { commentId,postId } =  params;
    const { userId } = body;
    // Find the comment by ID
    const comment = await Comment.findById(commentId);

    // Toggle the like status of the comment
    const likedIndex = comment.liked.indexOf(userId ); // Check if the user already liked the comment
    if (likedIndex === -1) {
      // If the user hasn't liked the comment, add the user ID to the liked array
      comment.liked.push(userId);
    } else {
      // If the user already liked the comment, remove the user ID from the liked array
      comment.liked.splice(likedIndex, 1);
    }

    // Save the updated comment
    await comment.save();

    // Send a Pusher event to notify clients about the liked comment
    pusherServer.trigger(`comment-${postId}-liked`, "like", { commentId, liked: comment.liked });

    return new Response("Comment like status updated successfully", { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response("Failed to update comment like status", { status: 500 });
  }
};
