import {
  Bookmark,
  BookmarkBorder,
  BorderColor,
  Delete,
  Comment,
  Favorite,
  FavoriteBorder,
} from "@mui/icons-material";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { CommentList } from "./CommentList";
import { pusherClient } from "@lib/pusher";
import CommentForm from "../form/CommentForm";
const PostCard = ({ post, creator, loggedInUser, update }) => {
  const [userData, setUserData] = useState({});

  const [loading, setLoading] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [ isLiked, setisLiked] = useState( post.likes.find((item) => item == userData?._id));
  const [isSaved,setisSaved] =useState( userData?.savedPosts?.find((item) => item._id === post._id))
  const getUser = async () => {
    const response = await fetch(`/api/user/${loggedInUser.id}`);
    const data = await response.json();
    setisLiked( post.likes.find((item) => item == data?._id))
    setisSaved(data?.savedPosts?.find((item) => item._id === post._id))
    setUserData(data);
  };

  useEffect(() => {
    getUser();
  }, []);


  
  const handleSave = async () => {
    setisSaved(!isSaved)
    const response = await fetch(
      `/api/user/${loggedInUser.id}/save/${post._id}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    const data = await response.json();
    setUserData(data);
    update();
  };

  const handleLike = async () => {
    setisLiked(!isLiked)
    try {
      const response = await fetch(
        `/api/post/${post._id}/${userData?._id}/likePost/`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (response.ok) {
        // Handle success
        //  update(); // Refresh data after show operation
      } else {
        console.error("Failed to show contribution");
      }
    } catch (error) {
      console.error("Error showing contribution:", error);
    }
  };

  const handleDelete = async () => {
  
    await fetch(`/api/post/${post._id}/${userData._id}`, {
      method: "DELETE",
    });
    update();
  };

  const toggleComments = () => {
    setShowComments(!showComments); // Toggle comment visibility
  };
  const handleAddComment = async (content, parentId) => {
    try {
      const res = await fetch(`/api/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          postId: post?._id,
          content: content,
          userId: userData?._id,
        }),
      });
      if (res.ok) {
        console.log("Comment submitted successfully");
        getCommentDetails(post?._id);
      } else {
        console.error("Failed to submit comment");
      }
    } catch (error) {
      console.error(error);
    }
  };
  useEffect(() => {
    const commentChannel = pusherClient.subscribe(`post-${post?._id}-comments`);
    const likeChannel = pusherClient.subscribe(`comment-${post?._id}-liked`);
    const PostlikeChannel = pusherClient.subscribe(`post-${post?._id}-liked`);
    PostlikeChannel.bind("like", ({ id, liked }) => {
      console.log("puser like");
     update();
    });

    const deleteChannel = pusherClient.subscribe(
      `comment-${post?._id}-deleted`
    );

    commentChannel.bind("all-comments", (allComments) => {
      getCommentDetails(post?._id);
      setComments(allComments);
    });

    likeChannel.bind("like", ({ commentId, liked }) => {
      getCommentDetails(post?._id);
      setComments((prevComments) => {
        const updatedComments = updateNestedComments(
          prevComments,
          commentId,
          liked
        ); // Pass liked state
        return updatedComments;
      });
    });

    deleteChannel.bind("delete", ({ commentId }) => {
      getCommentDetails(post?._id);
      setComments((prevComments) => {
        const updatedComments = deleteNestedComment(prevComments, commentId);
        return updatedComments;
      });
    });

    return () => {
      pusherClient.unsubscribe(`post-${post?._id}-liked`);
      pusherClient.unsubscribe(`post-${post?._id}-comments`);
      pusherClient.unsubscribe(`comment-${post?._id}-liked`);
      pusherClient.unsubscribe(`comment-${post?._id}-deleted`);
    };
  }, [post]);

  const updateNestedComments = (comments, commentId, updatedLikedArray) => {
    return comments.map((comment) => {
      if (comment._id === commentId) {
        // Update the 'liked' array directly
        return {
          ...comment,
          liked: updatedLikedArray,
          likes: updatedLikedArray.length,
        }; // Update likes count
      } else if (comment.replies && comment.replies.length > 0) {
        return {
          ...comment,
          replies: updateNestedComments(
            comment.replies,
            commentId,
            updatedLikedArray
          ),
        };
      }
      return comment;
    });
  };

  const deleteNestedComment = (comments, commentId) => {
    return comments.filter((comment) => {
      if (comment._id === commentId) {
        return false;
      } else if (comment.replies && comment.replies.length > 0) {
        comment.replies = deleteNestedComment(comment.replies, commentId);
      }
      return true;
    });
  };

  useEffect(() => {
    // Fetch comments when the component mounts
    getCommentDetails(post?._id);
  }, [post]);

  const getCommentDetails = async (postId) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/comments/${postId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      setComments(data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <div className="w-full mb-2 rounded-lg flex flex-col gap-4 bg-dark-1 p-5 max-sm:gap-2">
        <div className="flex justify-between">
          <Link href={`/profile/${creator._id}/posts`}>
            <div className="flex gap-3 items-center">
              <Image
                src={creator.profilePhoto}
                alt="profile photo"
                width={50}
                height={50}
                className="rounded-full"
              />
              <div className="flex flex-col gap-1">
                <p className="text-small-semibold text-light-1">
                  {creator.firstName} {creator.lastName}
                </p>
                <p className="text-subtle-medium text-light-3">
                  @{creator.username}
                </p>
              </div>
            </div>
          </Link>

          {loggedInUser.id === creator.clerkId && (
            <Link href={`/edit-post/${post._id}`}>
              <BorderColor sx={{ color: "white", cursor: "pointer" }} />
            </Link>
          )}
        </div>

        <p className="text-body-normal text-light-1 max-sm:text-small-normal">
          {post.caption}
        </p>

        {post?.media[0].type == "image" ? (
          <img
            src={post?.media[0].url}
            alt="post photo"
            width={200}
            height={150}
            className="rounded-lg w-full"
          />
        ) : (
          <>
            <video
              controls
              className="object-cover rounded-lg"
              width="100%"
              height="100%"
            >
              <source src={post?.media[0].url} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </>
        )}

        <p className="text-base-semibold text-purple-1 max-sm:text-small-normal">
          {post.tag}
        </p>

        <div className="flex justify-between">
          <div className="flex gap-2 items-center">
            {isLiked ? (
              <Favorite
                sx={{ color: "red", cursor: "pointer" }}
                onClick={() => handleLike()}
              />
            ) : (
              <FavoriteBorder
                sx={{ color: "white", cursor: "pointer" }}
                onClick={() => handleLike()}
              />
            )}
            <p className="text-light-1">{post.likes.length}</p>
          </div>
          <Comment
            sx={{ color: "white", cursor: "pointer" }}
            onClick={toggleComments}
          />{" "}
          {/* Comment icon */}
          {loggedInUser.id !== creator.clerkId &&
            (isSaved ? (
              <Bookmark
                sx={{ color: "purple", cursor: "pointer" }}
                onClick={() => handleSave()}
              />
            ) : (
              <BookmarkBorder
                sx={{ color: "white", cursor: "pointer" }}
                onClick={() => handleSave()}
              />
            ))}
          {loggedInUser.id === creator.clerkId && (
            <Delete
              sx={{ color: "white", cursor: "pointer" }}
              onClick={() => handleDelete()}
            />
          )}
        </div>
      </div>{" "}
      <div className="w-full  rounded-b-lg flex flex-col gap-4 bg-white px-5 max-sm:gap-2">
        {showComments && (
          <>
            <CommentForm onCommentSubmit={handleAddComment} />
            {loading && (
              <>
                <div className="text-blue-500">Loading....</div>
              </>
            )}
            {comments != null && comments.length > 0 && (
              <div className="py-1">
                <CommentList
                  comments={comments}
                  postId={post._id}
                  userData={userData}
                />
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default PostCard;
