"use client";

import { useUser } from "@clerk/nextjs";
import Loader from "@components/Loader";
import Posting from "@components/form/StoryPosting";
import { useEffect, useState } from "react";

import { useParams } from "next/navigation";
const CreatePost = () => {
  const { user, isLoaded } = useUser();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);

  const [userData, setUserData] = useState({});
  const [Data, setData] = useState({});

  const getPost = async () => {
    const response = await fetch(`/api/story/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    setData(data);
    setLoading(false);
  };

  useEffect(() => {
    getPost();
  }, [id]);

  const getUser = async () => {
    const response = await fetch(`/api/user/${user.id}`);
    const data = await response.json();
    setUserData(data);
    setLoading(false);
  };

  useEffect(() => {
    if (user) {
      getUser();
    }
  }, [user]);
console.log(userData)
  const postData = {
    authorId: userData?._id,
    title: Data.title,
    content: Data.content,
    visibility: Data.visibility,
  };

  return loading || !isLoaded ? (
    <Loader />
  ) : (
    <div className="pt-6">
      <Posting story={postData} apiEndpoint={`/api/story/${id}/storyUpdate`} />
    </div>
  );
};

export default CreatePost;
