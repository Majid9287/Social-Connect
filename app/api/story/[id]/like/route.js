import Story from "@lib/models/Story";
import { pusherServer } from "@lib/pusher"; 
import { connectToDB } from "@lib/mongodb/mongoose";

// Like Story API
export const POST = async (req, { params }) => {
  try {
    await connectToDB();
    const body = await req.json();
    const { id } = params;
    const { userId } = body;
    const story = await Story.findById(id);

    if (!story) {
      return new Response("Story not found", { status: 404 }); // Handle missing story
    }

    // Toggle the like status
    const likedIndex = story.liked.indexOf(userId);
    if (likedIndex === -1) {
      story.liked.push(userId);
    } else {
      story.liked.splice(likedIndex, 1);
    }

    await story.save();

    // Send a Pusher event with the story ID and the updated liked array
    pusherServer.trigger(
      `story-${id}-liked`, 
      "like", 
      { id, liked: story.liked }
    );

    // Return a valid JSON response
    return new Response(
      JSON.stringify({ 
        message: "Like status updated successfully",
        liked: story.liked  // Include updated liked status
      }), 
      { status: 200 }
    );
  } catch (err) {
    console.error(err);
    return new Response("Failed to update like status", { status: 500 });
  }
};
