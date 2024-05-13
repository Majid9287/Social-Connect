import { useState, useEffect } from "react";
import { Favorite, FavoriteBorder } from "@mui/icons-material";
import Image from "next/image";
import { pusherClient } from "@lib/pusher";

const CommentsSection = ({ postId, userData }) => {
  const [comments, setComments] = useState([]);
  const [replyInput, setReplyInput] = useState("");
  const [show, setShow] = useState("");
  const [likedComments, setLikedComments] = useState([]);

  useEffect(() => {
    const commentChannel = pusherClient.subscribe(`comments-${postId}`);
    const likeChannel = pusherClient.subscribe(`likes-${postId}`);
    const deleteChannel = pusherClient.subscribe(`deletes-${postId}`);

    commentChannel.bind("new-comment", (newComment) => {
      setComments((prevComments) => [...prevComments, newComment]);
    });

    likeChannel.bind("like", ({ commentId, liked }) => {
      setLikedComments((prevLikedComments) =>
        liked
          ? [...prevLikedComments, commentId]
          : prevLikedComments.filter((id) => id !== commentId)
      );
    });

    deleteChannel.bind("delete", (deletedCommentId) => {
      setComments((prevComments) =>
        prevComments.filter((comment) => comment._id !== deletedCommentId)
      );
    });

    return () => {
      pusherClient.unsubscribe(`comments-${postId}`);
      pusherClient.unsubscribe(`likes-${postId}`);
      pusherClient.unsubscribe(`deletes-${postId}`);
    };
  }, [postId]);

  useEffect(() => {
    // Fetch comments when the component mounts
    getCommentDetails(postId);
  }, [postId]);

  const getCommentDetails = async (postId) => {
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
    }
  };

  const handleReplyInputChange = (e) => {
    setReplyInput(e.target.value);
  };

  const handleAddComment = async () => {
    try {
      const res = await fetch(`/api/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          postId,
          content: replyInput,
          userId: userData._id,
        }),
      });
      if (res.ok) {
        // Assuming the comment is successfully added, you can update the UI accordingly
        console.log("Comment submitted successfully");
        // You might want to fetch comments again to update the UI with the new comment
        getCommentDetails(postId);
      } else {
        console.error("Failed to submit comment");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleReplySubmit = async (commentId) => {
    try {
      const res = await fetch(`/api/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          postId,
          parentId: commentId,
          content: replyInput,
          userId: userData._id,
        }),
      });
      if (res.ok) {
        // Assuming the reply is successfully added, you can update the UI accordingly
        console.log("Reply submitted successfully");
        // You might want to fetch comments again to update the UI with the new reply
        getCommentDetails(postId);
      } else {
        console.error("Failed to submit reply");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleLikeClick = async (commentId) => {
    try {
      const res = await fetch(`/api/comments/${postId}/${commentId}/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: userData._id }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.liked) {
          setLikedComments((prevLikedComments) => [
            ...prevLikedComments,
            userData._id,
          ]);
        } else {
          setLikedComments((prevLikedComments) =>
            prevLikedComments.filter((id) => id !== userData._id)
          );
        }
      } else {
        console.error("Failed to like comment");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteClick = async (commentId) => {
    try {
      const res = await fetch(`/api/comments/${postId}/${commentId}/delete`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (res.ok) {
        // Assuming the comment is successfully deleted, you can update the UI accordingly
        console.log("Comment deleted successfully");
        // You might want to fetch comments again to update the UI without the deleted comment
        getCommentDetails(postId);
      } else {
        console.error("Failed to delete comment");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleReplyToCommentId = (commentId) => {
    setShow(commentId);
    setReplyInput(""); // Clear reply input when replying to a comment
  };

  return (
    <div className="border-t border-gray-700 pt-4">
      <div className="flex items-center mb-4">
        <input
          className="border rounded-md p-2 mr-2 w-full"
          rows={2}
          placeholder="Type your comment..."
          value={replyInput}
          onChange={handleReplyInputChange}
        />
        <button
          className="bg-blue-500 text-white px-3 py-1 rounded-md"
          onClick={handleAddComment}
        >
          Comment
        </button>
      </div>
      {comments.length > 0 && (
        <ul className="list-none space-y-2 pl-4 pb-2">
          {comments.map((comment) => (
            <li
              key={comment._id}
              className="items-center border-l border-gray-700 pl-4 relative"
            >
              <div className="flex space-x-2">
                {" "}
                <div className="flex space-x-1">
                  <Image
                    src={comment.user.profilePhoto}
                    alt="profile photo"
                    width={30}
                    height={30}
                    className="rounded-full "
                  />
                  <p className="text-sm font-medium text-blue-500">
                    {comment.user.username}
                  </p>
                  {comment.parentId && (
                    <p className="text-xs text-blue-500">
                      @{comment.parentUsername}
                    </p>
                  )}
                </div>
                <p className="text-xs text-light-3">{comment.content}</p>
              </div>
              <div className="flex space-x-3">
                <div className="flex">
                  <button
                    className="mr-1 focus:outline-none"
                    onClick={() => handleLikeClick(comment._id)}
                  >
                    {comment.liked.includes(userData._id) ? (
                      <Favorite className="text-red-500" />
                    ) : (
                      <FavoriteBorder className="text-red-500" />
                    )}
                  </button>
                  <div className="text-black">{comment.liked.length}</div>
                </div>
                <button
                  className="mr-2 focus:outline-none text-blue-500"
                  onClick={() => handleReplyToCommentId(comment._id)}
                >
                  Reply
                </button>
              </div>
              {/* Reply input */}
              {show === comment._id && (
                <div className="flex items-center">
                  <input
                    className="border rounded-md p-2 mr-2 w-full text-black"
                    rows={2}
                    placeholder="Type your reply..."
                    value={replyInput}
                    onChange={handleReplyInputChange}
                  />
                  <button
                    className="bg-blue-500 text-white px-3 py-1 rounded-md"
                    onClick={() => handleReplySubmit(comment._id)}
                  >
                    Reply
                  </button>
                </div>
              )}
              <button
                className="mr-2 focus:outline-none"
                onClick={() => handleDeleteClick(comment._id)}
              >
                Delete
              </button>
              {/* comment.replies.length */}
              {comment.replies.length > 0 && (
                <>
                  <li
                    key={comment._id}
                    className="items-center border-l border-gray-700 pl-4 relative"
                  >
                    <div className="flex space-x-2">
                      {" "}
                      <div className="flex space-x-1">
                        <Image
                          src={comment.user.profilePhoto}
                          alt="profile photo"
                          width={30}
                          height={30}
                          className="rounded-full "
                        />
                        <p className="text-sm font-medium text-blue-500">
                          {comment.user.username}
                        </p>
                        {comment.parentId && (
                          <p className="text-xs text-blue-500">
                            @{comment.parentUsername}
                          </p>
                        )}
                      </div>
                      <p className="text-xs text-light-3">{comment.content}</p>
                    </div>
                    <div className="flex space-x-3">
                      <div className="flex">
                        <button
                          className="mr-1 focus:outline-none"
                          onClick={() => handleLikeClick(comment._id)}
                        >
                          {comment.liked.includes(userData._id) ? (
                            <Favorite className="text-red-500" />
                          ) : (
                            <FavoriteBorder className="text-red-500" />
                          )}
                        </button>
                        <div className="text-black">{comment.liked.length}</div>
                      </div>
                      <button
                        className="mr-2 focus:outline-none text-blue-500"
                        onClick={() => handleReplyToCommentId(comment._id)}
                      >
                        Reply
                      </button>
                    </div>
                    {/* Reply input */}
                    {show === comment._id && (
                      <div className="flex items-center">
                        <input
                          className="border rounded-md p-2 mr-2 w-full text-black"
                          rows={2}
                          placeholder="Type your reply..."
                          value={replyInput}
                          onChange={handleReplyInputChange}
                        />
                        <button
                          className="bg-blue-500 text-white px-3 py-1 rounded-md"
                          onClick={() => handleReplySubmit(comment._id)}
                        >
                          Reply
                        </button>
                      </div>
                    )}
                    <button
                      className="mr-2 focus:outline-none"
                      onClick={() => handleDeleteClick(comment._id)}
                    >
                      Delete
                    </button>
                    
                  </li>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CommentsSection;
