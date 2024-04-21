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

    // Update the contribution status to "hidden" (or any other appropriate status)
    contribution.status = "hidden"; // Update the status as needed
    await contribution.save();

    return new Response("Contribution hidden successfully", { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response("Failed to hide contribution", { status: 500 });
  }
};
