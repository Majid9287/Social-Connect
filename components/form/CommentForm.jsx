// CommentForm.js
import React, { useState } from "react";

const CommentForm = ({ onCommentSubmit,parentId }) => {
  const [replyInput, setReplyInput] = useState("");

  const handleReplyInputChange = (e) => {
    setReplyInput(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Call the callback function passed from the parent component
    onCommentSubmit(replyInput,parentId);
    // Clear the input field
    setReplyInput("");
  };

  return (
    <form onSubmit={handleSubmit}>
      {" "}
      <div className="flex items-center my-4">
        <input
          type="text"
          value={replyInput}
          className="border rounded-md p-2 mr-2 w-full text-black"
          onChange={handleReplyInputChange}
          placeholder="Type your comment..."
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-3 py-1 rounded-md"
        >
          Post
        </button>
      </div>
    </form>
  );
};

export default CommentForm;
