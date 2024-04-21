import Contribution from "@lib/models/Contribution";
import { connectToDB } from "@lib/mongodb/mongoose";

export const PUT = async (req, { params }) => {
  try {
    await connectToDB();
    const { id } = params;

    // Check if the contribution exists
    const contribution = await Contribution.findById(id);
    if (!contribution) {
      return new Response("Contribution not found", { status: 404 });
    }

    // Decrement the dislikes count or perform any other logic based on your application requirements
    contribution.dislikes++; // Increment dislikes count

    // Save the updated contribution
    await contribution.save();

    return new Response("Contribution disliked successfully", { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response("Failed to dislike contribution", { status: 500 });
  }
};
