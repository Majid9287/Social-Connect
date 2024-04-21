import Contribution from "@lib/models/Contribution";
import Story from "@lib/models/Story";
import { connectToDB } from "@lib/mongodb/mongoose";

export const DELETE = async (req, { params }) => {
  try {
    await connectToDB();
    const { id } = params;

    // Check if the contribution exists
    const contribution = await Contribution.findById(id);
    if (!contribution) {
      return new Response("Contribution not found", { status: 404 });
    }

    // Remove the contribution ID from the corresponding story
    const story = await Story.findById(contribution.Story);
    if (story) {
      story.contributions = story.contributions.filter(
        (contributionId) => contributionId.toString() !== id
      );
      await story.save();
    }

    // Delete the contribution
    await contribution.delete();

    return new Response("Contribution deleted successfully", { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response("Failed to delete contribution", { status: 500 });
  }
};
