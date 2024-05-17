import Story from "@lib/models/Story";
import User from "@lib/models/User";
import { connectToDB } from "@lib/mongodb/mongoose";

// Delete Story API
export const DELETE = async (req, { params }) => {
  try {
    await connectToDB();

    const { id } = params;

    const story = await Story.findByIdAndDelete(id);

    if (!story) {
      return new Response("Story not found", { status: 404 });
    }
    await Contribution.deleteMany({ story: id }); 
    const authorId = story.author._id;
    console.log(authorId)
    await User.findByIdAndUpdate(
      authorId,
      { $pull: { stories: id } }
    );

    return new Response("Story deleted successfully", { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response("Failed to delete story", { status: 500 });
  }
};
