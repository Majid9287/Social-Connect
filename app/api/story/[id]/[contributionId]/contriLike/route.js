import Contribution from "@lib/models/Contribution";
import { pusherServer } from "@lib/pusher"; 
import { connectToDB } from "@lib/mongodb/mongoose";

export const PUT = async (req, { params }) => {
  try {
    await connectToDB();

    const {id, contributionId } = params;
    const data = await req.formData();
    const userId = data.get("userId");
    
    const contribution = await Contribution.findById(contributionId);

    if (!contribution) {
      return new Response("Contribution not found", { status: 404 });
    }

    // Toggle the like status
    const likedIndex = contribution.liked.indexOf(userId);
    if (likedIndex === -1) {
      contribution.liked.push(userId);
    } else {
      contribution.liked.splice(likedIndex, 1);
    }

    await contribution.save();

    // Send a Pusher event with the story ID and the updated liked array
    pusherServer.trigger(
      `story-${id}-contributions`, 
      "like", 
      { contributionId, liked:contribution.liked }
    );

    // Return a valid JSON response
    return new Response(
      JSON.stringify({ 
        message: "Like status updated successfully",
        liked: contribution.liked  // Include updated liked status
      }), 
      { status: 200 }
    );
  } catch (err) {
    console.error(err);
    return new Response("Failed to update like status", { status: 500 });
  }
};
