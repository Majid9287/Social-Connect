import Contribution from "@lib/models/Contribution";
import { pusherServer } from "@/lib/pusher";
import { connectToDB } from "@lib/mongodb/mongoose";

export const POST = async (req, { body, params }) => {
  try {
    await connectToDB();
    const { id,contributionId } = params;
    const data = await req.formData();
    
    const content = data.get("content");
    console.log("sws",id,content)
    const updatedContribution = await Contribution.findById(contributionId);
    if (!updatedContribution) {
      console.log("Contribution not found")
      return new Response("Contribution not found", { status: 404 });
    }

    // Update the contribution content
    updatedContribution.content = content;   
    await updatedContribution.save();
    pusherServer.trigger(`story-${id}-contribution-update`, 'contribution-update', { updatedContribution });

    return new Response(JSON.stringify(updatedContribution ), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response("Failed to update contribution", { status: 500 });
  }
};
