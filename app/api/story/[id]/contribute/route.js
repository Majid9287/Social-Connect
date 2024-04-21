import Contribution from "@lib/models/Contribution";
import Story from "@lib/models/Story";
import User from "@lib/models/User";
import { connectToDB } from "@lib/mongodb/mongoose";

export const POST = async (req, { body, params }) => {
  try {
    await connectToDB();
    const data = await req.formData();
console.log(body)
const content = data.get("content");
const authorId = data.get("authorId");
    
    const { id } = params;
    console.log("dadadad",content, authorId,id)
    // Check if the story exists
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
      Story: id,
    });

    // Save the contribution to the database
    await contribution.save();

    // Update the corresponding story document with the contribution ID
    story.contributions.push(contribution._id);
    await story.save();

    return new Response(JSON.stringify(contribution), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response("Failed to add contribution", { status: 500 });
  }
};
