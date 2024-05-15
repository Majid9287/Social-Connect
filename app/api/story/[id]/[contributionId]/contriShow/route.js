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

    // Update the contribution status to "show" (or any other appropriate status)
    contribution.status = "show"; // Update the status as needed
    await contribution.save();

    return new Response("Contribution shown successfully", { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response("Failed to show contribution", { status: 500 });
  }
};
