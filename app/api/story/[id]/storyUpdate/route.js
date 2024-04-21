import Story from "@lib/models/Story";
import User from "@lib/models/User";
import { connectToDB } from "@lib/mongodb/mongoose";

export const POST = async (req, { params }) => {
  try {
    await connectToDB();

    const { id } = params;

    // Find the existing story by ID
    const existingStory = await Story.findById(id);
    if (!existingStory) {
      return new Response("Story not found", { status: 404 });
    }

    const data = await req.formData();

    // Extract updated story data from form data
    const updatedTitle = data.get("title");
    const updatedContent = data.get("content");
    const updatedVisibility = data.get("visibility");

    // Update the story fields
    existingStory.title = updatedTitle;
    existingStory.content = updatedContent;
    existingStory.visibility = updatedVisibility;

    // Save the updated story to the database
    const updatedStory = await existingStory.save();

    return new Response(JSON.stringify(updatedStory), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response("Failed to update the story", { status: 500 });
  }
};
