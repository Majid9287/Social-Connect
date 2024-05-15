import Comment from "@lib/models/Comment";
import { pusherServer } from "@lib/pusher"; // Import Pusher server instance
import { connectToDB } from "@lib/mongodb/mongoose";

// Delete Comment API
export const DELETE = async (req, { params }) => {
  try {
    await connectToDB();

    const { commentId } = params;

    // Find the comment by ID and delete it
    await Comment.findByIdAndDelete(commentId);

    // Send a Pusher event to notify clients about the deleted comment
    pusherServer.trigger("comment-deleted", "delete", { commentId });

    return new Response("Comment deleted successfully", { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response("Failed to delete comment", { status: 500 });
  }
};

// Like Comment API
export const POST = async (req) => {
  try {
    await connectToDB();

    const { commentId } = await req.json();

    // Find the comment by ID
    const comment = await Comment.findById(commentId);

    // Toggle the like status of the comment
    comment.liked = !comment.liked;

    // Save the updated comment
    await comment.save();

    // Send a Pusher event to notify clients about the liked comment
    pusherServer.trigger(`comment-${postId}-liked`, "like", { commentId, liked: comment.liked });

    return new Response("Comment liked successfully", { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response("Failed to like comment", { status: 500 });
  }
};
