import  Comment  from "./Comment";

export function CommentList({ comments, postId, userData }) {
  return comments.map(comment => (
    <div key={comment._id} className="">
      <Comment comment={comment} postId={postId} userData={userData}  />
    </div>
  ));
}
