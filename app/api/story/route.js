import Story from "@lib/models/Story";
import { connectToDB } from "@lib/mongodb/mongoose";
import Contribution from "@lib/models/Contribution";
import User from "@lib/models/User";

export const GET = async (req) => {
  try {
    await connectToDB();

    const story = await Story.find()
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
    console.log(err);
    return new Response("Failed to fetch all Feed story", { status: 500 });
  }
};
