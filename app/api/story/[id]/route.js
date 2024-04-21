import Story from "@lib/models/Story";
import User from "@lib/models/User";
import { connectToDB } from "@lib/mongodb/mongoose";

export const GET = async (req, { params }) => {
  try {
    await connectToDB();

    const story = await Story.findByIdAndUpdate(params.id, { $inc: { totalViews: 1 } }, { new: true })
      .populate('author')
      .populate({
        path: 'contributions',
        populate: {
          path: 'author',
          model: User,
        },
      })
      .exec();

    return new Response(JSON.stringify(story), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response("Failed to get story", { status: 500 });
  }
};
