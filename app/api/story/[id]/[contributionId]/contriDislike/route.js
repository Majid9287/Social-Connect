import Contribution from "@lib/models/Contribution";
import { pusherServer } from "@lib/pusher";
import { connectToDB } from "@lib/mongodb/mongoose";

export const PUT = async (req, { params }) => {
  try {
    await connectToDB();
    const { id,contributionId } = params;
    const data = await req.formData();
    const userId = data.get("userId");
     console.log(id, contributionId,userId )
    const contribution = await Contribution.findById(contributionId);

    if (!contribution) {
      return new Response("Contribution not found", { status: 404 });
    }

    // Toggle the dislike status
    const dislikedIndex = contribution.disliked.indexOf(userId); 

    if (dislikedIndex === -1) {
      contribution.disliked.push(userId);
    } else {
      contribution.disliked.splice(dislikedIndex, 1);
    }

    await contribution.save();

    // Send a Pusher event with the story ID and the updated disliked array
    pusherServer.trigger(
      `story-${id}-contributions`,
      "dislike",
      { contributionId, disliked: contribution.disliked } // Only send disliked
    );

    // Return a valid JSON response (only including disliked)
    return new Response(
      JSON.stringify({
        message: "Dislike status updated successfully",
        disliked:contribution.disliked,
      }),
      { status: 200 }
    );
  } catch (err) {
    console.error(err);
    return new Response("Failed to update dislike status", { status: 500 });
  }
};
