import Comment from "@lib/models/Comment";
import { pusherServer } from "@lib/pusher"; // Import Pusher server instance
import { connectToDB } from "@lib/mongodb/mongoose";

// Delete Comment API
export const DELETE = async (req, { params }) => {
  try {
    await connectToDB();

    const { commentId,postId  } = params;

    // Find the comment by ID and delete it
    await Comment.findByIdAndDelete(commentId);

    // Send a Pusher event to notify clients about the deleted comment
    pusherServer.trigger(`comment-${postId}-deleted`, "delete", { commentId });

    return new Response("Comment deleted successfully", { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response("Failed to delete comment", { status: 500 });
  }
};

