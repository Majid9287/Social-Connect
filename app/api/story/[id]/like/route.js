import Story from "@lib/models/Story";
import { pusherServer } from "@lib/pusher"; // Import Pusher server instance
import { connectToDB } from "@lib/mongodb/mongoose";

// Like Comment API
export const POST = async (req,{params}) => {
  try {
    await connectToDB();
    const body = await req.json();

    const { id } =  params;
    const { userId } = body;
    const story = await Story.findById(id);

    // Toggle the like status of the comment
    const likedIndex = story.liked.indexOf(userId ); // Check if the user already liked the comment
    if (likedIndex === -1) {
      // If the user hasn't liked the comment, add the user ID to the liked array
      story.liked.push(userId);
    } else {
      // If the user already liked the comment, remove the user ID from the liked array
      story.liked.splice(likedIndex, 1);
    }

    // Save the updated comment
    await story.save();

    // Send a Pusher event to notify clients about the liked comment
    pusherServer.trigger(`story-${id}-liked`, "like", { id, liked: story.liked });

    return new Response(" like status updated successfully", { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response("Failed to update  like status", { status: 500 });
  }
};
