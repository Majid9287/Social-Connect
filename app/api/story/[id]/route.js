import Story from "@lib/models/Story";
import User from "@lib/models/User";
import { connectToDB } from "@lib/mongodb/mongoose";

import Contribution from "@lib/models/Contribution";
export const GET = async (req, { params }) => {
  try {
    await connectToDB();

    // Fetch the story by its ID with projection and lean
    const story = await Story.findById(params.id)
      .select('-__v -updatedAt') // Exclude unnecessary fields
      .populate({
        path: 'author',
        model: User,
        select: '_id username profilePhoto', // Select only needed author fields
      })
      .populate({
        path: 'contributions',
        model: Contribution,
        select: '-__v -updatedAt', // Exclude unnecessary contribution fields
        populate: {
          path: 'author',
          model: User,
          select: '_id username profilePhoto', // Select only needed author fields
        },
      })
      .lean()  // Return plain JavaScript object
      .exec();

    if (!story) {
      return new Response("Story not found", { status: 404 });
    }

    // Increment the totalViews field (you might want to consider a more efficient way to do this)
    story.totalViews += 1;
    await Story.findByIdAndUpdate(params.id, { $inc: { totalViews: 1 } }); // Update in the database

    return new Response(JSON.stringify(story), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response("Failed to get story", { status: 500 });
  }
};
