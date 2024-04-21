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

    // Increment the likes count or perform any other logic based on your application requirements
    contribution.likes++; // Increment likes count

    // Save the updated contribution
    await contribution.save();

    return new Response("Contribution liked successfully", { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response("Failed to like contribution", { status: 500 });
  }
};
