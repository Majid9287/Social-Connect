import Contribution from "@lib/models/Contribution";
import Story from "@lib/models/Story";
import User from "@lib/models/User";
import { connectToDB } from "@lib/mongodb/mongoose";
import { pusherServer } from "@lib/pusher";

export const POST = async (req, { params }) => {
  try {
    await connectToDB();
    const data = await req.formData();
    const content = data.get("content");
    const authorId = data.get("authorId");
    const { id } = params; 
    const story = await Story.findById(id);
    if (!story) {
      return new Response("Story not found", { status: 404 });
    }

    // Check if the author exists
    const author = await User.findById(authorId);
    if (!author) {
      return new Response("Author not found", { status: 404 });
    }

    // Create a new contribution
    const contribution = new Contribution({
      content,
      author: authorId,
      story: id,
    });

    // Save the contribution
    await contribution.save();

    // Update the corresponding story
    story.contributions.push(contribution._id);
    await story.save();

    // Populate author field of the contribution
    const populatedContribution = await Contribution.findById(contribution._id)
      .populate({
        path: "author",
        model: User,
        select: "_id username profilePhoto",
      })
      .lean();

    // Trigger a Pusher event to notify clients about the new contribution
    pusherServer.trigger(`story-${id}-contributions`, "new-contribution", populatedContribution);

    return new Response(JSON.stringify(contribution), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response("Failed to add contribution", { status: 500 });
  }
};
