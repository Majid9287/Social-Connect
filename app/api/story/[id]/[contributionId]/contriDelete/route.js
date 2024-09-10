import Contribution from "@lib/models/Contribution";
import Story from "@lib/models/Story";
import { connectToDB } from "@lib/mongodb/mongoose";
import { pusherServer } from "@/lib/pusher";

export const DELETE = async (req, { params }) => {
  try {
    await connectToDB();
    const { id, contributionId } = params; 
    const contribution = await Contribution.findById(contributionId);
    if (!contribution) {
      return new Response("Contribution not found", { status: 404 });
    }

    const story = await Story.findByIdAndUpdate(
      id,
      { $pull: { contributions: contributionId } },
      { new: true } 
    );

    if (!story) {
      return new Response("Story not found", { status: 404 });
    }

    await contribution.deleteOne(); 

    // Trigger a Pusher event with the more specific channel name
    pusherServer.trigger(`story-${id}-contribution-deleted`, 'contribution-deleted', { contributionId });

    return new Response("Contribution deleted successfully", { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response("Failed to delete contribution", { status: 500 });
  }
};
