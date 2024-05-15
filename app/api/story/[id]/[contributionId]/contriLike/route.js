import Contribution from "@lib/models/Contribution";
import { connectToDB } from "@lib/mongodb/mongoose";
import { pusherServer } from "@lib/pusher";  // Import Pusher

export const PUT = async (req, { params }) => {
  try {
    await connectToDB();
    const { id, contributionId } = params; 
    const { userId } = await req.json();

    // Find and update the contribution (use addToSet to avoid duplicates)
    const updatedContribution = await Contribution.findByIdAndUpdate(
      contributionId,
      { $addToSet: { liked: userId } }, 
      { new: true }
    ).populate("liked"); // Populate liked users

    // Get the story ID from the updated contribution
    const storyId = updatedContribution.Story;

    // Check if the user ID is in the liked array to determine the current like status
    const liked = updatedContribution.liked.some((id) => id.toString() === userId);
    const likeCount = updatedContribution.liked.length;

    // Trigger a Pusher event to notify clients about the liked contribution
    pusherServer.trigger(
      `story-${storyId}-contributions`, // Use the story ID for the channel
      "like",
      { contributionId, liked, likeCount } 
    );

    return new Response("Contribution liked successfully", { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response("Failed to like contribution", { status: 500 });
  }
};

