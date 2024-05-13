import { pusherServer } from "@lib/pusher";
import Comment from "@lib/models/Comment";
import User from "@lib/models/User";
import Post from "@lib/models/Post"
import { connectToDB } from "@lib/mongodb/mongoose"

export const POST = async (req) => {
  try {
    await connectToDB();

    const body = await req.json();

    const { postId, parentId, content, userId } = body;
    console.log(postId, parentId, content, userId )

    let newComment;

    if (parentId) {
      // If parentId is available, it's a reply to a parent comment
      const parentComment = await Comment.findById(parentId);

      // Create a new comment
      newComment = await Comment.create({
        postId,
        parentId,
        content,
        user: userId,
      });

      // Push the new comment to the replies of the parent comment
      parentComment.replies.push(newComment._id);
      await parentComment.save();
    } else {
      // If parentId is not available, it's a top-level comment
      newComment = await Comment.create({
        postId,
        content,
        user: userId,
      });

      // Push the new comment ID to the post's comments array
      await Post.findByIdAndUpdate(postId, { $push: { comments: newComment._id } });
    }

    // Trigger a Pusher event to notify clients about the new comment
    pusherServer.trigger(`post-${postId}-comments`, "new-comment", newComment);

    return new Response(JSON.stringify(newComment), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response("Failed to create a new comment", { status: 500 })
  }
};