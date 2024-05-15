import Post from "@lib/models/Post"
import User from "@lib/models/User"
import { connectToDB } from "@lib/mongodb/mongoose"
import { pusherServer } from "@lib/pusher";
export const POST = async (req) => {
  try {
    await connectToDB();

    const data = await req.formData();

    // Get media URL and type from the form data
    const mediaUrl = data.get("media");
    const mediaType = data.get("type");

    // Check if media URL is present
    if (!mediaUrl) {
      // If media URL is not provided, return an error response
      return new Response("Media URL is required", { status: 400 });
    }

    // Create a new post with media URL and type
    const newPost = await Post.create({
      creator: data.get("creatorId"),
      caption: data.get("caption"),
      tag: data.get("tag"),
      media: { url: mediaUrl, type: mediaType }
    });

    // Save the new post
    await newPost.save();

    // Update the user's posts array
    await User.findByIdAndUpdate(
      data.get("creatorId"),
      { $push: { posts: newPost._id } },
      { new: true, useFindAndModify: false }
    );
    pusherServer.trigger("post-updates", "new-post", newPost);
    // Return success response with the new post
    return new Response(JSON.stringify(newPost), { status: 200 });
  } catch (err) {
    console.error(err);
    // Return error response if an error occurs
    return new Response("Failed to create a new post", { status: 500 });
  }
};
