import Contribution from "@lib/models/Contribution";
import { connectToDB } from "@lib/mongodb/mongoose";
import { pusherServer } from "@lib/pusher";

export const PUT = async (req, { params }) => {
  try {
    await connectToDB();
    const { id: contributionId } = params;
    const { userId } = await req.json();

    // Find and update the contribution
    const updatedContribution = await Contribution.findByIdAndUpdate(
      contributionId,
      { $addToSet: { disliked: userId } },
      { new: true }
    ).populate("disliked");

    // Get the story ID from the updated contribution
    const storyId = updatedContribution.Story;

    // Check if the user ID is in the disliked array to determine the current dislike status
    const disliked = updatedContribution.disliked.some(
      (id) => id.toString() === userId
    );
    const dislikeCount = updatedContribution.disliked.length;

    // Trigger a Pusher event to notify clients about the disliked contribution
    pusherServer.trigger(
      `story-${storyId}-contributions`,
      "dislike",
      { contributionId, disliked, dislikeCount }
    );

    return new Response("Contribution disliked successfully", { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response("Failed to dislike contribution", { status: 500 });
  }
};
