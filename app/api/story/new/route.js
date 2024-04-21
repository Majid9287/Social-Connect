import Story from "@lib/models/Story";
import User from "@lib/models/User";
import { connectToDB } from "@lib/mongodb/mongoose";

export const POST = async (req) => {
  
  try {
    await connectToDB();

    const data = await req.formData();
console.log(data)
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

    return new Response(JSON.stringify(newStory), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response("Failed to create a new story", { status: 500 });
  }
};
