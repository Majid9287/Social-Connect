"use client";

import { useUser } from "@clerk/nextjs";
import Loader from "@components/Loader";
import Posting from "@components/form/StoryPosting";
import { useEffect, useState } from "react";

const CreatePost = () => {
  const { user, isLoaded } = useUser();

  const [loading, setLoading] = useState(true);

  const [userData, setUserData] = useState({});

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
    title: "",
    content: "",
    visibility: "",
  };

    
  return loading || !isLoaded ? (
    <Loader />
  ) : (
    
    <div className="pt-6">
      <Posting story={postData} apiEndpoint={"/api/story/new"} />
    </div>
  );
};

export default CreatePost;
