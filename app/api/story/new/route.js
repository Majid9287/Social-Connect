import Story from "@lib/models/Story";
import User from "@lib/models/User";
import { connectToDB } from "@lib/mongodb/mongoose";
import { pusherServer } from "@lib/pusher";

import Contribution from "@lib/models/Contribution";
export const POST = async (req) => {
  
  try {
    await connectToDB();

    const data = await req.formData();
    // Extract story data from form data
    const title = data.get("title");
    const content = data.get("content");
    const visibility = data.get("visibility");
    const authorId = data.get("authorId");

    // Create new story instance
    const newStory = new Story({
      title,
      content,
      visibility,
      author: authorId,
    });

    // Save the new story to the database
    await newStory.save();

    // Update the user's stories array
    await User.findByIdAndUpdate(
      authorId,
      { $push: { stories: newStory._id } },
      { new: true, useFindAndModify: false }
    );
    const story = await Story.findById(newStory._id)
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
    pusherServer.trigger("story-updates", "new-story",  story);
    return new Response(JSON.stringify(newStory), { status: 200 });
   
  } catch (err) {
    console.error(err);
    return new Response("Failed to create a new story", { status: 500 });
  }
};
