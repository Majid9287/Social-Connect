import Contribution from "@lib/models/Contribution";

import { connectToDB } from "@lib/mongodb/mongoose";

export const POST = async (req, { body, params }) => {
  try {
    await connectToDB();
    const { id } = params;
    const data = await req.formData();
    
    const content = data.get("content");
    console.log("sws",id,content)
    const contribution = await Contribution.findById(id);
    if (!contribution) {
      console.log("Contribution not found")
      return new Response("Contribution not found", { status: 404 });
    }

    // Update the contribution content
    contribution.content = content;
    await contribution.save();

    return new Response(JSON.stringify(contribution), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response("Failed to update contribution", { status: 500 });
  }
};
