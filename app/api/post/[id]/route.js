import Post from "@lib/models/Post";
import { connectToDB } from "@lib/mongodb/mongoose";
import { writeFile } from "fs/promises";

export const GET = async (req, { params }) => {
  try {
    await connectToDB();

    const post = await Post.findById(params.id)
      .populate("creator likes")
      .exec();

    return new Response(JSON.stringify(post), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response("Fail to get post by id", { status: 500 });
  }
};

export const POST = async (req, { params }) => {
  try {
    // Connect to the database
    await connectToDB();

    // Get form data from the request
    const data = await req.formData();

    // Get media URL and type from the form data
    const mediaUrl = data.get("media");
    const mediaType = data.get("type");
    if (!mediaUrl) {
      // If media URL is not provided, return an error response
      return new Response("Media URL is required", { status: 400 });
    }
    // Create media object with URL and type
    const media = {
      url: mediaUrl,
      type: mediaType,
    };

    // Update the post with media
    const post = await Post.findByIdAndUpdate(
      params.id,
      {
        $push: { media: media }, // Add media to the media array
        $set: {
          caption: data.get("caption"),
          tag: data.get("tag"),
        },
      },
      { new: true, useFindAndModify: false } // Return the updated post
    );

    // Save the updated post
    await post.save();

    // Return the updated post as a response
    return new Response(JSON.stringify(post), { status: 200 });
  } catch (err) {
    // Handle errors
    console.error(err);
    return new Response("Failed to update the post", { status: 500 });
  }
};


