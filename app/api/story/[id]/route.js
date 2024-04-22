import Story from "@lib/models/Story";
import User from "@lib/models/User";
import { connectToDB } from "@lib/mongodb/mongoose";

export const GET = async (req, { params }) => {
  try {
    await connectToDB();

    // Fetch the story by its ID
    const story = await Story.findById(params.id)
      .populate('author')
      .populate({
        path: 'contributions',
        populate: {
          path: 'author',
          model: User,
        },
      })
      .exec();

    if (!story) {
      return new Response("Story not found", { status: 404 });
    }

    // Increment the totalViews field
    story.totalViews += 1;

    // Save the updated story
    await story.save();

    return new Response(JSON.stringify(story), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response("Failed to get story", { status: 500 });
  }
};
