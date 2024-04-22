import Story from "@lib/models/Story";
import User from "@lib/models/User";
import { connectToDB } from "@lib/mongodb/mongoose";

export const GET = async (req, { params }) => {
  try {
    await connectToDB();

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
      return { status: 404, body: "Story not found" };
    }

    story.totalViews += 1;
    await story.save();

    return { status: 200, body: story };
  } catch (err) {
    console.error(err);
    return { status: 500, body: "Failed to get story" };
  }
};
