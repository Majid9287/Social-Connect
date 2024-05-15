import { useState, useEffect } from "react";
import { Favorite, FavoriteBorder } from "@mui/icons-material";
import Image from "next/image";
import { pusherClient } from "@lib/pusher";
import { CommentList } from "./CommentList";
import CommentForm from "../form/CommentForm";

const CommentsSection = ({ postId, comment, userData }) => {
  const [show, setShow] = useState("");
  const [loading, setLoading] = useState(false);
  const [likedComment, setLikedComment] = useState(comment.liked?.includes(userData?._id));
  const canDelete = userData?._id === comment.user?._id || userData?.posts?.includes(postId);
  const [areChildrenHidden, setAreChildrenHidden] = useState(true);

  const handleReplySubmit = async (content, parentId) => {
    console.log("sub data",postId,
     parentId,
     content,
    userData._id)
    try {
      const res = await fetch(`/api/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          postId,
          parentId: parentId,
          content: content,
          userId: userData._id,
        }),
      });
      if (res.ok) {
        console.log("Reply submitted successfully");
        getCommentDetails(postId);
      } else {
        console.error("Failed to submit reply");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleLikeClick = async (commentId) => {
    if (likedComment) {
      setLikedComment(false);
    } else {
      setLikedComment(true);
    }
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
        if (likedComment) {
          setLikedComment(false)
        } else {
          
      setLikedComment(true);
        }
      } else {
        console.error("Failed to like comment");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteClick = async (commentId) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/comments/${postId}/${commentId}/delete`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (res.ok) {
        console.log("Comment deleted successfully");
        
      } else {
        console.error("Failed to delete comment");
      }
    } catch (error) {
      console.error(error);
    }finally{setLoading(false);}
  };

  const handleReplyToCommentId = () => {
    console.log("sub" ,postId, comment, userData)
    setShow(!show);
  };

  return (
    <div>
      {comment && (
        <>
          <div className="items-center border-l mb-2 rounded-lg border-gray-700 pl-4 relative">
            <div className="flex space-x-2">
              <div className="flex space-x-1">
                <Image
                  src={comment.user?.profilePhoto}
                  alt="profile photo"
                  width={30}
                  height={30}
                  className="rounded-full "
                />
                <p className="text-sm font-medium text-blue-500">
                  {comment.user?.username}
                </p>
              </div>
              <p className="text-xs text-light-3">{comment.content}</p>
            </div>
            <div className="flex space-x-3">
              <div className="flex">
                <button
                  className="mr-1 focus:outline-none"
                  onClick={() => handleLikeClick(comment._id)}
                >
                  {likedComment? (
                    <Favorite className="text-red-500" />
                  ) : (
                    <FavoriteBorder className="text-red-500" />
                  )}
                </button>
                <div className="text-black">  {comment.liked ? comment.liked.length : 0}</div>
              </div>
              <button
                className="mr-2 focus:outline-none text-blue-500"
                onClick={() => handleReplyToCommentId()}
              >
                Reply
              </button>
              <button
              className="mr-2 text-red-500 focus:outline-none"
              onClick={() => handleDeleteClick(comment._id)}
            >
              {loading?"loading...":"Delete"}
            </button>
            </div>
            {show && (
              <CommentForm
                onCommentSubmit={handleReplySubmit}
                parentId={comment._id}
              />
            )}
           

            {/* Show nested comments stack */}
            {comment.replies?.length > 0 && (
              <>
                <div className={areChildrenHidden ? "hidden" : ""}>
                  {!areChildrenHidden && (
                    <div className="">
                      <CommentList comments={comment.replies} postId={postId} userData={userData} />
                    </div>
                  )}
                </div>
                <button
                  className={`mt-1 text-blue-500 ${
                    !areChildrenHidden ? "hidden" : ""
                  }`}
                  onClick={() => setAreChildrenHidden(false)}
                >
                  Show Replies
                </button>
                <button
                  className={`mt-1 text-blue-500 ${
                    areChildrenHidden ? "hidden" : ""
                  }`}
                  onClick={() => setAreChildrenHidden(true)}
                >
                  Hide Replies
                </button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default CommentsSection;
