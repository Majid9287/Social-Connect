import Contribution from "@lib/models/Contribution";
import { connectToDB } from "@lib/mongodb/mongoose";
import { pusherServer } from "@lib/pusher";
export const PUT = async (req, { params }) => {
  try {
    await connectToDB();
    const { id,contributionId } = params;

    // Check if the contribution exists
    const contribution = await Contribution.findById(contributionId);
    if (!contribution) {
      return new Response("Contribution not found", { status: 404 });
    }

    // Update the contribution status to "show" (or any other appropriate status)
    contribution.status = "show"; // Update the status as needed
    await contribution.save();
 // Trigger a Pusher event with the more specific channel name
 pusherServer.trigger(`story-${id}-contribution-show`, 'contribution-show', { updatedContribution:contribution });

    return new Response("Contribution shown successfully", { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response("Failed to show contribution", { status: 500 });
  }
};
